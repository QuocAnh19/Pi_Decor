# Quản trị Địa điểm Sự kiện (Venues Administration)

Tài liệu đặc tả chức năng quản lý danh sách nhà hàng, khách sạn và trung tâm hội nghị đối tác, cấu hình tọa độ bản đồ địa lý và kiểm soát toàn vẹn liên kết với các dự án tiệc (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Quản lý thông tin các địa điểm tổ chức sự kiện; cập nhật tọa độ GPS chính xác để hiển thị trên bản đồ; liên kết các dự án thi công thực tế với từng địa điểm.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: Phân hệ quản trị nội dung phục vụ trực tiếp cho **US-003** (Xem địa điểm trên bản đồ tương tác) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập `/admin/venues` (`AdminVenuesPage`).
2. Giao diện tải danh sách các địa điểm hiện có.
3. Thêm mới địa điểm:
   - Nhấn "Thêm địa điểm", form `VenueForm` mở ra.
   - Nhập: Tên địa điểm (`name`), Địa chỉ chi tiết (`address`), Sức chứa khách (`capacity`), Tọa độ vĩ độ (`latitude`) và kinh độ (`longitude`), Tải ảnh đại diện (`image_url`).
   - Nhấn "Lưu địa điểm" -> Gọi `POST /api/venues` (`verifyToken, requireAdmin`).
4. Chỉnh sửa địa điểm: Cập nhật thông tin và điều chỉnh tọa độ GPS -> Gọi `PATCH /api/venues/:id`.
5. Tạo dự án gắn với địa điểm: Khi tạo dự án tại `/admin/projects`, quản trị viên chọn địa điểm này từ dropdown. Dự án sẽ tự động xuất hiện trong danh sách dự án của địa điểm (`GET /api/venues/:id/projects`).
6. Xóa địa điểm: Nhấn nút xóa -> Hộp thoại cảnh báo hiển thị. Khi xác nhận, hệ thống gửi `DELETE /api/venues/:id`.

### 3.2. Luồng lỗi & Hành vi Khóa ngoại (Foreign Key Behavior)

- **Hành vi khi xóa địa điểm liên kết với dự án**:
  - Khóa ngoại `projects.venue_id` được cấu hình ràng buộc `ON DELETE SET NULL`.
  - Khi một địa điểm bị xóa, cơ sở dữ liệu tự động cập nhật trường `venue_id = NULL` trên tất cả các dự án liên quan, đảm bảo không làm mất dữ liệu dự án Lookbook của thương hiệu.
- **Tọa độ GPS không hợp lệ**: Zod schema chặn nếu vĩ độ không nằm trong `[-90, 90]` hoặc kinh độ không nằm trong `[-180, 180]`.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/venues`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminVenuesPage.tsx`
- **Thành phần chính**:
  - `VenueForm`: `apps/web/src/features/venues/components/VenueForm.tsx`
  - `VenueList`: `apps/web/src/features/venues/components/VenueList.tsx`

---

## 5. API Sử dụng

- `POST /api/venues`: Tạo địa điểm mới (`verifyToken, requireAdmin`).
- `PATCH /api/venues/:id`: Cập nhật thông tin địa điểm (`verifyToken, requireAdmin`).
- `DELETE /api/venues/:id`: Xóa địa điểm (`verifyToken, requireAdmin`).
  - Schema: `apps/api/src/schemas/venues.schema.js`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `venues`
- **Các cột chính**: `id` (UUID), `name` (text, not null), `address` (text, not null), `latitude` (numeric, not null), `longitude` (numeric, not null), `capacity` (int), `image_url` (text), `created_at`, `updated_at`.
- **Ràng buộc quan hệ**: `projects.venue_id REFERENCES venues(id) ON DELETE SET NULL`.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Tên địa điểm không được để trống; kinh độ và vĩ độ bắt buộc là số thực hợp lệ.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Dữ liệu địa điểm là thông tin công cộng của các trung tâm tiệc cưới đối tác, không chứa dữ liệu định danh cá nhân.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Tọa độ sai: `"Tọa độ địa lý không hợp lệ. Vui lòng kiểm tra lại kinh độ và vĩ độ."`
- Xóa thất bại: `"Không thể xóa địa điểm. Vui lòng thử lại sau ít phút."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/venues/venues.test.js` (kiểm tra tạo, sửa, xóa venue và hành vi set null khóa ngoại dự án).
- **Visual Regression**: `e2e/visual.spec.ts` (kiểm tra hiển thị trang quản trị địa điểm).

---

## 11. Giới hạn đã biết & Tồn đọng

- Tính năng tự động tìm tọa độ qua địa chỉ (Geocoding tự động) đang được xem xét tích hợp trong tương lai tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
