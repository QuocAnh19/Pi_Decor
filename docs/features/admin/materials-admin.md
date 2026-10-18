# Quản trị Vật liệu & Mẫu vải (Materials Administration)

Tài liệu đặc tả chức năng quản lý danh mục vật liệu trang trí (vải rèm, hoa, phụ kiện), cập nhật bảng màu, đơn giá dự toán và cơ chế xóa lạc quan (Optimistic Deletion) trên giao diện (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Quản lý tập trung kho vật tư và vật liệu mẫu; hỗ trợ cập nhật mã màu HEX và ảnh vân chất liệu phục vụ công cụ Studio và tính toán báo giá.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: Phân hệ quản trị vật tư hỗ trợ trực tiếp cho **US-005** (Tùy biến vật liệu rèm) và **US-010** (Lập báo giá) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập `/admin/materials` (`AdminMaterialsPage`).
2. Giao diện tải danh mục vật liệu hiện có qua `GET /api/materials`.
3. Thêm mới vật liệu:
   - Nhấn "Thêm vật liệu", form `MaterialForm` mở ra.
   - Nhập: Tên vật liệu (`name`), Phân loại (`category`: `fabric`, `flower`, `prop`), Mã màu HEX (`color_code`), Đơn giá ước tính (`price_estimate`), Đơn vị tính (`unit`) và tải ảnh chất liệu (`texture_url`).
   - Nhấn "Lưu": Gửi `POST /api/materials` (`verifyToken, requireAdmin`).
4. Chỉnh sửa vật liệu: Cập nhật thông tin hoặc giá thi công -> Gửi `PATCH /api/materials/:id`.
5. Xóa vật liệu với cơ chế Lạc quan (Optimistic Update):
   - Nhấn nút "Xóa" trên một dòng: Hook `useMaterials` lập tức ẩn vật liệu đó khỏi danh sách trên giao diện người dùng để mang lại trải nghiệm tức thì.
   - Đồng thời gửi lệnh `DELETE /api/materials/:id` xuống máy chủ.
   - Nếu máy chủ phản hồi thành công: Xác nhận xóa hoàn tất. Nếu máy chủ báo lỗi (ví dụ mất mạng hoặc lỗi 500): Tự động khôi phục lại dòng vật liệu đó trên giao diện (Rollback state) và hiển thị thông báo lỗi.

### 3.2. Luồng lỗi & Trường hợp biên

- **Mã màu HEX sai định dạng**: Kiểm tra ràng buộc regex định dạng màu chuẩn `#RRGGBB` trước khi lưu.
- **Đơn giá âm**: Chặn giá trị bé hơn 0.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/materials`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminMaterialsPage.tsx`
- **Thành phần chính**:
  - `MaterialList`: `apps/web/src/features/materials/components/MaterialList.tsx`
  - `MaterialForm`: `apps/web/src/features/materials/components/MaterialForm.tsx`
  - Hook xử lý: `apps/web/src/features/materials/hooks/useMaterials.ts`

---

## 5. API Sử dụng

- `POST /api/materials`: Tạo vật liệu mới (`verifyToken, requireAdmin`).
- `PATCH /api/materials/:id`: Cập nhật thông tin vật liệu (`verifyToken, requireAdmin`).
- `DELETE /api/materials/:id`: Xóa vật liệu (`verifyToken, requireAdmin`).
  - Schema: `apps/api/src/schemas/materials.schema.js`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `materials`
- **Các cột chính**: `id` (UUID), `name` (text, not null), `category` (text, not null), `color_code` (text), `texture_url` (text), `price_estimate` (numeric), `unit` (text), `description` (text), `created_at`, `updated_at`.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Tên vật liệu tối thiểu 2 ký tự; mã màu nếu có phải bắt đầu bằng dấu `#` kèm 6 ký tự hex.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Dữ liệu vật liệu là thông tin danh mục hàng hóa nội bộ, không chứa dữ liệu cá nhân.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi xóa vật liệu: `"Không thể xóa vật liệu. Đã khôi phục lại trạng thái ban đầu."`
- Dữ liệu không hợp lệ: `"Mã màu HEX không hợp lệ (ví dụ: #FFFFFF)."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/materials/materials.test.js` (kiểm tra tạo, sửa, xóa vật liệu có xác thực quyền Admin).
- **Unit Test Web**: `apps/web/src/features/materials/hooks/useMaterials.ts` (kiểm thử optimistic delete).

---

## 11. Giới hạn đã biết & Tồn đọng

- Quản lý tải ảnh swatch/texture lên Cloudinary cho vật liệu đang được tối ưu hóa đồng bộ với module Media (theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md)).
