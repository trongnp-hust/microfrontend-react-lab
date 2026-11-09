# React Microfrontend Learning Lab
Dự án thực hành bằng **React JavaScript + Webpack 5 Module Federation**. Node.js >=22.15, npm >=10.
Mục tiêu: học thông qua một lát cắt chạy thật và 13 bài lab. Không có một dự án nào bao trùm mọi biến thể microfrontend; các hướng nâng cao được phân biệt rõ ở docs.

## Chạy nhanh
```powershell
cd "D:\Lượng\microfrontend-react-lab"
npm ci
npm run dev
```
Mở http://localhost:3000. Catalog: http://localhost:3001. Cart: http://localhost:3002.
BFF: http://localhost:4000/api/catalog; Products mock :4101, Inventory mock :4102. Dừng toàn bộ bằng Ctrl+C. Lần đầu tạo dự án có sẵn package-lock.json sau npm install.

## Luồng trải nghiệm
1. Thêm cùng sản phẩm hai lần → Cart hiển thị số lượng 2.
2. Event inspector hiển thị tên sự kiện, payload, thời gian.
3. Đăng nhập demo → Shell truyền user xuống remote bằng props.
4. Chuyển /cart, refresh → giỏ còn nhờ localStorage.
5. Mở remote độc lập: mỗi app có entry và React root riêng.
6. Dừng Catalog, refresh Shell → fallback; Cart và điều hướng vẫn hoạt động. Khởi động Catalog rồi bấm Thử lại.

## Cấu trúc
```text
apps/
  shell/       # Layout, routing, cấu hình remote, auth demo, quan sát sự kiện
  catalog/     # Domain sản phẩm, bộ lọc, phát sự kiện thêm giỏ
  cart/        # Domain giỏ, state riêng, lưu trữ, nhận sự kiện
services/
  catalog-bff/ # API dành cho Catalog: tổng hợp Products + Inventory qua HTTP
  mock-services/ # Hai HTTP server mô phỏng backend domain
packages/
  contracts/   # Contract sự kiện v1 và kiểm tra payload
  ui/          # Design tokens, Button, Money; chia sẻ tại build-time
config/        # Factory Webpack dùng chung cho lab
docs/          # Kiến trúc, bài tập, triển khai và vận hành
tests/         # Contract tests + kiểm thử trình duyệt xuyên remote
```

## Lệnh
| Lệnh | Mục đích |
|---|---|
| npm run dev | Chạy 3 frontend + Catalog BFF + backend mocks |
| npm run dev -w @lab/catalog | Chạy riêng Catalog |
| npm test | Contract giỏ và tích hợp HTTP BFF |
| npx playwright install chromium | Cài browser cho E2E, chạy một lần |
| npm run test:e2e | Kiểm thử tích hợp qua frontend và BFF |
| npm run build | Build riêng từng app vào apps/*/dist |
| npm run build -w @lab/catalog | Build độc lập Catalog |
| npm run serve | Xem bản build ở cổng 3000–3002 |
Không chạy dev và serve đồng thời trên cùng cổng. Preview http-server không có SPA rewrite: điều hướng bằng link hoạt động, refresh /cart cần hosting cấu hình fallback như docs/DEPLOYMENT.md.

## Thứ tự học
Đọc [kiến trúc](docs/ARCHITECTURE.md), thực hiện [13 bài lab](docs/LABS.md), đọc [ví dụ BFF](docs/BFF.md), sau đó [triển khai](docs/DEPLOYMENT.md) và [xử lý lỗi](docs/TROUBLESHOOTING.md).

## Giới hạn có chủ đích
Backend domain dùng dữ liệu giả, đăng nhập demo không có bảo mật, có API BFF đọc catalog, chưa có API thanh toán. Frontend không được tự quyết giá và quyền truy cập thật. LocalStorage chỉ mô phỏng lưu giỏ; production cần backend xác thực và tính lại giá.
Remotes cùng document không được cách ly bảo mật. Một remote có JavaScript độc hại có toàn quyền như Shell; Error Boundary chỉ chặn lỗi render/load, không chặn side effect hoặc mọi lỗi async.
Catalog chờ Cart khởi tạo để sự kiện thêm giỏ không bị mất. Đây là phụ thuộc availability có chủ đích để quan sát tradeoff; lab 5 yêu cầu cải tiến adapter/command queue.
UI và contracts là package build-time, không phải remote. Đổi chúng cần build lại consumer. Monorepo là cách tổ chức mã, không tự tạo ra triển khai độc lập.

## Nguồn chính thức
- https://webpack.js.org/concepts/module-federation/
- https://webpack.js.org/plugins/module-federation-plugin/
- https://react.dev/reference/react/lazy
- https://zustand.docs.pmnd.rs/reference/apis/create
- https://playwright.dev/docs/test-webserver
