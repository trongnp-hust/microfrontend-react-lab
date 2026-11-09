import { create } from "zustand";
import { EVENTS, addItem, isProduct } from "@lab/contracts";

const KEY = "lab:cart:v1";

function readItems() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value)
      ? value.filter(item => isProduct(item) && Number.isSafeInteger(item.quantity) && item.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

// Zustand quản lý state và tự cập nhật component dùng selector.
export const useCart = create(set => ({
  items: readItems(),
  addProduct: product => {
    if (isProduct(product)) {
      set(state => ({ items: addItem(state.items, product) }));
    }
  },
  removeItem: id => set(state => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearCart: () => set({ items: [] })
}));

// Chỉ xử lý lưu trữ và thông báo cho Shell; render do Zustand quản lý.
useCart.subscribe((state, previous) => {
  if (state.items === previous.items) return;
  try {
    const serialized = JSON.stringify(state.items);
    if (localStorage.getItem(KEY) !== serialized) localStorage.setItem(KEY, serialized);
  } catch {
    // Vẫn dùng giỏ trong bộ nhớ nếu trình duyệt chặn storage.
  }
  window.dispatchEvent(new CustomEvent(EVENTS.CHANGED, {
    detail: { count: state.items.reduce((total, item) => total + item.quantity, 0) }
  }));
});

// Catalog gửi sự kiện; action Zustand của Cart cập nhật state.
window.addEventListener(EVENTS.ADD, event => {
  useCart.getState().addProduct(event.detail);
});

window.addEventListener("storage", event => {
  if (event.key === KEY || event.key === null) {
    useCart.setState({ items: readItems() });
  }
});
