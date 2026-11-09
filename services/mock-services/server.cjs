
const http = require('node:http');
// These represent two domain services. They intentionally return backend-oriented shapes.
const products = [
  { product_id: 'keyboard', title: 'Bàn phím cơ', unit_price: 1250000, emoji: '⌨️', internal_supplier: 'private-01' },
  { product_id: 'headphones', title: 'Tai nghe studio', unit_price: 1890000, emoji: '🎧', internal_supplier: 'private-02' },
  { product_id: 'mouse', title: 'Chuột không dây', unit_price: 650000, emoji: '🖱️', internal_supplier: 'private-03' },
  { product_id: 'screen', title: 'Màn hình 27 inch', unit_price: 4990000, emoji: '🖥️', internal_supplier: 'private-04' }
];
const inventory = { keyboard: 12, headphones: 5, mouse: 0, screen: 3 };
function createMockServer(domain) {
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (req.method !== 'GET' || req.url !== '/' + domain) {
      res.writeHead(404); return res.end(JSON.stringify({ error: 'NOT_FOUND' }));
    }
    res.end(JSON.stringify(domain === 'products' ? products : inventory));
  });
}
if (require.main === module) {
  createMockServer('products').listen(4101, 'localhost', () => console.log('Products mock http://localhost:4101/products'));
  createMockServer('inventory').listen(4102, 'localhost', () => console.log('Inventory mock http://localhost:4102/inventory'));
}
module.exports = { createMockServer };
