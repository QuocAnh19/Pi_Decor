# Mô Hình Đe Dọa An Ninh Hệ Thống (THREAT_MODEL.md)

Tài liệu phân tích mô hình đe dọa an toàn thông tin của nền tảng Pi Decor theo phương pháp **STRIDE rút gọn**, xác định tài sản cần bảo vệ, ranh giới tin cậy, các nguy cơ tiềm tàng và biện pháp phòng vệ tương ứng.

---

## 1. Tài Sản Quan Trọng Cần Bảo Vệ (Assets)

1. **Dữ liệu cá nhân khách hàng (PII)**: Họ tên, số điện thoại, địa chỉ email, ngày cưới, ghi chú tư vấn riêng tư (bảng `leads`, `lead_activities`).
2. **Thông tin xác thực quản trị**: Mật khẩu quản trị viên, mã băm mật khẩu (`password_hash`), khóa bí mật ký token (`JWT_SECRET`), phiên làm việc (`refresh_tokens`).
3. **Tài nguyên truyền thông & Bản quyền**: Hình ảnh album Lookbook tiệc cưới chất lượng cao, mã khóa truy cập Cloudinary (`CLOUDINARY_API_SECRET`).
4. **Bản vẽ phối cảnh Studio**: Mã nguồn vector SVG của các mẫu thiết kế không gian và cấu hình tùy biến của khách hàng (`studio_templates`, `leads.design_snapshot`).

---

## 2. Ranh Giới Tin Cậy (Trust Boundaries)

- **Ranh giới 1 (Untrusted Internet -> Public Ingress)**: Giữa trình duyệt công khai của khách truy cập / kẻ tấn công và cổng tiếp nhận HTTP của máy chủ API Express.
- **Ranh giới 2 (API Server -> Private Data Store)**: Giữa máy chủ API nội bộ và hệ quản trị cơ sở dữ liệu PostgreSQL (kết nối qua SSL mã hóa).
- **Ranh giới 3 (API Server -> External Cloud Services)**: Giao tiếp giữa API nội bộ với dịch vụ lưu trữ Cloudinary CDN và giám sát lỗi Sentry.

---

## 3. Phân Tích Đe Dọa Theo Mô Hình STRIDE & Biện Pháp Phòng Vệ

### 3.1. Spoofing (Giả mạo danh tính)

