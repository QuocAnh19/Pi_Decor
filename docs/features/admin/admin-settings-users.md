# Cài đặt & Quản lý Người dùng Quản trị (Admin Settings & Users)

Tài liệu đặc tả chức năng cập nhật thông tin cá nhân, đổi mật khẩu quản trị viên, cấp mới và thu hồi tài khoản quản trị theo vai trò Chủ sở hữu (Owner) (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cho phép quản trị viên tự cập nhật thông tin hồ sơ và đổi mật khẩu an toàn; cấp quyền cho Chủ sở hữu (Owner) quản trị danh sách nhân sự vận hành hệ thống.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu hệ thống (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-013** (Tạo mới tài khoản quản trị viên) và **US-014** (Thu hồi tài khoản quản trị viên) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập `/admin/settings` (`AdminSettingsPage`).
2. **Cập nhật hồ sơ cá nhân & Đổi mật khẩu**:
   - Quản trị viên đổi tên hiển thị: Nhập tên mới -> Gọi `PATCH /api/auth/me`.
   - Quản trị viên đổi mật khẩu: Nhập mật khẩu hiện tại (`current_password`) và mật khẩu mới (`new_password`) đáp ứng chính sách bảo mật -> Gọi `PATCH /api/auth/me`.
   - Backend xác thực mật khẩu cũ qua `bcryptjs`, băm mật khẩu mới và lưu vào cơ sở dữ liệu.
3. **Quản lý danh sách Quản trị viên (Chỉ dành cho Owner)**:
   - Giao diện nạp danh sách tài khoản qua `GET /api/auth/admins`.
   - Chủ sở hữu tạo tài khoản mới: Nhấn "Thêm quản trị viên", nhập Email, Họ tên, Mật khẩu ban đầu và Vai trò (`admin` hoặc `owner`).
   - Gửi yêu cầu `POST /api/auth/admins` (kiểm tra nghiêm ngặt qua middleware `requireOwner`).
4. **Thu hồi tài khoản (Chỉ dành cho Owner)**:
   - Chủ sở hữu nhấn "Xóa tài khoản" cạnh một quản trị viên -> Hộp thoại xác nhận hiển thị.
   - Gửi `DELETE /api/auth/admins/:id` (`verifyToken, requireOwner`).
   - Backend xóa bản ghi trong bảng `admins`, đồng thời xóa sạch toàn bộ các refresh token liên quan trong `admin_refresh_tokens`, chấm dứt mọi phiên làm việc ngay lập tức.

### 3.2. Luồng lỗi & Trường hợp biên

- **Tài khoản thường cố tình gọi API tạo/xóa admin**: Middleware `requireOwner` từ chối với mã HTTP `403 Forbidden` (`"Chỉ chủ sở hữu (owner) mới có quyền thực hiện thao tác này."`).
- **Owner tự xóa chính mình**: Backend chặn hành vi tự xóa tài khoản đang đăng nhập để tránh mất quyền quản trị tối cao của hệ thống.
- **Mật khẩu mới không đủ độ phức tạp**: Báo lỗi chi tiết (yêu cầu tối thiểu 8 ký tự, có chữ hoa, chữ thường và số).

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/settings`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminSettingsPage.tsx`
- **Thành phần phân quyền**: Middleware `apps/api/src/middlewares/verifyToken.js`

---

## 5. API Sử dụng

- `PATCH /api/auth/me`: Đổi thông tin cá nhân / mật khẩu (`verifyToken, requireAdmin`).
  - Schema: `updateMeSchema` trong `packages/shared/src/schemas/auth.ts`.
- `GET /api/auth/admins`: Xem danh sách quản trị viên (`verifyToken, requireAdmin`).
- `POST /api/auth/admins`: Cấp tài khoản quản trị mới (`verifyToken, requireOwner`).
  - Schema: `createAdminSchema` trong `packages/shared/src/schemas/auth.ts`.
- `DELETE /api/auth/admins/:id`: Thu hồi tài khoản quản trị (`verifyToken, requireOwner`).

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**:
  - `admins`: `id` (UUID), `email` (unique, lowercase), `password_hash`, `name`, `role` (`'admin'` | `'owner'`), `created_at`, `updated_at`.
  - `admin_refresh_tokens`: Lưu vết các phiên làm việc liên kết.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Password Policy**: Tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số.
- **Phân quyền**:
  - `requireAdmin`: Xem thông tin cá nhân và danh sách nhân sự.
  - `requireOwner`: Bắt buộc cho việc tạo hoặc xóa tài khoản khác.
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Mật khẩu lưu dạng chuỗi băm `bcrypt` an toàn.
- Chặn triệt để việc lộ `password_hash` trong các phản hồi JSON.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Sai mật khẩu hiện tại: `"Mật khẩu hiện tại không chính xác."` (400).
- Không đủ quyền (403): `"Chỉ chủ sở hữu (owner) mới có quyền thực hiện thao tác này."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/auth/auth.test.js` (kiểm tra phân quyền requireOwner, đổi mật khẩu, chính sách độ phức tạp).

---

## 11. Giới hạn đã biết & Tồn đọng

- Khởi tạo tài khoản Owner đầu tiên khi thiết lập hệ thống được thực hiện an toàn qua script seed `apps/api/src/utils/seed/admin.seed.js`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
