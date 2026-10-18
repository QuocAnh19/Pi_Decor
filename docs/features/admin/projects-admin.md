# Quản trị Dự án Lookbook (Projects Administration)

Tài liệu đặc tả chức năng quản trị danh mục dự án thực tế, tải lên hình ảnh qua Cloudinary, phân loại phân khúc giá, gắn thẻ địa điểm và kiểm soát trạng thái xuất bản (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp công cụ quản lý toàn diện các tác phẩm thi công thực tế; chỉnh sửa bộ sưu tập ảnh (album gallery), gán nhãn phong cách và kiểm soát việc hiển thị ra trang chủ.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: Phân hệ quản trị nội dung phục vụ trực tiếp cho **US-002** (Lọc Lookbook dự án thực tế) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập `/admin/projects` (`AdminProjectsPage`).
2. Giao diện gọi `GET /api/projects/admin` để nạp toàn bộ danh sách dự án (bao gồm cả các bản nháp `published = false`).
3. Tạo dự án mới:
   - Nhấn "Thêm dự án", form `ProjectForm` mở ra.
   - Điền: Tiêu đề (`title`), Danh mục (`category`), Ngày tổ chức (`event_date`), Phân khúc giá (`price_tier`: `standard` / `premium`), Địa điểm tổ chức liên kết (`venue_id`), Thẻ phong cách (`style_tags`).
   - Tải lên ảnh đại diện chính (`image_url`) và danh sách ảnh album (`gallery`) qua `ProjectGalleryEditor`.
   - Chọn trạng thái xuất bản: Nháp (`published = false`) hoặc Công khai (`published = true`).
4. Nhấn "Lưu dự án": Dữ liệu gửi lên `POST /api/projects` dạng `multipart/form-data`.
   - Backend xử lý upload qua middleware `uploadImage`, lưu trữ lên dịch vụ đám mây Cloudinary và lưu URL bảo mật vào PostgreSQL.
5. Chỉnh sửa / Xóa: Quản trị viên có thể cập nhật thông tin (`PATCH /api/projects/:id`) hoặc xóa dự án (`DELETE /api/projects/:id`). Khi xóa, hệ thống gọi `media.service.js` để tự động dọn dẹp các tệp ảnh mồ côi trên Cloudinary.

### 3.2. Luồng lỗi & Trường hợp biên

- **Tải lên tệp không đúng định dạng ảnh**: Middleware chặn với lỗi `400 Bad Request` nếu tệp không thuộc allowlist MIME (chỉ cho phép `image/jpeg`, `image/png`, `image/webp`).
- **Tệp vượt quá kích thước cho phép**: Tự động chặn khi tệp vượt quá trần cấu hình (10MB).

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/projects`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminProjectsPage.tsx`
- **Thành phần chính**:
  - `ProjectForm`: `apps/web/src/features/projects/components/ProjectForm.tsx`
  - `ProjectGalleryEditor`: `apps/web/src/features/projects/components/ProjectGalleryEditor.tsx`
  - `ProjectAlbumModal`: `apps/web/src/features/projects/components/ProjectAlbumModal.tsx`
  - Hook xử lý: `apps/web/src/features/projects/hooks/useProjectForm.ts`

---

## 5. API Sử dụng

- `GET /api/projects/admin`: Danh sách toàn bộ dự án (Quyền: Admin/Owner).
- `POST /api/projects`: Tạo dự án mới kèm upload ảnh (Quyền: Admin/Owner).
- `PATCH /api/projects/:id`: Cập nhật thông tin dự án (Quyền: Admin/Owner).
- `DELETE /api/projects/:id`: Xóa dự án và dọn media (Quyền: Admin/Owner).
  - Schema: `apps/api/src/schemas/projects.schema.js`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `projects`
- **Các cột chính**: `id` (UUID), `title` (text, not null), `category` (text, not null), `event_date` (date), `venue_id` (UUID, FK tới `venues`), `location` (text), `budget` (numeric), `tag` (text), `description` (text), `image_url` (text), `gallery` (text[]), `featured` (boolean), `published` (boolean), `price_tier` (`'standard'` | `'premium'`).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Tiêu đề tối thiểu 2 ký tự; `price_tier` chỉ nhận `standard` hoặc `premium`.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & Bản quyền hình ảnh

- Đảm bảo các bức ảnh tải lên có đầy đủ thỏa thuận sử dụng tư liệu hình ảnh của khách hàng theo quy định tại [docs/ASSETS.md](../../ASSETS.md).

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Tải ảnh thất bại: `"Lỗi tải ảnh lên Cloudinary. Vui lòng thử lại với ảnh dung lượng nhỏ hơn."`
- Dự án không tồn tại: `"Không tìm thấy dự án tương ứng."` (404).

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/projects/projects.test.js` (kiểm tra phân tách rõ ràng giữa `GET /api/projects/admin` và `GET /api/projects` công khai).
- **Visual Regression**: `e2e/visual.spec.ts` (kiểm tra baseline giao diện trang Admin Projects).

---

## 11. Giới hạn đã biết & Tồn đọng

- Quản lý đồng bộ giữa `tag` và `style_tags` được duy trì theo ghi nhận tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
