import './tokens.css';
export function Button({ children, ...props }) { return <button {...props}>{children}</button>; }
export function Money({ value }) { return <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}</span>; }
