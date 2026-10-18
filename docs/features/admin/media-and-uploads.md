# Quản lý Đa phương tiện & Tải lên Tệp (Media & Uploads)

Tài liệu đặc tả kiến trúc lưu trữ hình ảnh đám mây qua Cloudinary, danh sách định dạng MIME cho phép (Allowlist), giới hạn dung lượng và quy trình tự động dọn dẹp tài nguyên ảnh mồ côi (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp cơ chế tải lên, tối ưu hóa và phân phối hình ảnh an toàn cho các phân hệ dự án, dịch vụ, vật liệu và Studio; ngăn chặn tải lên mã độc và dọn dẹp ảnh cũ nhằm tối ưu chi phí lưu trữ đám mây.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: Phân hệ hạ tầng media hỗ trợ trực tiếp cho **US-001** (Dịch vụ), **US-002** (Lookbook) và **US-005** (Studio) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng xử lý tệp

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên chọn tệp ảnh trên giao diện web (tạo dự án, cập nhật dịch vụ hoặc xuất bản mẫu Studio).
2. Tệp được gửi lên API dưới dạng `multipart/form-data`.
3. Middleware `uploadImage` (`apps/api/src/utils/uploadImage.js`) chặn và kiểm tra:
   - **MIME Allowlist**: Chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp`.
   - **Giới hạn kích thước**: Tối đa 10MB cho mỗi tệp.
4. Lưu trữ đám mây Cloudinary:
   - Tệp được đẩy trực tiếp lên Cloudinary với thư mục prefix phân loại theo biến môi trường `CLOUDINARY_FOLDER` (ví dụ: `pidecor/projects`, `pidecor/services`).
   - Cloudinary tự động nén, chuyển đổi định dạng tối ưu và trả về URL bảo mật (`https://res.cloudinary.com/...`).
   - (Trong môi trường dev/test không có Cloudinary: Hệ thống tự động fallback lưu vào thư mục đĩa cục bộ `uploads/`).
5. Vòng đời dọn dẹp ảnh mồ côi (Cleanup Lifecycle):
   - Khi cập nhật ảnh mới cho dự án/dịch vụ: `media.service.js` gọi `deleteImage(oldUrl)` để xóa ảnh cũ trên Cloudinary.
   - Khi xóa bản ghi: Tự động xóa ảnh đại diện và toàn bộ danh sách ảnh trong album `gallery`.
   - Rà soát định kỳ: Thực thi script `npm run media:audit` để phát hiện và báo cáo các tệp ảnh mồ côi không còn liên kết trong DB.

### 3.2. Luồng lỗi & Trường hợp biên

- **Tải lên định dạng không cho phép (ví dụ: `.svg`, `.exe`, `.html`)**: Multer chặn ngay lập tức với lỗi `400 Bad Request` (`"Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP."`).
- **Tệp vượt quá 10MB**: Máy chủ từ chối với mã lỗi `LIMIT_FILE_SIZE`.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Tích hợp trên `/admin/projects`, `/admin/services`, `/admin/materials`, `/admin/studio`.
- **Thành phần tải ảnh**:
  - `ProjectGalleryEditor`: `apps/web/src/features/projects/components/ProjectGalleryEditor.tsx`
  - `ServiceMediaUploader`: `apps/web/src/features/services/components/ServiceMediaUploader.tsx`

---

## 5. API Sử dụng

- Các route nhận dữ liệu `multipart/form-data`:
  - `POST /api/projects`, `PATCH /api/projects/:id`
  - `POST /api/services`, `PATCH /api/services/:id`
  - `PUT /api/studio/templates/:id/publish`
- Middleware xử lý tệp: `apps/api/src/utils/uploadImage.js`.
- Service dọn dẹp: `apps/api/src/services/media.service.js`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Lưu trữ liên kết**: Bảng `projects` (cột `image_url`, `gallery`), `services` (cột `cover`, `image_url`), `materials` (cột `texture_url`), `studio_templates` (cột `thumbnail`).
- **Quy tắc trích xuất Public ID**: `media.service.js` phân tích URL để lấy `public_id` chính xác phục vụ lệnh xóa trên Cloudinary API.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **MIME Allowlist**: `['image/jpeg', 'image/png', 'image/webp']`.
- **Kích thước tối đa**: 10MB (`10 * 1024 * 1024 bytes`).
- **Phân quyền**: Toàn bộ thao tác tải và xóa media yêu cầu quyền Admin hoặc Owner (`verifyToken, requireAdmin`).

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Tuyệt đối cấm tải lên các tệp mã nguồn hoặc file nhạy cảm.
- Script rà soát media `apps/api/scripts/media-audit.js` giúp phát hiện rò rỉ dữ liệu media không mong muốn.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Tệp sai định dạng: `"Chỉ cho phép tải lên định dạng hình ảnh JPG, PNG hoặc WEBP."`
- Quá dung lượng: `"Dung lượng tệp vượt quá giới hạn tối đa 10MB."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/projects/projects.test.js` (kiểm thử middleware tải ảnh).
- **Script kiểm toán Media**: `apps/api/scripts/media-audit.js`.

---

## 11. Giới hạn đã biết & Tồn đọng

- Kiểm tra tự động các ảnh mồ côi được tích hợp trong lệnh `npm run media:audit` (theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md)).
