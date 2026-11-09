
const http = require('node:http');
const { randomUUID } = require('node:crypto');

function createBffServer({
  productsUrl = process.env.PRODUCTS_URL || 'http://localhost:4101/products',
  inventoryUrl = process.env.INVENTORY_URL || 'http://localhost:4102/inventory',
  timeoutMs = 1500,
  allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',')
} = {}) {
  async function getJson(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok) throw new Error('Upstream HTTP ' + response.status);
    return response.json();
  }
  return http.createServer(async (req, res) => {
    const requestId = randomUUID();
    const started = Date.now();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('Access-Control-Expose-Headers', 'X-Request-Id');
    res.setHeader('Vary', 'Origin');
    // Allow only the lab's Shell and standalone Catalog origins, not arbitrary clients.
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      res.writeHead(403); return res.end(JSON.stringify({ error: { code: 'ORIGIN_DENIED', message: 'Origin không được phép.' }, requestId }));
    }
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    const send = (status, body) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    if (req.method === 'GET' && req.url === '/health') return send(200, { status: 'ok' });
    if (req.url !== '/api/catalog') return send(404, { error: { code: 'NOT_FOUND', message: 'Không tìm thấy API.' }, requestId });
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Chỉ hỗ trợ GET.' }, requestId }); }
    try {
      // Fan out in parallel; Products is required, Inventory may degrade.
      const [productResult, inventoryResult] = await Promise.allSettled([getJson(productsUrl), getJson(inventoryUrl)]);
      if (productResult.status !== 'fulfilled') throw new Error('Products unavailable');
      const products = productResult.value;
      if (!Array.isArray(products) || !products.every(p => p && typeof p.product_id === 'string' && typeof p.title === 'string' && Number.isSafeInteger(p.unit_price) && p.unit_price >= 0)) throw new Error('Invalid Products response');
      const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : null;
      const inventoryValid = inventory && typeof inventory === 'object' && !Array.isArray(inventory);
      const warnings = [];
      const items = products.map(p => {
        const quantity = inventoryValid ? inventory[p.product_id] : null;
        const stock = Number.isSafeInteger(quantity) && quantity >= 0 ? quantity : null;
        if (stock === null && !warnings.length) warnings.push('Chưa lấy được đầy đủ tồn kho. Tạm ngừng thêm các sản phẩm chưa rõ tồn kho.');
        // UI DTO: whitelist fields. Never return the upstream object by spreading it.
        return { id: p.product_id, name: p.title, price: p.unit_price, icon: typeof p.emoji === 'string' ? p.emoji : '📦', stock, canAddToCart: stock !== null && stock > 0 };
      });
      send(200, { items, warnings, meta: { bff: 'catalog-bff', sources: ['products', 'inventory'], requestId } });
      console.log(JSON.stringify({ service: 'catalog-bff', requestId, status: 200, durationMs: Date.now() - started, degraded: warnings.length > 0 }));
    } catch (error) {
      console.error(JSON.stringify({ service: 'catalog-bff', requestId, message: error.message }));
      send(502, { error: { code: 'CATALOG_UNAVAILABLE', message: 'Không tải được danh mục. Vui lòng thử lại.' }, requestId });
    }
  });
}
if (require.main === module) createBffServer().listen(Number(process.env.PORT || 4000), 'localhost', () => console.log('Catalog BFF http://localhost:' + (process.env.PORT || 4000)));
module.exports = { createBffServer };
