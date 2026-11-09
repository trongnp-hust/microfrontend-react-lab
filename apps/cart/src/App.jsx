import { Button, Money } from "@lab/ui";
import { useCart } from "./store";
import styles from "./App.module.css";
export default function Cart({ user = null }) {
  const items = useCart(state => state.items);
  const removeItem = useCart(state => state.removeItem);
  const clearCart = useCart(state => state.clearCart);
  return (
    <section className="panel" aria-label="Giỏ hàng">
      <span className="tag">Remote / cart · 3002</span>
      <h2>Giỏ hàng</h2>
      {!items.length && (
        <p className={styles.empty}>
          Giỏ hàng trống. Hãy thêm một sản phẩm từ Catalog.
        </p>
      )}
      {items.map((item) => (
        <div key={item.id} className={styles.item}>
          <div>
            <strong>{item.name}</strong>
            <p>
              Số lượng: {item.quantity} ·{" "}
              <Money value={item.price * item.quantity} />
            </p>
          </div>
          <Button onClick={() => removeItem(item.id)}>Xóa {item.name}</Button>
        </div>
      ))}
      <p className={styles.total}>
        Tổng cộng:{" "}
        <Money value={items.reduce((n, x) => n + x.price * x.quantity, 0)} />
      </p>
      <Button disabled={!items.length} onClick={clearCart}>
        Xóa giỏ hàng
      </Button>
      <p className="muted">
        {user
          ? "Xin chào " + user.name
          : "Đăng nhập demo ở Shell để xem props truyền xuống."}{" "}
        · Cart sở hữu state và localStorage; chưa có thanh toán thật.
      </p>
    </section>
  );
}
