# Quản lý & Lập Báo giá Dịch vụ (Quotations)

Tài liệu đặc tả chức năng khởi tạo, tính toán chi phí, đánh số tự động nguyên tử theo định dạng `BG-YYYY-XXXX`, quản lý vòng đời và xuất file PDF báo giá dịch vụ (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Chuẩn hóa quy trình lập dự toán và báo giá sự kiện; tự động sinh mã số định danh không trùng lặp; tính toán chiết khấu và xuất tài liệu PDF gửi khách hàng.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-010** (Khởi tạo và xuất báo giá chuẩn hóa) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Trong ngăn chi tiết Lead (`LeadDetailDrawer`), quản trị viên nhấn "Tạo báo giá mới".
2. Modal `QuotationModal` mở ra, tải thông tin khách hàng và danh sách gói dịch vụ.
3. Quản trị viên thêm các dòng chi phí: Mô tả hạng mục (`item_name`), Số lượng (`quantity`), Đơn giá (`unit_price`), Đơn vị tính (`unit`).
4. Hệ thống tự động tính toán tổng tiền tạm tính, nhập tỷ lệ hoặc số tiền chiết khấu (`discount`), và tính ra tổng cộng cuối cùng (`total_amount`).
5. Thiết lập ngày hết hạn hiệu lực báo giá (`valid_until`, mặc định 14-30 ngày).
6. Nhấn "Lưu báo giá":
   - Backend sử dụng bảng `quotation_counters` thực thi câu lệnh SQL nguyên tử:
     `UPDATE quotation_counters SET counter = counter + 1 WHERE year = $1 RETURNING counter;`
   - Sinh mã số hiệu có định dạng duy nhất: `BG-YYYY-XXXX` (ví dụ: `BG-2026-0001`).
   - Tạo bản ghi trong bảng `quotations` với trạng thái ban đầu `draft` hoặc `sent`.
   - Tự động ghi nhận một hoạt động tạo báo giá vào Activity Timeline của Lead tương ứng.
7. Nhấn "Xuất PDF": Thư viện `jspdf` kết xuất biểu mẫu in `QuotationPrintableSheet` thành tệp PDF hoàn chỉnh đính kèm logo và dấu nhận diện Pi Decor.

### 3.2. Luồng lỗi & Trường hợp biên

- **Xung đột ghi đồng thời (Race Condition)**: Cơ chế khóa dòng và cập nhật nguyên tử trên `quotation_counters` đảm bảo không bao giờ xảy ra tình trạng trùng lặp số báo giá dù có nhiều admin thao tác cùng lúc.
- **Báo giá hết hạn**: Trạng thái chuyển thành `expired` khi vượt quá `valid_until`.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Tích hợp trên `/admin/leads`
- **Thành phần chính**:
  - `QuotationModal`: `apps/web/src/features/leads/components/QuotationModal.tsx`
  - `QuotationPrintableSheet`: `apps/web/src/features/leads/components/QuotationPrintableSheet.tsx`
  - Hook tính toán: `apps/web/src/features/leads/hooks/useQuotationForm.ts`

---

## 5. API Sử dụng

- `POST /api/quotations`: Khởi tạo báo giá mới.
  - Schema: `createQuotationSchema` trong `packages/shared/src/schemas/quotations.ts`.
- `GET /api/quotations/:id`: Lấy chi tiết báo giá.
- `PATCH /api/quotations/:id`: Cập nhật trạng thái (`draft`, `sent`, `accepted`, `rejected`, `expired`).
- `GET /api/quotations`: Lấy danh sách báo giá theo lead.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**:
  - `quotations`: `id` (UUID), `lead_id` (FK), `quotation_number` (text, unique), `items` (JSONB), `subtotal`, `discount`, `total_amount`, `status`, `valid_until`, `created_at`.
  - `quotation_counters`: `year` (int, PK), `counter` (int, not null).
- **Ràng buộc toàn vẹn**: `quotation_number` là duy nhất trên toàn hệ thống.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Danh sách `items` phải có ít nhất 1 dòng; đơn giá và số lượng phải lớn hơn 0.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & Bảo mật

- Thông tin báo giá chỉ hiển thị cho nhân sự quản trị được cấp quyền; bảo mật đơn giá và tỷ lệ chiết khấu thương mại của doanh nghiệp.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Báo giá không hợp lệ: `"Vui lòng nhập ít nhất một hạng mục có chi phí lớn hơn 0."`
- Lỗi tạo số hiệu: `"Không thể sinh số báo giá. Vui lòng thử lại sau ít phút."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/quotations/quotations.test.js` (kiểm thử đánh số báo giá nguyên tử, tính toán và bảo vệ route).
- **Unit Test Web**: `apps/web/src/features/leads/components/QuotationCalc.test.ts` (kiểm thử logic tính tổng tiền, chiết khấu và làm tròn).

---

## 11. Giới hạn đã biết & Tồn đọng

- Tính năng ký điện tử online cho khách hàng chấp thuận báo giá đang được theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
