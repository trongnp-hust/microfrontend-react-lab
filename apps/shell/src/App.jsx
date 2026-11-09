import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { EVENTS } from "@lab/contracts";
import { loadRemote } from "./loadRemote";
import Remote from "./Remote";
import styles from "./App.module.css";
function Shop() {
  const [user, setUser] = useState(null);
  const [cartReady, setCartReady] = useState(false);
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const record = (event) =>
      setLogs((previous) =>
        [
          {
            id: crypto.randomUUID(),
            time: new Date().toLocaleTimeString("vi-VN"),
            type: event.type,
            detail: JSON.stringify(event.detail),
          },
          ...previous,
        ].slice(0, 12),
      );
    Object.values(EVENTS).forEach((type) =>
      window.addEventListener(type, record),
    );
    return () =>
      Object.values(EVENTS).forEach((type) =>
        window.removeEventListener(type, record),
      );
  }, []);
  useEffect(() => {
    // Initialize Cart's event subscriber before letting Catalog emit events.
    loadRemote("cart")
      .then(() => setCartReady(true))
      .catch((error) => {
        console.warn("Cart unavailable", error);
        setCartReady(false);
      });
  }, []);
  return (
    <>
      <header className={styles.header}>
        <span className={styles.brand}>◈ MFE Learning Lab</span>
        <nav className={styles.nav}>
          <NavLink to="/">Cửa hàng</NavLink>
          <NavLink to="/cart">Giỏ hàng</NavLink>
          <NavLink to="/learn">Bản đồ học</NavLink>
        </nav>
        <button
          onClick={() =>
            setUser(user ? null : { id: "demo", name: "Học viên React" })
          }
        >
          {user ? "Đăng xuất demo" : "Đăng nhập demo"}
        </button>
      </header>
      <main>
        <div className={styles.hero}>
          <span className={styles.eyebrow}>
            REACT · MODULE FEDERATION · HANDS-ON
          </span>
          <h1>
            Một trải nghiệm.
            <br />
            Ba ứng dụng độc lập.
          </h1>
          <p>Khám phá ranh giới ứng dụng ngay trên một cửa hàng đang chạy.</p>
          <div className={styles.stats}>
            <span>Shell :3000</span>
            <span>Catalog :3001</span>
            <span>Cart :3002</span>
          </div>
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                {!cartReady && (
                  <div className="panel" role="status">
                    Đang kết nối Cart.{" "}
                    <button
                      onClick={() =>
                        loadRemote("cart")
                          .then(() => setCartReady(true))
                          .catch(console.warn)
                      }
                    >
                      Kết nối lại Cart
                    </button>
                  </div>
                )}
                {cartReady && <Remote name="catalog" user={user} />}
                <Remote name="cart" user={user} />
              </>
            }
          />
          <Route path="/cart" element={<Remote name="cart" user={user} />} />
          <Route
            path="/learn"
            element={
              <section className="panel">
                <h2>Lộ trình thực hành</h2>
                <ol>
                  <li>Mở từng app độc lập ở cổng 3000–3002.</li>
                  <li>
                    Network: tìm remoteEntry.js và các chunk tải theo nhu cầu.
                  </li>
                  <li>Thêm sản phẩm, xem sự kiện v1 bên dưới.</li>
                  <li>Đăng nhập demo, quan sát props từ Shell.</li>
                  <li>Dừng Catalog, tải lại trang, quan sát Error Boundary.</li>
                  <li>Đổi remotes.json để thử phát hành và rollback.</li>
                </ol>
                <p>Đọc README.md và docs/ để làm đủ 12 bài thực hành.</p>
              </section>
            }
          />
          <Route
            path="*"
            element={
              <section className="panel">
                <h2>Không tìm thấy trang</h2>
                <NavLink to="/">Về cửa hàng</NavLink>
              </section>
            }
          />
        </Routes>
        <section className="panel">
          <div className="row">
            <h2>Event inspector</h2>
            <button onClick={() => setLogs([])}>Xóa nhật ký</button>
          </div>
          <p className="muted">
            CustomEvent trong cùng cửa sổ; không truyền sự kiện giữa các tab.
            Cart đồng bộ tab bằng storage event.
          </p>
          <div className={styles.log} aria-live="polite">
            {logs.length ? (
              logs.map((log) => (
                <p key={log.id}>
                  {log.time} · {log.type} · {log.detail}
                </p>
              ))
            ) : (
              <p>
                Thêm hoặc xóa sản phẩm để xem dữ liệu đi qua ranh giới ứng dụng.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Shop />
    </BrowserRouter>
  );
}
