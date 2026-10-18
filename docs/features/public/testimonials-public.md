# Đánh giá Khách hàng (Public Testimonials)

Tài liệu đặc tả chức năng hiển thị các lời nhận xét đã duyệt và gửi đánh giá trải nghiệm dịch vụ mới từ phía khách hàng (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Tăng cường uy tín thương hiệu thông qua các phản hồi tích cực từ cô dâu chú rể và đối tác tổ chức tiệc; cung cấp biểu mẫu để khách hàng cũ gửi nhận xét mới.
- **Người dùng**: Khách tham quan (Visitor) và Khách hàng đã sử dụng dịch vụ.

---

## 2. User Story liên quan

- Tham chiếu: **US-004** (Gửi đánh giá trải nghiệm dịch vụ) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng cuộn tới khối "Cảm nhận khách hàng" (`TestimonialsSection`) trên trang chủ.
2. Ứng dụng gọi `GET /api/testimonials` để lấy danh sách các đánh giá có trạng thái `status = 'approved'`.
3. Giao diện hiển thị thẻ đánh giá dạng carousel/grid gồm: Tên tác giả (`author_name`), Vai trò/sự kiện (`role`), Điểm xếp hạng sao 1-5 (`rating`), Ảnh đại diện (`avatar_url`) và Lời nhận xét (`content`).
4. Khách hàng nhấn "Gửi nhận xét của bạn": Biểu mẫu mở ra yêu cầu nhập Họ tên, Xếp hạng sao, Nội dung đánh giá, tùy chọn tải ảnh đại diện và tích chọn "Tôi đồng ý xuất bản nhận xét này".
5. Người dùng gửi biểu mẫu: Hệ thống gọi `POST /api/testimonials` (qua `testimonialLimiter`). Đánh giá được lưu vào cơ sở dữ liệu với trạng thái `pending`.
6. Giao diện hiển thị thông báo thành công: _"Cảm ơn bạn! Đánh giá sẽ được hiển thị công khai sau khi ban quản trị kiểm duyệt."_

### 3.2. Luồng lỗi & Trường hợp biên

- **Gửi liên tục nhiều lần**: Middleware `testimonialLimiter` chặn với mã HTTP 429 nếu một IP gửi vượt quá 10 lần trong 15 phút.
- **Dữ liệu đánh giá không hợp lệ**: Zod schema chặn nếu thiếu họ tên, điểm rating ngoài khoảng 1-5 hoặc nội dung nhận xét dưới 10 ký tự.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Hiển thị trên `/` (Trang chủ)
- **Thành phần chính**:
  - `TestimonialsSection`: `apps/web/src/features/testimonials/components/TestimonialsSection.tsx`
  - Hook truy vấn: `apps/web/src/features/testimonials/hooks/testimonials.queries.ts`

---

## 5. API Sử dụng

- `GET /api/testimonials`: Lấy danh sách đánh giá công khai (chỉ `status = 'approved'`).
  - Quyền hạn: Công khai (Public).
  - Schema phản hồi: `packages/shared/src/schemas/testimonials.ts`.
- `POST /api/testimonials`: Gửi đánh giá mới.
  - Quyền hạn: Công khai (Public).
  - Rate Limit: `testimonialLimiter` (10 req/15 phút).
  - Schema Zod đầu vào: `createTestimonialSchema` trong `packages/shared/src/schemas/testimonials.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `testimonials`
- **Các cột chính**: `id` (UUID), `author_name` (text, not null), `role` (text), `content` (text, not null), `rating` (int, từ 1 đến 5), `avatar_url` (text), `project_id` (UUID, khóa ngoại tùy chọn), `status` (enum: `'pending'`, `'approved'`, `'rejected'`), `consent` (boolean, default true).
- **Quy tắc an toàn**: Đánh giá mới tạo luôn mang trạng thái `pending`, không bao giờ hiển thị công khai trước khi có phê duyệt từ quản trị viên.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**:
  - `author_name`: Tối thiểu 2 ký tự, tối đa 100 ký tự.
  - `rating`: Số nguyên từ 1 đến 5.
  - `content`: Tối thiểu 10 ký tự, tối đa 2000 ký tự.
- **Phân quyền**: Công khai gửi và đọc; quyền duyệt/xóa thuộc về Admin tại `/admin/testimonials`.
- **Rate Limit**: Tối đa 10 lượt gửi / 15 phút / IP.

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Khách hàng cung cấp tên hiển thị và lời nhận xét công khai.
- Biểu mẫu ghi nhận sự đồng ý (consent) để đảm bảo tính pháp lý khi hiển thị hình ảnh và nhận xét trên website.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Vượt quá tần suất (429): `"Bạn đã gửi quá nhiều đánh giá. Vui lòng thử lại sau ít phút."`
- Lỗi dữ liệu (400): `"Dữ liệu đánh giá không hợp lệ. Vui lòng kiểm tra lại số sao và nội dung."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/testimonials/testimonials.test.js` (kiểm tra đánh giá pending không hiển thị ra public, duyệt thành công thì hiển thị).
- **E2E Test**: `e2e/scenarios.spec.ts` (kiểm tra tải khối đánh giá trên trang chủ).

---

## 11. Giới hạn đã biết & Tồn đọng

- Kiểm duyệt đánh giá được thực hiện qua giao diện Admin `/admin/testimonials`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
