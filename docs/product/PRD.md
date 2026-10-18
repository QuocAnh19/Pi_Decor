# Tài liệu Yêu cầu Sản phẩm (PRD.md)

Tài liệu này mô tả tổng thể sản phẩm Pi Decor, bao gồm mục tiêu, đối tượng người dùng, phạm vi chức năng, yêu cầu phi chức năng và các rủi ro vận hành.

---

## 1. Tổng quan Sản phẩm

**Pi Decor** là nền tảng số tích hợp dành cho thương hiệu thiết kế và trang trí tiệc cưới, tiệc thôi nôi/sinh nhật và sự kiện doanh nghiệp cao cấp (_suy ra từ code_). Hệ thống bao gồm 3 phân hệ cốt lõi:

1. **Website Giới thiệu & Trưng bày Dịch vụ (Public Web)**: Cung cấp thông tin gói dịch vụ, lookbook dự án thực tế, bản đồ địa điểm đối tác và đánh giá khách hàng.
2. **Xưởng Thiết kế Trực quan (Pi Decor Studio)**: Ứng dụng web tương tác cho phép khách hàng trực tiếp phối màu rèm, chọn vật liệu và xem thử phông nền tiệc theo thời gian thực.
3. **Cổng Quản trị & CRM Báo giá (Admin Portal)**: Quản lý tập trung khách hàng tiềm năng (Leads), lịch sử tương tác chăm sóc (Timeline Activities), và xuất báo giá PDF chuẩn hóa định dạng `BG-YYYY-XXXX`.

---

## 2. Vấn đề & Mục tiêu Sản phẩm

### 2.1. Vấn đề giải quyết (_suy ra từ code_)

- Khách hàng gặp khó khăn khi hình dung phông nền trang trí nếu chỉ xem ảnh tĩnh hoặc mô tả văn bản.
- Quy trình tiếp nhận yêu cầu từ nhiều kênh phân tán dễ gây sót thông tin và chậm trễ thời gian phản hồi.
- Thiếu công cụ tạo và kiểm soát báo giá dịch vụ đồng bộ giữa tư vấn viên và bộ phận thi công.

### 2.2. Mục tiêu sản phẩm & Chỉ số thành công

- **Trải nghiệm trực quan**: Cho phép người dùng cá nhân hóa thiết kế trong Studio trước khi liên hệ tư vấn.
- **Tập trung hóa dữ liệu**: Mọi lead và bản vẽ snapshot được lưu trữ nhất quán vào PostgreSQL.
- **Chỉ số thành công mục tiêu (KPIs)**: `[CẦN XÁC NHẬN: chỉ số thành công]` (ví dụ: Tỷ lệ chuyển đổi từ lượt truy cập sang gửi lead >= 5%, thời gian phản hồi lead lần đầu < 30 phút, tỷ lệ chốt hợp đồng từ báo giá >= 25%).

---

## 3. Đối tượng Người dùng (User Personas) (_suy ra từ code_)

1. **Khách tham quan (Visitor)**:
   - Người có nhu cầu tìm ý tưởng trang trí sự kiện/tiệc cưới.
   - Hành vi: Xem portfolio, lọc dự án theo mức giá (Standard/Premium), xem địa điểm trên bản đồ và đọc chính sách bảo mật.
2. **Khách hàng tiềm năng (Prospect / Lead)**:
   - Người chuẩn bị tổ chức tiệc cần tư vấn chi tiết và báo giá.
   - Hành vi: Tùy biến mẫu trong Studio, lưu bản vẽ thiết kế (snapshot), điền form liên hệ kèm đồng ý xử lý dữ liệu cá nhân.
3. **Quản trị viên (Admin)**:
   - Nhân viên tư vấn, thiết kế hoặc vận hành của Pi Decor.
   - Quyền hạn: Xem danh sách lead, ghi chú lịch sử cuộc gọi/tư vấn, tạo báo giá PDF, duyệt đánh giá, quản lý dự án, vật liệu, dịch vụ.
4. **Chủ sở hữu hệ thống (Owner)**:
   - Ban giám đốc hoặc trưởng bộ phận kỹ thuật.
   - Quyền hạn: Toàn quyền như Admin, kiêm nhiệm tạo mới và thu hồi tài khoản quản trị viên khác.

