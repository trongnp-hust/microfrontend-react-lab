# Xử lý lỗi
| Triệu chứng | Kiểm tra / cách xử lý |
|---|---|
| Shared module not available for eager consumption | Giữ import('./bootstrap') ở mỗi entry; không import React ngay từ entry sync |
| Invalid hook call | React/react-dom singleton và versions; tìm bản React thứ hai trong Network |
| ScriptExternalLoadError / không tải được remote | Cổng, URL manifest, remoteEntry có thực sự là JS, server có đang chạy |
| ChunkLoadError | Upload đủ dist, publicPath auto, giữ chunks cũ sau release |
| Unexpected token < | Server rewrite file JS thiếu thành index.html; assets thiếu phải 404 |
| Route /cart refresh trả 404 trên preview | Dùng dev server hoặc cấu hình SPA fallback production |
| Không thấy sản phẩm trong giỏ | Catalog chờ Cart ready; scope/contract v1 đúng; standalone hai port khác origin |
| Cart không lưu | localStorage bị chặn hoặc dữ liệu lỗi; app tiếp tục dùng state trong bộ nhớ |
| Đổi manifest không thấy đổi app đang mở | Manifest/container cache trong session; reload trang |
| Port already in use | Dừng dev/serve cũ; không chạy hai bộ cùng lúc |
| Playwright không có browser | npx playwright install chromium |
| Auth mất sau reload | Chủ đích: demo user chỉ nằm trong Shell state |

Retry tạo React.lazy mới và xóa script promise lỗi, không cố xóa container đã thành công.
Lỗi render nghiệp vụ vẫn cần sửa code/release; retry không thay thế fix.

## BFF
Lỗi API: kiểm tra :4000/health và :4000/api/catalog, rồi upstream :4101/products và :4102/inventory. Mở Catalog độc lập vẫn cần BFF/mocks. Inventory lỗi chỉ làm tồn kho chưa rõ; Products lỗi trả 502. CORS mặc định cho localhost:3000 và localhost:3001; origin khác cần ALLOWED_ORIGINS.
