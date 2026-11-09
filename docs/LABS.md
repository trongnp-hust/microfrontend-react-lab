# 13 bài thực hành
Mỗi bài có thao tác, điều cần quan sát và tiêu chí hoàn thành.

## 1. Domain và standalone
Chạy từng app bằng npm run dev -w @lab/<tên>. Catalog vẫn cần BFF và upstream: chạy thêm npm run dev -w @lab/catalog-bff và npm run dev -w @lab/mock-services trong hai terminal khác. Đọc entry, bootstrap và App.
Đạt: Catalog/Cart mở độc lập, bạn giải thích vì sao monorepo khác microfrontend.
Catalog standalone phát sự kiện nhưng không có Cart lắng nghe; đây là điều mong đợi.

## 2. Federation và tải lười
Mở Network, lọc remoteEntry và .js. Vào /learn trước, sau đó /.
Đạt: tìm được container, chunk App và shared React; giải thích exposes, scope, publicPath và async bootstrap.
Cart được preload để đăng ký subscriber; Catalog tải theo route.

## 3. React singleton
Trong nhánh thử nghiệm, tắt singleton hoặc đổi requiredVersion không tương thích. Quan sát cảnh báo/runtime.
Đạt: phân biệt shared scope, singleton, version range, eager. Khôi phục config sau bài.
Không có lỗi trong một lần chạy không chứng minh mọi version an toàn; kiểm tra bundle/network.

## 4. Props và phiên demo
Đăng nhập/đăng xuất từ Shell. Quan sát Catalog và Cart.
Đạt: props đổi mà không fetch lại remoteEntry; giải thích vì sao demo user không phải auth bảo mật.
Mở rộng: inject capability canCheckout; server vẫn phải kiểm tra quyền.

## 5. Event contract và ownership
Thêm hai lần, xóa, refresh; xem inspector và contracts.
Thử dispatch CustomEvent với price âm hoặc payload sai.
Đạt: invalid payload bị bỏ qua, quantity đúng, chỉ Cart sửa giỏ.
Mở rộng: tạo host command adapter có trạng thái ready và queue giới hạn; Catalog vẫn xem được khi Cart down, chặn nút thêm hoặc đưa command vào queue. Không im lặng mất command.

## 6. Routing
Đi /cart, Back/Forward, mở URL trực tiếp, thử route không tồn tại.
Đạt: Shell sở hữu top-level router, fallback 404 hoạt động ở dev.
Mở rộng: Catalog nhận basePath hoặc navigate callback, quản lý nested routes; tránh hai BrowserRouter lồng nhau.

## 7. CSS và design system
Đổi App.module.css của Catalog. Thêm thử selector global h2 để quan sát rò rỉ.
Đạt: giải thích class hashing, token global và khác biệt Shadow DOM; bỏ selector gây rò rỉ.
Mở rộng: version package UI và quy định deprecation.

## 8. Failure isolation và recovery
Chạy riêng Shell + Cart, không Catalog. Refresh / → fallback. Bật Catalog và Thử lại.
Đạt: Cart vẫn dùng được; E2E outage test pass. Dùng Network offline/throttle quan sát Suspense.
Mở rộng: timeout, retry exponential backoff có giới hạn, telemetry, circuit breaker. Boundary không bắt event-handler errors.

## 9. Release độc lập và runtime config
Build tất cả rồi serve. Build Catalog khác, host trên cổng 4001 và đổi Shell dist/remotes.json.
Đạt: Shell bundle không đổi; sau reload tải Catalog mới. Khôi phục URL là rollback.
Chỉ lấy URL từ manifest do operator kiểm soát; không lấy remote tùy ý từ query string.
Trong session đang mở, thay container cùng scope không bảo đảm hot-swap; release config mới rồi reload trang.

## 10. Contract / integration / E2E
Chạy npm test và npm run test:e2e. Đọc từng assertion, thử phá quantity và observe test fail.
Đạt: unit bắt sai domain rule; E2E phát hiện tải remote, router, persistence, fallback/retry.
Mở rộng: chạy matrix Shell N/N-1 với remote N/N-1 và contract tests trong pipeline từng team.

## 11. Deployment và vận hành
Theo DEPLOYMENT.md, phân biệt manifest/entry/chunk cache. Thực hành URL chunk 404, sai MIME và CORS.
Đạt: giải thích tại sao xóa chunk release cũ phá session đang mở; rollback không rebuild Shell.
Mở rộng: ghi remote version, URL, latency, correlation ID và release ID vào telemetry backend.

## 12. Capstone
Tự thêm remote Orders :3003, exposes ./App và manifest. Shell thêm /orders.
Không import Cart store. Nhận một event checkout v1 chứa orderId, sau đó lấy dữ liệu qua API mock riêng.
Đạt: chạy standalone, skeleton/error boundary, contract validation, E2E end-to-end và hướng dẫn deploy riêng.
Mở rộng tiếp: BFF, token/session server, feature flag/canary sticky theo user, multi-framework mount/unmount, SSR hoặc single-spa.

## 13. BFF và tổng hợp dữ liệu
Làm theo [BFF.md](BFF.md): quan sát một request browser ghép hai upstream; thử Products down, Inventory down và BFF down.
Đạt: giải thích DTO khác schema backend, phân biệt 502 và 200 degraded, nhận diện Shell và BFF là hai lớp khác nhau. Chạy npm test và E2E API retry.
