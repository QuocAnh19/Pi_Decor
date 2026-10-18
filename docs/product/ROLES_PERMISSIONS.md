# Ma trận Phân quyền & Vai trò Người dùng (ROLES_PERMISSIONS.md)

Tài liệu này đặc tả chi tiết cơ chế phân quyền dựa trên vai trò (Role-Based Access Control - RBAC) và ma trận ánh xạ giữa các vai trò với từng chức năng/endpoint API trong hệ thống Pi Decor, được tổng hợp trực tiếp từ mã nguồn thực tế (_suy ra từ code_).

---

## 1. Định nghĩa Vai trò & Middleware Kiểm soát

Hệ thống quản lý 3 cấp độ vai trò chính:

| Cấp độ vai trò    | Ký hiệu  | Mô tả quyền hạn (_suy ra từ code_)                                                            |
| :---------------- | :------- | :-------------------------------------------------------------------------------------------- |
| **Công khai**     | `Public` | Khách truy cập ẩn danh chưa đăng nhập; chỉ truy cập các dữ liệu đã duyệt/công bố.             |
| **Quản trị viên** | `Admin`  | Thành viên vận hành, tư vấn và thi công; quản lý lead, báo giá, nội dung danh mục.            |
| **Chủ sở hữu**    | `Owner`  | Quản trị viên cấp cao nhất; ngoài quyền Admin còn có quyền thêm/xóa các tài khoản admin khác. |

### Các Middleware kiểm soát truy cập thực tế (`apps/api/src/middlewares/verifyToken.js`):

- **`verifyToken`**: Xác thực chữ ký và tính hợp lệ của JWT Bearer token trong header `Authorization`. Trả về `401 Unauthorized` nếu token thiếu, sai hoặc hết hạn.
- **`requireAdmin`**: Kiểm tra `req.user.role === 'admin' || req.user.role === 'owner'`. Trả về `403 Forbidden` nếu không đủ quyền.
- **`requireOwner`**: Kiểm tra nghiêm ngặt `req.user.role === 'owner'`. Chỉ cho phép chủ sở hữu thực hiện các thao tác quản trị tài khoản nhạy cảm.

---

## 2. Bảng Giới hạn Tần suất (Rate Limiting) trên Tuyến đường Công khai

Để ngăn chặn tấn công từ chối dịch vụ (DoS) và vét cạn tài nguyên (Brute-force/Spam), các middleware rate limiting (`apps/api/src/middlewares/rateLimiters.js`) được áp dụng:

| Middleware               | Tuyến đường áp dụng      | Ngưỡng giới hạn       | Mục đích bảo vệ                            |
| :----------------------- | :----------------------- | :-------------------- | :----------------------------------------- |
| **`loginLimiter`**       | `POST /api/auth/login`   | 10 lần / 15 phút / IP | Chống tấn công vét cạn mật khẩu quản trị   |
| **`refreshLimiter`**     | `POST /api/auth/refresh` | 30 lần / 15 phút / IP | Chống lạm dụng cấp mới JWT token liên tục  |
| **`leadsLimiter`**       | `POST /api/leads`        | 60 lần / 15 phút / IP | Chống spam gửi lead và bản vẽ snapshot rác |
| **`testimonialLimiter`** | `POST /api/testimonials` | 10 lần / 15 phút / IP | Chống spam gửi đánh giá giả mạo            |

---

## 3. Ma trận Vai trò × Chức năng API (Role-Permission Matrix)

### Ký hiệu trong bảng:

- ✅ **Cho phép**: Có quyền thực hiện thao tác.
- ❌ **Từ chối**: Bị chặn bởi middleware xác thực (401/403).

### 3.1. Xác thực & Quản trị Tài khoản (`/api/auth`)

| Phương thức & Endpoint        | Middleware áp dụng          | Public | Admin | Owner | Ghi chú bảo mật                              |
| :---------------------------- | :-------------------------- | :----: | :---: | :---: | :------------------------------------------- |
| `POST /api/auth/login`        | `loginLimiter`              |   ✅   |  ✅   |  ✅   | Đăng nhập tài khoản quản trị                 |
| `POST /api/auth/refresh`      | `refreshLimiter`            |   ✅   |  ✅   |  ✅   | Xoay vòng Refresh Token (Rotation)           |
| `POST /api/auth/logout`       | _(public)_                  |   ✅   |  ✅   |  ✅   | Thu hồi Refresh Token hiện tại               |
| `POST /api/auth/logout-all`   | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Đăng xuất trên tất cả các thiết bị           |
| `GET /api/auth/me`            | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Lấy thông tin tài khoản đang đăng nhập       |
| `PATCH /api/auth/me`          | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Cập nhật tên hiển thị / đổi mật khẩu cá nhân |
| `GET /api/auth/admins`        | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Xem danh sách các quản trị viên              |
| `POST /api/auth/admins`       | `verifyToken, requireOwner` |   ❌   |  ❌   |  ✅   | Tạo tài khoản admin mới                      |
| `DELETE /api/auth/admins/:id` | `verifyToken, requireOwner` |   ❌   |  ❌   |  ✅   | Xóa tài khoản admin khỏi hệ thống            |