---

## 4. Phạm vi Sản phẩm (Scope)

### 4.1. Phạm vi hiện tại (In-Scope — _suy ra từ code_)

- **Phía Người dùng công khai**:
  - `GET /`: Trang chủ giới thiệu, dịch vụ nổi bật, lookbook, đánh giá đã duyệt.
  - `GET /studio`: Trình chỉnh sửa thiết kế trực quan cho khách hàng (Canvas SVG, chọn màu, vật liệu rèm, watermark nhận diện).
  - `GET /ban-do`: Bản đồ Leaflet hiển thị các địa điểm sự kiện đối tác.
  - `GET /chinh-sach-bao-mat`: Chính sách bảo vệ dữ liệu cá nhân theo NĐ 13/2023/NĐ-CP.
  - `POST /api/leads`: Tiếp nhận thông tin khách hàng tiềm năng kèm bản vẽ snapshot (giới hạn payload 5MB).
  - `POST /api/testimonials`: Gửi đánh giá trải nghiệm dịch vụ (trạng thái chờ duyệt).
- **Phía Quản trị nội bộ**:
  - `GET /admin/login`: Đăng nhập quản trị viên với JWT và cơ chế bảo vệ rate limit.
  - `GET /admin/leads`: Quản lý danh sách lead, đổi trạng thái tư vấn, xem timeline lịch sử và tạo báo giá.
  - `GET /admin/services`: Quản lý danh mục dịch vụ, kéo thả thay đổi thứ tự và bật/tắt hiển thị.
  - `GET /admin/projects`: Quản lý danh mục dự án Lookbook, album ảnh và gắn thẻ phân loại.
  - `GET /admin/venues`: Quản lý danh sách nhà hàng/địa điểm kèm tọa độ bản đồ.
  - `GET /admin/materials`: Quản lý mẫu vải, phụ kiện trang trí và bảng màu.
  - `GET /admin/testimonials`: Kiểm duyệt đánh giá của khách hàng (Duyệt/Từ chối).
  - `GET /admin/studio`: Quản lý bản mẫu phông nền sự kiện (Template management).
  - `GET /admin/settings`: Đổi mật khẩu cá nhân, quản lý tài khoản quản trị (dành cho Owner).

### 4.2. Ngoài phạm vi hiện tại (Out of Scope — _suy ra từ code_)

- Cổng thanh toán trực tuyến (VNPAY, MoMo, cổng thẻ quốc tế): Hệ thống hiện dừng ở bước tạo báo giá thỏa thuận, chưa hỗ trợ thanh toán online.
- Trò chuyện trực tuyến tức thời (Live Chat / WebSocket): Liên hệ hiện qua form lead, hotline và email.
- Ứng dụng di động Native (iOS/Android): Hiện tại là Web responsive chạy trên trình duyệt di động.
- Đặt lịch hẹn tự động đồng bộ Google Calendar: Lên lịch hiện được ghi nhận qua timeline ghi chú nội bộ.

---

## 5. Yêu cầu Phi chức năng (Non-Functional Requirements)

### 5.1. Hiệu năng & Kích thước Đóng gói (_đo đạc thực tế từ vite build_)

- **Tệp ứng dụng chính**:
  - `index-*.js`: **390.60 kB** (gzipped: **85.30 kB**).
  - `index-*.css`: **91.44 kB** (gzipped: **19.81 kB**).
- **Phân mảnh mã nguồn (Code Splitting)**:
  - Các trang quản trị được tải trễ (lazy-loaded): `AdminLeadsPage` (36.0 kB), `AdminStudioPage` (28.7 kB), `AdminVenuesPage` (19.6 kB), `AdminServicesPage` (18.1 kB).
  - Các thư viện nặng chỉ nạp khi kích hoạt tính năng: `jspdf` (390.5 kB / gzip 128.8 kB) và `html2canvas` (201.4 kB / gzip 48.0 kB) khi xuất file báo giá hoặc ảnh snapshot.
- **Tự host tài nguyên**: 100% phông chữ Be Vietnam Pro, Cormorant Garamond, Fraunces được phân phối trực tiếp từ máy chủ web.

### 5.2. An toàn & Bảo mật (_suy ra từ code_)

