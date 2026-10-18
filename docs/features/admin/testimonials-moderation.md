# Kiểm duyệt Đánh giá Khách hàng (Testimonials Moderation)

Tài liệu đặc tả chức năng kiểm duyệt, phê duyệt, từ chối và quản lý danh sách đánh giá của khách hàng, đảm bảo tính an toàn nội dung và bảo vệ dữ liệu nội bộ (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Kiểm duyệt toàn bộ phản hồi gửi từ phía người dùng; chỉ công bố những đánh giá tích cực, lịch sự ra trang chủ; cô lập dữ liệu liên kết nội bộ (`lead_id`, email) không cho phép lộ ra ngoài.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-012** (Kiểm duyệt đánh giá của khách hàng) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập trang `/admin/testimonials` (`AdminTestimonialsPage`).
2. Giao diện tải toàn bộ đánh giá qua `GET /api/testimonials/admin` (`verifyToken, requireAdmin`), phân loại theo các tab trạng thái:
   - **Chờ duyệt (`pending`)**: Các đánh giá mới được gửi từ website công khai.
   - **Đã duyệt (`approved`)**: Các đánh giá đang hiển thị ngoài trang chủ.
   - **Đã từ chối (`rejected`)**: Các đánh giá bị ẩn do không phù hợp tiêu chuẩn.
3. Quản trị viên xem xét nội dung: Tên người gửi, Số sao đánh giá, Lời nhận xét, Ảnh đính kèm và nguồn gốc đơn tiệc liên kết.
4. Thao tác phê duyệt: Nhấn "Duyệt" -> Hệ thống gửi `PATCH /api/testimonials/:id` cập nhật `status = 'approved'`. Đánh giá xuất hiện ngay lập tức trên trang chủ.
5. Thao tác từ chối: Nhấn "Từ chối" -> Gửi `PATCH /api/testimonials/:id` cập nhật `status = 'rejected'`. Đánh giá bị ẩn khỏi trang chủ.
6. Thao tác xóa vĩnh viễn: Nhấn "Xóa" và xác nhận cảnh báo -> Gửi `DELETE /api/testimonials/:id`.

### 3.2. Luồng bảo vệ dữ liệu & Trường hợp biên

- **Bảo vệ trường liên kết nội bộ (`lead_id`)**: Cột `lead_id` (nếu có) và thông tin liên lạc nội bộ chỉ xuất hiện trong truy vấn quản trị `GET /api/testimonials/admin`. Ở API công khai `GET /api/testimonials`, câu lệnh SQL lọc bỏ hoàn toàn các trường này để chống thu thập thông tin khách hàng.
- **Đánh giá vi phạm thuần phong mỹ tục**: Quản trị viên có thể xóa thẳng hoặc giữ lại ở trạng thái `rejected` để lưu vết IP.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/testimonials`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminTestimonialsPage.tsx`
- **Thành phần dùng chung**: `StatusTabs`, `AdminTable`, `useConfirmDelete` từ `apps/web/src/components/admin/`

---

## 5. API Sử dụng

- `GET /api/testimonials/admin`: Danh sách toàn bộ đánh giá gồm cả `pending` và `rejected` (`verifyToken, requireAdmin`).
- `PATCH /api/testimonials/:id`: Cập nhật trạng thái duyệt (`verifyToken, requireAdmin`).
- `DELETE /api/testimonials/:id`: Xóa đánh giá vĩnh viễn (`verifyToken, requireAdmin`).
  - Schema: `packages/shared/src/schemas/testimonials.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `testimonials`
- **Các cột chính**: `id` (UUID), `author_name` (text, not null), `role` (text), `content` (text, not null), `rating` (int, 1-5), `avatar_url` (text), `project_id` (UUID), `status` (`'pending'` | `'approved'` | `'rejected'`), `consent` (boolean).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Trạng thái bắt buộc thuộc enum cho phép (`approved`, `rejected`, `pending`).
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & Bảo mật thông tin

- Tên và nội dung đánh giá chỉ được công bố ra ngoài khi đã qua bước kiểm duyệt thủ công và có sự xác nhận `consent = true`.
- Không trả về các thông tin nhạy cảm của khách hàng ra API công khai.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Cập nhật thất bại: `"Không thể cập nhật trạng thái đánh giá. Vui lòng thử lại."`
- Đánh giá không tồn tại: `"Không tìm thấy bản ghi đánh giá tương ứng."` (404).

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/testimonials/testimonials.test.js` (kiểm tra phân tách rõ giữa admin và public, luồng duyệt/từ chối).
- **Unit Test Web**: `apps/web/src/pages/admin/AdminTestimonialsPage.tsx`.

---

## 11. Giới hạn đã biết & Tồn đọng

- Tính năng gắn thẻ ảnh thực tế của khách hàng vào từng đánh giá đang được theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
