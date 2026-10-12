# Nguyên Tắc Bảo Mật Dự Án (Security Notes)

Tài liệu này quy định các tiêu chuẩn và nguyên tắc an toàn thông tin bắt buộc khi xử lý dữ liệu người dùng, tệp tải lên và đồ họa vector (SVG) trong toàn bộ hệ thống Pi Decor.

---

## 1. Nguyên Tắc Xử Lý Đồ Họa Vector (SVG)

1. **Luôn lọc qua `sanitizeSvg` trước khi lưu vào Database**:
   - Mọi chuỗi SVG đến từ người dùng hoặc người quản trị (bao gồm `svg_base` của phông nền Studio, `svg_data` của asset vector, hoặc thiết kế tùy biến) đều bắt buộc phải được xử lý qua hàm [`sanitizeSvg`](../server/src/utils/sanitizeSvg.js) trước khi ghi vào Postgres.
   - Không được lưu trữ chuỗi SVG thô (raw) trực tiếp vào DB mà không qua bước chuẩn hóa này.

2. **Không render SVG người dùng ngoài khu vực đã sanitize**:
   - Ở phía Client, khi hiển thị SVG thông qua `dangerouslySetInnerHTML`, chỉ được render các trường dữ liệu SVG đã được Server làm sạch (hoặc đã qua DOMPurify).
   - Tuyệt đối không chèn trực tiếp các chuỗi SVG lấy trực tiếp từ input chưa qua xác thực.

3. **Cơ chế hoạt động của `sanitizeSvg` (DOMPurify)**:
   - **Profile chuẩn**: Sử dụng cấu hình nghiêm ngặt `{ USE_PROFILES: { svg: true, svgFilters: true } }`.
   - **Danh sách thẻ cấm (Blacklist tags)**: Triệt để loại bỏ các thẻ có khả năng thực thi mã JavaScript hoặc nhúng tài liệu bên ngoài: `<script>`, `<foreignObject>`, `<iframe>`, `<embed>`, `<object>`.
   - **Danh sách thuộc tính cấm (Blacklist attributes)**: Vô hiệu hóa toàn bộ các inline event handler (bất kỳ thuộc tính nào bắt đầu bằng `on*` như `onload`, `onerror`, `onclick`, ...).
   - **Kiểm soát liên kết (`href` / `xlink:href`)**:
     - Chỉ chấp nhận anchor nội bộ (bắt đầu bằng `#id`, ví dụ: `fill="url(#goldGrad)"` hoặc `<use href="#icon"/>`).
     - Chỉ chấp nhận Data URI ảnh an toàn (`data:image/(png|jpeg|webp|gif);base64,...`).
     - Loại bỏ toàn bộ `javascript:`, liên kết HTTP/HTTPS ra ngoài hoặc mã hóa entity.
   - **Bảo vệ thẻ `<style>`**:
     - Giữ lại các bộ chọn và thuộc tính CSS cần thiết cho việc vẽ giao diện.
     - Tự động bóc tách và loại bỏ hoàn toàn các chỉ thị `@import`.
     - Chuyển đổi mọi hàm `url(...)` trỏ tới liên kết bên ngoài (HTTP/HTTPS) thành `none` nhằm ngăn chặn tấn công CSS Data Exfiltration / CSS Injection.

---

## 2. Nguyên Tắc Tải Tệp Hình Ảnh (Image Uploads)

1. **Allowlist MIME Type nghiêm ngặt**:
   - Bộ middleware [`uploadImage`](../server/src/utils/uploadImage.js) chỉ chấp nhận 4 định dạng ảnh raster:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/gif`
   - Tuyệt đối không cho phép định dạng `image/svg+xml` đi qua route tải ảnh thông thường. Các file có MIME type không nằm trong allowlist sẽ bị từ chối ngay lập tức với HTTP 400.

2. **Bảo vệ phần mở rộng tệp khi lưu trữ cục bộ**:
   - Khi lưu tệp vào thư mục `uploads/` trên đĩa (`diskStorage`), phần mở rộng tệp (`.jpg`, `.png`, `.webp`, `.gif`) được suy ra trực tiếp từ MIME type đã qua kiểm duyệt (`ALLOWED_IMAGE_MIME_TYPES`).
   - Không sử dụng `path.extname(file.originalname)` từ client gửi lên để ngăn chặn kỹ thuật đặt tên kép (`shell.php.jpg`), path traversal hoặc giả mạo extension.

3. **Xử lý tệp SVG tải lên (nếu có)**:
   - Nếu trong tương lai cần hỗ trợ tải tệp SVG, phải sử dụng middleware [`uploadSvg`](../server/src/utils/uploadImage.js) dùng `memoryStorage` với giới hạn dung lượng tối đa 1MB.
   - Đọc nội dung SVG dưới dạng văn bản (text), làm sạch qua `sanitizeSvg` rồi lưu vào trường `svg_data`, tuyệt đối không lưu tệp `.svg` thô lên hệ thống tệp đĩa hoặc dịch vụ lưu trữ tĩnh công khai.
