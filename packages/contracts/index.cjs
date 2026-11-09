const EVENTS = Object.freeze({
  ADD: "lab:cart:add:v1",
  CHANGED: "lab:cart:changed:v1",
});
function isProduct(p) {
  return (
    !!p &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    Number.isSafeInteger(p.price) &&
    p.price >= 0
  );
}
function addItem(items, product) {
  if (!isProduct(product)) throw new TypeError("Invalid product contract v1");
  const found = items.find((item) => item.id === product.id);
  return found
    ? items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    : [...items, { ...product, quantity: 1 }];
}
function emitAdd(product) {
  if (!isProduct(product)) throw new TypeError("Invalid product contract v1");
  window.dispatchEvent(new CustomEvent(EVENTS.ADD, { detail: { ...product } }));
}
module.exports = { EVENTS, isProduct, addItem, emitAdd };
