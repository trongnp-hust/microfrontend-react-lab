const { test } = require('node:test');
const assert = require('node:assert/strict');
const { addItem, isProduct } = require('../packages/contracts');
const product = { id: 'a', name: 'A', price: 100 };
test('adding preserves source and merges quantity by id', () => {
  const source = [{ ...product, quantity: 1 }];
  const result = addItem(source, product);
  assert.equal(result[0].quantity, 2);
  assert.equal(source[0].quantity, 1);
  assert.deepEqual(addItem([], product), [{ ...product, quantity: 1 }]);
});
test('rejects invalid cross-app payloads', () => {
  for (const value of [null, {}, { ...product, price: -1 }, { ...product, price: NaN }, { ...product, price: '100' }]) {
    assert.equal(isProduct(value), false);
    assert.throws(() => addItem([], value), TypeError);
  }
});
