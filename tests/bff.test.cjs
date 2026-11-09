
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { createBffServer } = require('../services/catalog-bff/server.cjs');
const { createMockServer } = require('../services/mock-services/server.cjs');
async function start(t, server) {
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return 'http://127.0.0.1:' + server.address().port;
}
test('BFF aggregates HTTP services and exposes only the UI DTO', async t => {
  const products = await start(t, createMockServer('products'));
  const inventory = await start(t, createMockServer('inventory'));
  const base = await start(t, createBffServer({ productsUrl: products + '/products', inventoryUrl: inventory + '/inventory' }));
  const response = await fetch(base + '/api/catalog');
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.items[0].stock, 12);
  assert.equal(data.items[0].name, 'Bàn phím cơ');
  assert.equal(data.items.find(p => p.id === 'mouse').canAddToCart, false);
  assert.equal('internal_supplier' in data.items[0], false);
  assert.equal('product_id' in data.items[0], false);
  assert.deepEqual(data.warnings, []);
  assert.equal(data.meta.requestId, response.headers.get('x-request-id'));
  assert.equal((await fetch(base + '/api/catalog', { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  assert.equal((await fetch(base + '/api/catalog', { method: 'POST' })).status, 405);
  assert.equal((await fetch(base + '/unknown')).status, 404);
});
test('Inventory failure degrades; Products failure returns a sanitized 502', async t => {
  const products = await start(t, createMockServer('products'));
  const broken = await start(t, http.createServer((req, res) => { res.writeHead(503); res.end(); }));
  const base = await start(t, createBffServer({ productsUrl: products + '/products', inventoryUrl: broken }));
  const data = await (await fetch(base + '/api/catalog')).json();
  assert.ok(data.warnings.length);
  assert.ok(data.items.every(p => p.stock === null && !p.canAddToCart));
  const failed = await start(t, createBffServer({ productsUrl: broken, inventoryUrl: broken }));
  const response = await fetch(failed + '/api/catalog');
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error.code, 'CATALOG_UNAVAILABLE');
});
test('slow upstream is bounded by the BFF timeout', async t => {
  const products = await start(t, createMockServer('products'));
  const slow = await start(t, http.createServer(() => {}));
  const base = await start(t, createBffServer({ productsUrl: products + '/products', inventoryUrl: slow, timeoutMs: 50 }));
  const data = await (await fetch(base + '/api/catalog')).json();
  assert.equal(data.items[0].stock, null);
  assert.ok(data.warnings.length);
});
