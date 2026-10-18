# Bảng Vật liệu & Màu sắc (Materials & Palette)

Tài liệu đặc tả chức năng tra cứu danh mục vật liệu thi công (vải rèm, hoa, phụ kiện) và bảng màu phục vụ trải nghiệm phối cảnh và lập dự toán (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp danh mục vật tư mẫu (vải lụa, voan, hoa, kết cấu) kèm mã màu trực quan và đơn giá ước tính để khách hàng và chuyên viên tham khảo khi phối phông nền tiệc.
- **Người dùng**: Khách tham quan (Visitor), Khách hàng tiềm năng (Prospect) và Quản trị viên (Admin).

---

## 2. User Story liên quan

- Tham chiếu: **US-005** (Tùy biến màu sắc và rèm trên phông nền Studio) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Ứng dụng client (hoặc khối Studio) gọi API `GET /api/materials` kèm tham số lọc tùy chọn `?category=fabric`.
2. Hệ thống trả về danh sách vật liệu gồm: Tên (`name`), Phân loại (`category`), Mã màu HEX (`color_code`), Ảnh chất liệu (`texture_url`) và đơn giá ước tính (`price_estimate`).
3. Người dùng duyệt các mẫu vật liệu theo từng danh mục: vải voan, lụa cát, hoa trang trí, khung kim loại.
4. Khi chọn một mẫu vật liệu trong Studio, màu sắc và thuộc tính vật liệu được áp dụng trực tiếp lên slot rèm tương ứng.

### 3.2. Luồng lỗi & Trường hợp biên

- **Không tìm thấy vật liệu theo danh mục**: Trả về mảng rỗng `[]` kèm HTTP 200, giao diện hiển thị thông báo chưa có mẫu trong nhóm này.
- **Lỗi kết nối API**: Giao diện fallback sang danh sách bảng màu nội bộ đã định nghĩa sẵn trong `apps/web/src/features/studio/`.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Tích hợp trong `/studio` và quản trị tại `/admin/materials` (Khối `MaterialsSection` riêng trên trang chủ: `[CẦN XÁC NHẬN: dự kiến bổ sung trên landing page]`).
- **Thành phần chính**:
  - `MaterialList`: `apps/web/src/features/materials/components/MaterialList.tsx`
  - Hook truy vấn: `apps/web/src/features/materials/hooks/materials.queries.ts`
  - Bảng chọn màu Studio: `apps/web/src/features/studio/components/customer/TextColorPresets.tsx`

---

## 5. API Sử dụng

- `GET /api/materials`: Lấy danh sách vật liệu công khai, hỗ trợ lọc theo danh mục (`?category=`).
  - Quyền hạn: Công khai (Public).
  - Schema Zod: `apps/api/src/schemas/materials.schema.js`.
- `GET /api/materials/:id`: Lấy chi tiết một vật liệu theo UUID.
  - Quyền hạn: Công khai (Public).

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `materials`
- **Các cột chính**: `id` (UUID), `name` (text, not null), `category` (text, not null: `fabric`, `flower`, `prop`...), `color_code` (text, mã hex 6 ký tự hợp lệ), `texture_url` (text), `price_estimate` (numeric), `unit` (text: mét, bộ, trụ...), `description` (text), `created_at`, `updated_at`.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Tham số truy vấn `category` được làm sạch trước khi đưa vào SQL parameterized query.
- **Phân quyền**: Truy cập đọc công khai không yêu cầu token. Các thao tác thêm, sửa, xóa yêu cầu quyền Admin (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các truy vấn đọc dữ liệu công khai.

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Tính năng không thu thập hay lưu trữ bất kỳ thông tin cá nhân nào của người dùng.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi truy vấn: `"Không thể tải danh mục vật liệu. Vui lòng thử lại sau."`
- Vật liệu không tìm thấy: `"Mã vật liệu không tồn tại trên hệ thống."` (404).

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/materials/materials.test.js` (kiểm tra truy cập danh sách vật liệu công khai và lọc theo category).
- **Unit Test Quản trị**: `apps/web/src/features/materials/hooks/materials.queries.ts`.

---

## 11. Giới hạn đã biết & Tồn đọng

- Khối hiển thị `MaterialsSection` độc lập ngoài landing page hiện đang là đề xuất mở `[CẦN XÁC NHẬN]`, dữ liệu hiện phục vụ chính cho Studio và báo giá.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