### 3.2. Quản lý Khách hàng tiềm năng & Hoạt động CRM (`/api/leads`)

| Phương thức & Endpoint           | Middleware áp dụng          | Public | Admin | Owner | Ghi chú nghiệp vụ                        |
| :------------------------------- | :-------------------------- | :----: | :---: | :---: | :--------------------------------------- |
| `POST /api/leads`                | `leadsLimiter` (json: 5MB)  |   ✅   |  ✅   |  ✅   | Gửi thông tin lead và snapshot thiết kế  |
| `GET /api/leads`                 | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Xem danh sách lead, lọc theo trạng thái  |
| `GET /api/leads/:id`             | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Xem chi tiết lead và bản vẽ đính kèm     |
| `PATCH /api/leads/:id`           | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Cập nhật trạng thái xử lý lead           |
| `DELETE /api/leads/:id`          | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Xóa lead khỏi hệ thống                   |
| `GET /api/leads/:id/activities`  | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Xem timeline lịch sử chăm sóc và ghi chú |
| `POST /api/leads/:id/activities` | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Thêm ghi chú/cuộc gọi tư vấn mới         |

### 3.3. Báo giá & Báo cáo Tổng hợp (`/api/quotations` & `/api/admin`)

| Phương thức & Endpoint    | Middleware áp dụng          | Public | Admin | Owner | Ghi chú                                  |
| :------------------------ | :-------------------------- | :----: | :---: | :---: | :--------------------------------------- |
| `POST /api/quotations`    | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Tạo báo giá mới (sinh số `BG-YYYY-XXXX`) |
| `GET /api/quotations/:id` | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Xem chi tiết báo giá để xuất PDF         |
| `GET /api/quotations`     | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Danh sách báo giá đã phát hành           |
| `GET /api/admin/summary`  | `verifyToken, requireAdmin` |   ❌   |  ✅   |  ✅   | Chỉ số thống kê tổng quan trên Dashboard |

### 3.4. Quản lý Nội dung & Tài nguyên (`projects`, `services`, `venues`, `materials`, `testimonials`, `studio`)

| Nhóm chức năng                | Endpoint công khai                                                                                                         | Endpoint quản trị (`verifyToken, requireAdmin`)                                                                                                              |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dịch vụ (`services`)**      | `GET /api/services` (danh sách công khai)<br>`GET /api/services/:id`                                                       | `POST /api/services` (tạo mới)<br>`PATCH /api/services/:id` (sửa / đổi thứ tự)<br>`DELETE /api/services/:id` (xóa)                                           |
| **Dự án (`projects`)**        | `GET /api/projects` (chỉ dự án `published=true`)<br>`GET /api/projects/:id`                                                | `GET /api/projects/admin` (toàn bộ dự án gồm nháp)<br>`POST /api/projects` (tạo mới & upload ảnh)<br>`PATCH /api/projects/:id`<br>`DELETE /api/projects/:id` |
| **Địa điểm (`venues`)**       | `GET /api/venues` (danh sách có tọa độ map)<br>`GET /api/venues/:id`<br>`GET /api/venues/:id/projects`                     | `POST /api/venues` (tạo địa điểm mới)<br>`PATCH /api/venues/:id`<br>`DELETE /api/venues/:id`                                                                 |
| **Vật liệu (`materials`)**    | `GET /api/materials` (lọc theo danh mục vải/hoa)<br>`GET /api/materials/:id`                                               | `POST /api/materials` (tạo vật liệu mới)<br>`PATCH /api/materials/:id`<br>`DELETE /api/materials/:id`                                                        |
| **Đánh giá (`testimonials`)** | `GET /api/testimonials` (chỉ đánh giá `approved`)<br>`POST /api/testimonials` (gửi đánh giá chờ duyệt)                     | `GET /api/testimonials/admin` (toàn bộ trạng thái)<br>`PATCH /api/testimonials/:id` (duyệt/từ chối)<br>`DELETE /api/testimonials/:id`                        |
| **Studio (`studio`)**         | `GET /api/studio/templates` (mẫu đang active)<br>`GET /api/studio/templates/:id`<br>`GET /api/studio/customer-designs/:id` | `GET /api/studio/templates/admin`<br>`PUT /api/studio/templates/:id/publish` (xuất bản)<br>`GET /api/studio/assets/admin`                                    |

---

## 4. Nguyên tắc An toàn & Xử lý Ngoại lệ

1. **Nguyên tắc Từ chối Mặc định (Deny by Default)**: Bất kỳ tuyến đường nào không được định nghĩa rõ ràng là công khai đều tự động yêu cầu token quản trị hợp lệ.
2. **Không để lộ dấu vết nội bộ**:
   - Khi token không hợp lệ, hệ thống trả về thông báo chung: `"Token không hợp lệ hoặc đã hết hạn."` (401).
   - Khi truy cập route không tồn tại, trả về 404 có định dạng chuẩn JSON mà không lộ cấu trúc thư mục máy chủ.