- **Đe dọa**: Kẻ tấn công giả mạo làm Quản trị viên để truy cập trái phép danh sách lead hoặc tạo báo giá giả; brute-force mật khẩu admin.
- **Biện pháp đã có**:
  - Mã băm mật khẩu một chiều sử dụng `bcryptjs` (salt rounds 10) tại [auth.service.js](file:///D:/WANDA/Project/apps/api/src/modules/auth/auth.service.js).
  - Giới hạn tần suất đăng nhập nghiêm ngặt qua `loginLimiter` (tối đa 10 lần sai trong 15 phút) tại [auth.routes.js](file:///D:/WANDA/Project/apps/api/src/modules/auth/auth.routes.js).
  - Xác thực phiên bằng Refresh Token Rotation (RTR), mã băm SHA-256 và cơ chế Reuse Detection tại [auth.service.js](file:///D:/WANDA/Project/apps/api/src/modules/auth/auth.service.js).
- **Kiểm thử liên quan**: [apps/api/src/modules/auth/auth.test.js](file:///D:/WANDA/Project/apps/api/src/modules/auth/auth.test.js).

### 3.2. Tampering (Can thiệp & Xáo trộn dữ liệu)

- **Đe dọa**: Chèn mã độc XSS qua tệp đồ họa vector SVG của Studio; can thiệp payload làm sai lệch giá tiền trong báo giá.
- **Biện pháp đã có**:
  - Khử khuẩn 100% mã SVG bằng `isomorphic-dompurify` loại bỏ script độc hại trước khi lưu DB tại [sanitize.js](file:///D:/WANDA/Project/apps/api/src/utils/sanitize.js).
  - Xác thực toàn bộ schema đầu vào bằng Zod, tự động loại bỏ các trường lạ (strip unknown fields) tại [packages/shared/src/schemas/](file:///D:/WANDA/Project/packages/shared/src/schemas/).
  - Tính toán số tiền báo giá và tăng số thứ tự nguyên tử trên server qua bảng `quotation_counters`.
- **Kiểm thử liên quan**: [apps/api/tests/sanitizeSvg.test.js](file:///D:/WANDA/Project/apps/api/tests/sanitizeSvg.test.js).

### 3.3. Repudiation (Chối bỏ trách nhiệm)

- **Đe dọa**: Quản trị viên xóa lead, đổi trạng thái hoặc chỉnh sửa báo giá nhưng phủ nhận hành động.
- **Biện pháp đã có**:
  - Mọi thao tác đổi trạng thái, lập báo giá hoặc ghi chú đều được tự động lưu vết tại bảng `lead_activities` kèm `admin_id`, dấu thời gian `created_at` và `metadata` chi tiết tại [activity.service.js](file:///D:/WANDA/Project/apps/api/src/services/activity.service.js).
  - Ghi nhật ký cấu trúc (structured logging) qua thư viện `pino` với `req.id` phân giải cho từng request.
- **Kiểm thử liên quan**: [apps/api/src/modules/leads/leads.test.js](file:///D:/WANDA/Project/apps/api/src/modules/leads/leads.test.js).

### 3.4. Information Disclosure (Rò rỉ thông tin riêng tư)

- **Đe dọa**: Lộ số điện thoại/email khách hàng ra ngoài; rò rỉ stack trace lỗi máy chủ; lộ liên kết `lead_id` tại API đánh giá công khai.
- **Biện pháp đã có**:
  - Tách biệt hoàn toàn route công khai và quản trị; trường `lead_id` bị lược bỏ (omit) tại endpoint `GET /api/testimonials`.
  - Bộ bắt lỗi tập trung (Error Handler) chặn hiển thị chi tiết stack trace trên môi trường production, chỉ gửi lỗi về Sentry tại [errorHandler.js](file:///D:/WANDA/Project/apps/api/src/shared/errorHandler.js).
  - Tự động che dấu (mask) số điện thoại `090****123` trong các script bảo trì và nhật ký console.
  - Tuân thủ chính sách bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (bắt buộc consent).
- **Kiểm thử liên quan**: [apps/api/src/modules/testimonials/testimonials.test.js](file:///D:/WANDA/Project/apps/api/src/modules/testimonials/testimonials.test.js).

### 3.5. Denial of Service (Từ chối dịch vụ)

- **Đe dọa**: Tấn công làm tràn ngập biểu mẫu gửi lead; tải lên tệp ảnh dung lượng khổng lồ làm cạn kiệt tài nguyên máy chủ.
- **Biện pháp đã có**:
  - Giới hạn tần suất gọi API (Rate Limiting) tầng Ingress qua `express-rate-limit`.
  - Giới hạn kích thước gói tin HTTP body tối đa 10MB; kiểm tra MIME type ảnh cho phép (`image/jpeg`, `image/png`, `image/webp`).
  - Thiết lập timeout kết nối DB (connection timeout 10s, statement timeout 15s) tránh treo kết nối pool.

### 3.6. Elevation of Privilege (Leo thang đặc quyền)

- **Đe dọa**: Quản trị viên thường (`role = 'admin'`) tự ý cấp quyền hoặc xóa tài khoản của quản trị viên khác.
- **Biện pháp đã có**:
  - Phân quyền kiểm soát truy cập dựa trên vai trò (RBAC) nghiêm ngặt qua middleware `requireOwner` tại [verifyToken.js](file:///D:/WANDA/Project/apps/api/src/middlewares/verifyToken.js).
  - Chỉ tài khoản có `role = 'owner'` mới có quyền tạo mới hoặc thu hồi tài khoản admin.

---

## 4. Rủi Ro Còn Lại (Residual Risks) & Đề Xuất Giảm Thiểu

1. **Phụ thuộc vào tính sẵn sàng của Cloudinary**: Nếu Cloudinary gặp sự cố mạng diện rộng, ảnh dự án có thể tạm thời không tải được. _Đề xuất_: Thiết lập ảnh placeholder fallback tại client.
2. **Khóa bí mật trong quá trình vận hành**: Rủi ro nhân viên lộ mật khẩu hoặc token cá nhân. _Đề xuất_: Định kỳ xoay vòng `JWT_SECRET` và kích hoạt lệnh thu hồi phiên diện rộng theo [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md).
