
import { useEffect, useState } from 'react';
import { emitAdd } from '@lab/contracts';
import { Button, Money } from '@lab/ui';
import { getCatalog } from './api';
import styles from './App.module.css';
export default function Catalog({ user = null }) {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(''); setData(null);
    getCatalog(controller.signal).then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [attempt]);
  return <section aria-label="Danh mục sản phẩm">
    <div className="row"><div><span className="tag">Remote / catalog · 3001</span><h2>Góc làm việc của bạn</h2></div>
    <label>Tìm sản phẩm <input className={styles.search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Nhập tên sản phẩm…" /></label></div>
    <p className="muted">Catalog → BFF :4000 → Products :4101 + Inventory :4102. BFF ghép dữ liệu cho màn hình này.</p>
    {!data && !error && <p role="status">Đang lấy sản phẩm qua BFF…</p>}
    {error && <div className="panel" role="alert"><p>{error}</p><Button onClick={() => setAttempt(n => n + 1)}>Thử lại API</Button></div>}
    {data && <><p className="muted">Nguồn: {data.meta.bff} · Request ID: {data.meta.requestId}</p>
    {data.warnings.map(w => <p key={w} role="status">{w}</p>)}
    <div className={styles.grid}>{data.items.filter(p => p.name.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))).map(p =>
      <article key={p.id} className={styles.card}><div className={styles.art} aria-hidden="true">{p.icon}</div><h3>{p.name}</h3><p><Money value={p.price}/></p>
      <p>{p.stock === null ? 'Chưa rõ tồn kho' : p.stock === 0 ? 'Hết hàng' : 'Còn ' + p.stock + ' sản phẩm'}</p>
      <Button disabled={!p.canAddToCart} onClick={() => { emitAdd({ id: p.id, name: p.name, price: p.price }); setMessage('Đã thêm ' + p.name); }}>Thêm vào giỏ</Button></article>)}</div></>}
    <p role="status">{message}</p><small>Phiên demo: {user?.name || 'Khách'} · Có thể mở Catalog độc lập ở cổng 3001.</small>
  </section>;
}
