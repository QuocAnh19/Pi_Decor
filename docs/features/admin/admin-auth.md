# Xác thực & Phân quyền Quản trị (Admin Authentication & AuthGuard)

Tài liệu đặc tả kiến trúc xác thực quản trị viên, cơ chế cấp phát Access Token ngắn hạn, xoay vòng Refresh Token an toàn, phát hiện sử dụng lại và lớp bảo vệ định tuyến `AdminGuard` (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Bảo vệ toàn bộ khu vực quản trị và các API nhạy cảm của Pi Decor; ngăn chặn truy cập trái phép, tấn công vét cạn mật khẩu và đánh cắp phiên làm việc.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-007** (Đăng nhập quản trị an toàn & Chặn tấn công lạm dụng) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập `/admin/login` (`AdminLoginPage`).
2. Nhập Email và Mật khẩu, nhấn "Đăng nhập".
3. Client gọi `POST /api/auth/login` (qua `loginLimiter`). Backend xác thực qua `bcryptjs`:
   - Sinh **Access Token** (JWT, thời hạn 15 phút).
   - Sinh **Refresh Token** ngẫu nhiên an toàn, lưu bản băm vào bảng `admin_refresh_tokens` trong PostgreSQL.
   - Trả về cặp token kèm thông tin hồ sơ quản trị viên.
4. Client lưu token trong bộ nhớ/storage an toàn và kích hoạt `AdminGuard` chuyển hướng vào `/admin`.
5. Khi Access Token gần hết hạn hoặc gặp lỗi 401: Client tự động gửi `POST /api/auth/refresh` (qua cơ chế single-flight request) để đổi lấy cặp token mới. Token cũ bị thu hồi ngay lập tức (Refresh Token Rotation).
6. Khi đăng xuất: Gọi `POST /api/auth/logout` để xóa refresh token hiện tại, hoặc `POST /api/auth/logout-all` để hủy toàn bộ phiên đăng nhập trên mọi thiết bị.

### 3.2. Luồng lỗi & Trường hợp biên

- **Phát hiện tái sử dụng Refresh Token (Reuse Detection)**: Nếu một refresh token đã bị thu hồi được gửi lên, hệ thống phát hiện nguy cơ đánh cắp phiên, lập tức thu hồi toàn bộ refresh tokens của tài khoản đó và buộc đăng nhập lại.
- **Tấn công vét cạn (Brute-force)**: Nhập sai mật khẩu quá 10 lần trong 15 phút sẽ bị `loginLimiter` chặn với mã HTTP 429.
- **Truy cập trực tiếp không qua đăng nhập**: `AdminGuard` tự động chặn và điều hướng về `/admin/login` kèm lưu vết trang dự định truy cập (`redirect`).

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/login` (công khai cho đăng nhập), `/admin/*` (bảo vệ bởi `AdminGuard`).
- **Thành phần chính**:
  - `AdminLoginPage`: `apps/web/src/pages/admin/AdminLoginPage.tsx`
  - `AdminGuard`: `apps/web/src/components/admin/AdminGuard.tsx`
  - Auth Context: `apps/web/src/lib/authContext.tsx`
  - Middleware xác thực: `apps/api/src/middlewares/verifyToken.js`

---

## 5. API Sử dụng

- `POST /api/auth/login`: Xác thực đăng nhập (`loginLimiter`).
  - Schema: `loginSchema` trong `packages/shared/src/schemas/auth.ts`.
- `POST /api/auth/refresh`: Cấp mới token (`refreshLimiter`).
  - Schema: `refreshTokenSchema` trong `packages/shared/src/schemas/auth.ts`.
- `POST /api/auth/logout`: Thu hồi token hiện tại.
  - Schema: `logoutSchema` trong `packages/shared/src/schemas/auth.ts`.
- `POST /api/auth/logout-all`: Đăng xuất toàn bộ thiết bị (Quyền: Admin/Owner).
- `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại (Quyền: Admin/Owner).

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**:
  - `admins`: `id` (UUID), `email` (unique), `password_hash`, `name`, `role` (`'admin'` | `'owner'`), `created_at`, `updated_at`.
  - `admin_refresh_tokens`: `id` (UUID), `admin_id` (FK), `token_hash`, `expires_at`, `revoked_at`, `created_at`.
- **Ràng buộc mật khẩu**: Mật khẩu phải đáp ứng độ dài tối thiểu 8 ký tự, có ít nhất một chữ hoa, một chữ thường và một chữ số.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Zod schemas kiểm tra định dạng email và mật khẩu.
- **Phân quyền**:
  - `verifyToken`: Kiểm tra Access Token còn hạn và chữ ký `JWT_SECRET` hợp lệ.
  - `requireAdmin`: Yêu cầu `role === 'admin' || role === 'owner'`.
- **Rate Limit**:
  - `loginLimiter`: 10 req / 15 phút.
  - `refreshLimiter`: 30 req / 15 phút.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Mật khẩu được băm một chiều bằng thuật toán `bcrypt` với muối ngẫu nhiên (salt rounds = 10).
- Không bao giờ trả về trường `password_hash` trong các phản hồi API.
- Tự động dọn dẹp các token hết hạn qua script `apps/api/scripts/cleanup-tokens.js`.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Sai tài khoản/mật khẩu (401): `"Email hoặc mật khẩu không chính xác."`
- Token hết hạn / không hợp lệ (401): `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."`
- Quá số lần đăng nhập (429): `"Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/auth/auth.test.js` (kiểm thử đăng nhập, xoay vòng refresh token, phát hiện dùng lại, logout-all).
- **E2E Playwright**: `e2e/scenarios.spec.ts` (kịch bản Admin đăng nhập và chuyển hướng vào Dashboard).

---

## 11. Giới hạn đã biết & Tồn đọng

- Kiểm tra tính sẵn sàng của biến môi trường xác thực (`JWT_SECRET`, `ADMIN_SETUP_TOKEN`) được kiểm soát nghiêm ngặt qua `npm run check:db-env`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
