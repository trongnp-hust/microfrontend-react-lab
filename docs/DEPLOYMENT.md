# Build, deploy và CI
## Xem production build tại local
npm run build
npm run serve
Mở http://localhost:3000. Manifest được copy sang Shell dist sau build.
Nếu chỉ build riêng Shell: chạy thêm node scripts/copy-config.cjs từ root.
Preview dùng http-server phục vụ assets thật; không dùng preview này làm webserver production.

## Artifact độc lập
Mỗi apps/<name>/dist là một artifact deploy được. Remote có remoteEntry.js và chunk hashed. Shell có remotes.json trỏ URL remote.
Ba artifact có thể phát hành theo pipeline riêng dù dùng chung repository/lockfile.
Package contracts/UI là build-time dependencies: thay chúng phải chạy checks cho mọi consumer bị ảnh hưởng.

## Hosting thật
Ví dụ publish:
- Shell: https://shop.example.com/
- Catalog: https://cdn.example.com/catalog/releases/2026-11-09.1/
- Cart: https://cdn.example.com/cart/releases/2026-11-09.1/
Sửa Shell remotes.json trỏ tới remoteEntry.js trong thư mục release tương ứng. scope vẫn catalog/cart.
publicPath auto tải chunk tương đối với script remoteEntry, nên upload nguyên dist cùng cấu trúc.
Đặt remotes.json trước location SPA fallback; file manifest thiếu phải trả 404 thật.

Nginx snippet cho Shell (điều chỉnh root theo hạ tầng):
```nginx
server {
  listen 80;
  root /srv/shell;
  include /etc/nginx/mime.types;
  location = /remotes.json { add_header Cache-Control "no-store"; try_files $uri =404; }
  location ~* \.(js|css|map)$ { try_files $uri =404; }
  location / { try_files $uri $uri/ /index.html; }
}
```
Remote là static hosting; file JS không tồn tại phải trả 404, không rewrite thành HTML.
TLS, MIME JavaScript và CSP script-src/connect-src cần cho phép đúng origin tin cậy. Dev server dùng CORS * cho lab; production giới hạn origin khi cần fetch/module assets. Script classic không dựa vào CORS như fetch; CORS không phải sandbox cho remote code.
Source map chứa source: quyết định upload riêng vào error tracker hay công khai theo chính sách đội.

## Cache và rollback
- index.html, remotes.json: no-cache/no-store tùy yêu cầu.
- remoteEntry ở URL ổn định: revalidate, không cache dài.
- release path có version bất biến + hashed chunks: cache dài immutable.
- Upload chunks trước, kiểm tra entry, cuối cùng cập nhật manifest theo thao tác atomic.
- Giữ artifact release cũ ít nhất bằng vòng đời session/cache; không xóa ngay.
- Rollback bằng manifest cũ, reload session. Session đã load remote không được đổi container cùng scope giữa chừng.

## CI
Workflow ví dụ .github/workflows/ci.yml: npm ci → contract test → build → browser E2E. Browser E2E dùng dev server để kiểm tra source federation; cần thêm smoke test trên staging để xác minh CDN, HTTPS, cache/CSP và production artifacts.
Release mỗi app: build target, publish artifact có release ID, smoke standalone và integrated trên staging, kiểm tra tương thích contract, promote manifest và theo dõi error rate. Workflow không tự deploy vì chưa có hạ tầng/tài khoản đích.

## Auth và dữ liệu
Dùng session cookie HttpOnly/Secure/SameSite hoặc cơ chế token theo kiến trúc backend. Không lưu secret vào bundle, không coi user props là quyền thật.
Remote cùng JS context có thể đọc dữ liệu Shell; chỉ nạp remote từ nhà phát hành tin cậy. Cần ranh giới bảo mật mạnh hơn thì cân nhắc iframe sandbox và postMessage kiểm tra origin.
Checkout API nhận productId/quantity, server kiểm tra tồn kho/giá/quyền; có idempotency key, audit và transaction.

## Catalog BFF
Bản lab đã có Catalog BFF Node.js và hai upstream mock. npm run serve khởi động cả BFF/mocks cùng static frontend. Deploy BFF thành service riêng; CATALOG_BFF_URL là cấu hình build public của Catalog, còn PRODUCTS_URL/INVENTORY_URL là cấu hình server. Xem [BFF.md](BFF.md) về reverse proxy, CORS và giới hạn. Frontend không nên gọi upstream trực tiếp.
