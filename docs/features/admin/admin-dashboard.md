# Bảng Điều khiển Tổng quan Quản trị (Admin Dashboard)

Tài liệu đặc tả chức năng bảng điều khiển trung tâm (Dashboard) cung cấp các số liệu thống kê tổng hợp phục vụ việc theo dõi hoạt động kinh doanh và vận hành hệ thống Pi Decor (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp cái nhìn toàn cảnh về khối lượng khách hàng tiềm năng mới, số lượng tài nguyên danh mục (dịch vụ, vật liệu, địa điểm, dự án đã xuất bản) ngay sau khi quản trị viên đăng nhập.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-007** (Đăng nhập quản trị) và hỗ trợ quản trị tổng thể cho **US-008**, **US-010** tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Sau khi đăng nhập thành công hoặc truy cập vào đường dẫn `/admin`, ứng dụng tải trang `AdminDashboardPage`.
2. Giao diện gọi API `GET /api/admin/summary` kèm JWT Bearer token hợp lệ trong header Authorization.
3. Backend truy vấn song song các chỉ số tổng hợp qua `Promise.all`:
   - Tổng số lead tiếp nhận (`leads_total`).
   - Số lượng lead mới chưa xử lý (`leads_new`).
   - Tổng số mẫu vật liệu trong kho (`materials_total`).
   - Tổng số gói dịch vụ hiện hành (`services_total`).
   - Tổng số địa điểm liên kết (`venues_total`).
   - Tổng số dự án Lookbook đã công bố (`projects_published_total`).
4. Giao diện render các thẻ chỉ số (Metric Cards) trực quan kèm các liên kết chuyển hướng nhanh (Quick Links) đến các phân hệ quản lý tương ứng.

### 3.2. Luồng lỗi & Trường hợp biên

- **Token hết hạn trong khi xem dashboard**: Tự động kích hoạt cơ chế refresh token hoặc điều hướng về `/admin/login`.
- **Cơ sở dữ liệu phản hồi chậm**: Hiển thị khung tải dữ liệu (Skeleton loader) cho các thẻ chỉ số để tránh giật giao diện.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin` (Yêu cầu `AdminGuard`)
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminDashboardPage.tsx`
- **Bộ khung điều hướng**: `apps/web/src/components/admin/AdminLayout.tsx`
- **Bộ định tuyến API**: `apps/api/src/routes/admin/index.js`

---

## 5. API Sử dụng

- `GET /api/admin/summary`:
  - Quyền hạn: Bắt buộc `verifyToken, requireAdmin`.
  - Phản hồi JSON:
    ```json
    {
      "leads_total": 45,
      "leads_new": 6,
      "materials_total": 18,
      "services_total": 3,
      "venues_total": 8,
      "projects_published_total": 12
    }
    ```

---

## 6. Dữ liệu: Bảng nguồn & Quy tắc tính toán

- `leads`: Đếm tổng số bản ghi và đếm có điều kiện `status = 'new'`.
- `materials`: Đếm tổng số vật liệu khả dụng.
- `services`: Đếm tổng số gói dịch vụ.
- `venues`: Đếm tổng số địa điểm tổ chức.
- `projects`: Đếm các dự án có thuộc tính `published = true` (không tính các dự án nháp đang chỉnh sửa).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Endpoint chỉ đọc, không nhận payload từ body.
- **Phân quyền**: Bắt buộc token có vai trò `admin` hoặc `owner`. Người dùng chưa xác thực bị từ chối với mã lỗi 401; sai quyền bị trả về 403.
- **Rate Limit**: Áp dụng cơ chế bảo vệ phiên quản trị tiêu chuẩn.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Dashboard chỉ hiển thị các số liệu thống kê tổng hợp (Aggregate counts), không trả về chi tiết tên, số điện thoại hay thông tin nhạy cảm của khách hàng.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi kết nối API (500): `"Không thể tải số liệu thống kê. Vui lòng thử tải lại trang."`
- Token không hợp lệ (401): Điều hướng ngay về `/admin/login`.

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/auth/auth.test.js` (kiểm tra chặn truy cập trái phép khi thiếu token).
- **E2E Playwright**: `e2e/scenarios.spec.ts` (kiểm tra Admin sau khi đăng nhập nhìn thấy các số liệu trên Dashboard).

---

## 11. Giới hạn đã biết & Tồn đọng

- Hiện tại bảng điều khiển mới hiển thị các chỉ số đếm cơ bản; biểu đồ doanh thu và tỷ lệ chuyển đổi lead dự kiến bổ sung trong các giai đoạn phát triển tiếp theo `[CẦN XÁC NHẬN]`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
