# Quản trị Danh mục Dịch vụ (Services Administration)

Tài liệu đặc tả chức năng quản lý các gói dịch vụ trang trí tiệc cưới/sự kiện, tùy biến danh sách hạng mục thi công (JSONB), tải lên ảnh bìa và điều chỉnh thứ tự hiển thị ưu tiên trên trang chủ (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp giao diện quản trị linh hoạt để đội ngũ vận hành cập nhật các gói dịch vụ, cấu hình màu sắc nhận diện, sửa đổi danh sách đầu việc và đổi thứ tự hiển thị theo mùa vụ.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-011** (Quản lý và sắp xếp thứ tự hiển thị dịch vụ) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập trang `/admin/services` (`AdminServicesPage`).
2. Giao diện tải danh sách dịch vụ qua hook `useServicesQuery` gọi `GET /api/services` (sắp xếp theo trường `order`).
3. Điều chỉnh thứ tự ưu tiên:
   - Sử dụng các nút mũi tên Lên / Xuống (hoặc kéo thả) trên bảng `AdminServicesListView`.
   - Mỗi lần đổi thứ tự, hệ thống gửi `PATCH /api/services/:id` cập nhật chỉ số `order` mới vào cơ sở dữ liệu.
4. Bật / Tắt trạng thái nổi bật (`featured`):
   - Nhấn toggle chuyển đổi nhanh -> Gửi `PATCH /api/services/:id` với `{ featured: !current }`.
5. Tạo hoặc chỉnh sửa dịch vụ (`ServiceFormModal`):
   - Nhập thông tin chung qua `ServiceGeneralFields`: Tiêu đề (`title`), Thương hiệu con (`brand`), Khẩu hiệu (`tagline`), Biểu tượng (`icon`), Mã màu nhấn (`accent`), Mô tả (`description`), Nhãn nút CTA (`cta_label`).
   - Biên tập danh sách hạng mục thi công qua `ServiceItemsEditor`: Thêm, xóa hoặc sắp xếp lại từng đầu việc (lưu dạng mảng JSONB).
   - Tải lên ảnh bìa (`cover`) và ảnh đại diện (`image_url`) qua `ServiceMediaUploader`.
   - Nhấn "Lưu": Gửi `POST /api/services` (khi tạo mới) hoặc `PATCH /api/services/:id` (khi sửa).
6. Xóa dịch vụ: Nhấn nút xóa -> Hộp thoại `useConfirmDelete` hiển thị cảnh báo -> Gọi `DELETE /api/services/:id`. Ảnh Cloudinary liên kết được tự động dọn dẹp.

### 3.2. Luồng lỗi & Trường hợp biên

- **Lỗi mạng khi đổi thứ tự**: Giao diện hoàn tác vị trí cũ và hiển thị thông báo lỗi.
- **Danh sách hạng mục rỗng**: Zod schema cho phép mảng rỗng nhưng khuyến nghị ít nhất một hạng mục.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/services`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminServicesPage.tsx`
- **Thành phần chính**:
  - `AdminServicesListView`: `apps/web/src/features/services/components/AdminServicesListView.tsx`
  - `ServiceFormModal`: `apps/web/src/features/services/components/ServiceFormModal.tsx`
  - `ServiceGeneralFields`: `apps/web/src/features/services/components/ServiceGeneralFields.tsx`
  - `ServiceItemsEditor`: `apps/web/src/features/services/components/ServiceItemsEditor.tsx`
  - `ServiceMediaUploader`: `apps/web/src/features/services/components/ServiceMediaUploader.tsx`

---

## 5. API Sử dụng

- `POST /api/services`: Tạo dịch vụ mới (`verifyToken, requireAdmin`).
- `PATCH /api/services/:id`: Cập nhật thông tin / thứ tự / featured (`verifyToken, requireAdmin`).
- `DELETE /api/services/:id`: Xóa dịch vụ (`verifyToken, requireAdmin`).
  - Schema: `createServiceSchema` trong `packages/shared/src/schemas/services.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `services`
- **Các cột chính**: `id` (UUID), `title` (text, not null), `description` (text), `image_url` (text), `order` (int), `brand` (text), `tagline` (text), `icon` (text), `accent` (text), `items` (JSONB), `href` (text), `cta_label` (text), `featured` (boolean), `cover` (text).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Tiêu đề tối thiểu 2 ký tự; `accent` tuân thủ mã màu token hoặc HEX hợp lệ.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Dữ liệu dịch vụ là thông tin danh mục kinh doanh công khai của doanh nghiệp, không chứa thông tin cá nhân.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Cập nhật thứ tự lỗi: `"Không thể lưu thứ tự dịch vụ. Vui lòng thử lại."`
- Xóa thất bại: `"Không thể xóa dịch vụ này. Vui lòng kiểm tra lại liên kết."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/services/services.test.js` (kiểm tra đầy đủ CRUD và đổi thứ tự order).
- **Unit Test Web**: `apps/web/src/pages/admin/AdminServicesPage.test.tsx` (kiểm thử giao diện quản trị dịch vụ và form modal).

---

## 11. Giới hạn đã biết & Tồn đọng

- Tính năng kéo thả danh mục sử dụng thư viện `@dnd-kit/core` đã được tích hợp ổn định.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