- HTTP Security Headers được kiểm soát qua `helmet`.
- Bảo vệ chống tấn công Brute-force: `loginLimiter` (10 req/15 phút), `leadsLimiter` (60 req/15 phút).
- Làm sạch toàn bộ dữ liệu SVG phông nền bằng `DOMPurify` trước khi lưu trữ hoặc render nhằm loại bỏ nguy cơ Stored XSS.
- Xác thực phiên làm việc: JWT Access Token thời hạn ngắn kết hợp Refresh Token lưu trữ an toàn trong DB có cơ chế phát hiện tái sử dụng (Reuse Detection).

### 5.3. Bảo vệ Dữ liệu Cá nhân

- Tuân thủ quy định Nghị định 13/2023/NĐ-CP: Bắt buộc người dùng tích chọn đồng ý xử lý dữ liệu cá nhân trước khi gửi lead.
- Tự động thanh lọc dữ liệu khách hàng quá hạn qua script `npm run purge-leads` dựa trên cấu hình `RETENTION_DAYS`.

### 5.4. Trình duyệt Hỗ trợ & Khả năng Tiếp cận

- Trình duyệt mục tiêu: Chrome, Safari, Firefox, Edge phiên bản 2 năm gần nhất trên cả desktop và mobile `[CẦN XÁC NHẬN]`.
- Khả năng tiếp cận: Tuân thủ quy chuẩn semantic HTML5, cung cấp `aria-label` cho các nút thao tác icon, độ tương phản màu sắc đáp ứng tiêu chuẩn WCAG 2.1 AA qua bộ token CSS ngữ nghĩa.

---

## 6. Ràng buộc & Giả định

- **Ràng buộc công nghệ**: Kiến trúc Monorepo npm workspaces (`apps/web`, `apps/api`, `packages/shared`), Node.js >= 20, cơ sở dữ liệu PostgreSQL (hỗ trợ Neon Pool/Direct), lưu trữ media đám mây Cloudinary.
- **Ràng buộc kiến trúc**: Tuân thủ quy tắc tệp mã nguồn không vượt quá 300 dòng theo `AGENTS.md`.
- **Giả định**: Thiết bị người dùng có kết nối mạng ổn định với băng thông tối thiểu 3G để tải tài nguyên hình ảnh lookbook và phông nền Studio.

---

## 7. Rủi ro Sản phẩm

1. **Rủi ro bản quyền hình ảnh khách hàng**: Ảnh dự án và tiệc thực tế cần hoàn tất thỏa thuận cho phép truyền thông từ khách hàng `[CẦN XÁC NHẬN]` (theo chi tiết tại [docs/ASSETS.md](../ASSETS.md)).
2. **Rủi ro dung lượng bản vẽ Studio**: Nếu khách hàng tạo bản vẽ chứa nhiều lớp đồ họa phức tạp, payload snapshot gửi lên API có thể tăng cao (hệ thống đã giới hạn trần 5MB tại route `POST /api/leads`).
3. **Rủi ro gián đoạn dịch vụ Cloudinary / Neon**: Các dịch vụ bên thứ ba gặp sự cố có thể ảnh hưởng đến hiển thị hình ảnh và khả năng kết nối DB (đã cấu hình timeout và cơ chế liveness/readiness health check riêng biệt).

---

## 8. Danh sách Câu hỏi Mở cho Chủ dự án

1. `[CẦN XÁC NHẬN]`: Bộ chỉ số kinh doanh chính thức (Target KPIs) cho 6 tháng đầu vận hành là gì?
2. `[CẦN XÁC NHẬN]`: Thời hạn lưu trữ dữ liệu cá nhân khách hàng tiềm năng (`RETENTION_DAYS`) chốt là 180 ngày hay thời hạn khác theo quy chế nội bộ?
3. `[CẦN XÁC NHẬN]`: Đã hoàn tất ký phụ lục thỏa thuận bản quyền hình ảnh với các khách hàng có ảnh xuất hiện trong thư mục `apps/web/public/images/` chưa?
4. `[CẦN XÁC NHẬN]`: Dự án có dự định tích hợp cổng thanh toán trực tuyến tiền cọc tiệc trong lộ trình tiếp theo không?
