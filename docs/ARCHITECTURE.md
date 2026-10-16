# Kiến trúc Hệ thống & Luồng Dữ liệu (ARCHITECTURE.md)

Tài liệu mô tả chi tiết kiến trúc phần mềm, các luồng dữ liệu chính, mô hình thực thể quan hệ cơ sở dữ liệu và các quyết định thiết kế cốt lõi của nền tảng Pi Decor.

---

## 1. Các Luồng Dữ liệu Chính

### a. Khách hàng gửi liên hệ & Lưu thiết kế Studio (Lead Submission)

1. Khách hàng điền thông tin tại form tư vấn (Footer LeadForm) hoặc bấm "Lưu thiết kế" tại Studio Editor (SaveDesignModal).
2. Khách hàng bắt buộc tick đồng ý điều khoản xử lý dữ liệu cá nhân (`consent: true`).
3. Client gửi `POST /api/leads` kèm thông tin cá nhân (họ tên, SĐT, ngày cưới), trạng thái consent, và `design_snapshot` (dữ liệu cấu hình layer/vật liệu dạng JSON).
4. Server xác thực dữ liệu qua Zod schema (kiểm tra SĐT Việt Nam hợp lệ), lưu vào bảng `leads` với trạng thái mặc định `new`, đồng thời ghi nhận `consent_at = now()`.

### b. Thiết kế phối cảnh Studio & Lưu Snapshot (Studio Customizer)

1. Khi khách hàng vào `/studio`, client tải danh sách template khả dụng (`GET /api/studio/templates`) và thư viện vật phẩm decor.
2. Mỗi template gồm các vị trí cắm layer (`studio_slot_definitions`: rèm nền, hoa trang trí, biển tên tiệc, v.v.) và quy tắc xung đột (`studio_slot_rules`).
3. Khách hàng tùy biến màu rèm, vị trí hoa, nội dung chữ. Client render trực tiếp trên Canvas và tối ưu SVG.
4. Khi bấm "Xuất thiết kế", client render ảnh xem trước và đóng gói toàn bộ state cấu hình thành `BuilderState` snapshot trước khi gửi về API.

### c. Admin tạo Báo giá Tự động (Quotation Flow)

1. Admin truy cập `/admin/leads`, chọn một lead và mở giao diện tạo báo giá.
2. Admin chọn các hạng mục dịch vụ, vật liệu, số lượng và đơn giá thỏa thuận.
3. Client gửi `POST /api/quotations` với payload gồm `lead_id`, danh sách items và ghi chú.
4. Server mở transaction PostgreSQL, đọc và tăng nguyên tử bộ đếm số hiệu tại bảng `quotation_counters` theo năm hiện tại, sinh mã định dạng `BG-YYYY-XXXXX`.
5. Báo giá được lưu vào bảng `quotations`, tính toán tổng giá trị và liên kết trực tiếp với lead.

### d. Xuất bản Template Studio (Template Publishing Flow)

1. Admin thiết kế bố cục template mới trong giao diện Admin Studio (`/admin/studio`).
2. Admin cấu hình các slot tọa độ, loại layer và các quy tắc hiển thị.
3. Khi hoàn tất, Admin bấm "Xuất bản": Client gọi `PUT /api/studio/templates/:id/publish`.
4. Server kiểm tra tính toàn vẹn của slot definitions, cập nhật cờ `is_published = true` trong bảng `studio_templates`. Template lập tức xuất hiện trên giao diện Studio công khai.

---

## 2. Mô hình Thực thể & Cơ sở Dữ liệu

Dự án sử dụng PostgreSQL 16 thuần với 29 bước migration có thứ tự:

```
[admins] ────────────────────< [refresh_tokens]
  │
[leads] ─────────────────────< [quotations] >─── [quotation_counters]
  │   └──< [lead_activities]
  │   └──< [designs] (legacy)
  │
[venues] ────────────────────< [projects]
  │
[materials]          [services]          [testimonials]
  │
[studio_templates] ──────────< [studio_slot_definitions]
  │                ──────────< [studio_slot_rules]
[studio_assets]
```

### Các Bảng Dữ liệu Chính

- **`admins`**: Tài khoản quản trị, lưu mật khẩu băm bcrypt và vai trò (`owner`, `admin`).
- **`refresh_tokens`**: Quản lý phiên đăng nhập admin, hỗ trợ xoay vòng token (rotation) và phát hiện dùng lại (reuse detection) qua trường `family_id` và `is_revoked`.
- **`leads`**: Khách hàng tiềm năng, lưu thông tin liên hệ, trạng thái (`new`, `contacted`, `closed`), `design_snapshot` (jsonb), và vết đồng ý `consent_at`.
- **`quotations`**: Bản ghi báo giá chi tiết cho từng lead, liên kết mã `BG-YYYY-XXXXX`.
- **`quotation_counters`**: Bộ đếm nguyên tử theo năm (`year`, `last_value`), ngăn trùng số hiệu báo giá khi xóa bản ghi cũ.
- **`lead_activities`**: Lịch sử hoạt động và ghi chú tương tác chăm sóc lead.
- **`venues` & `projects`**: Địa điểm tổ chức (tọa độ lat/lng cho bản đồ Leaflet) và các case study dự án thực tế liên kết.
- **`materials` & `services`**: Danh mục vật liệu decor và danh sách gói dịch vụ Bento hiển thị ngoài trang chủ.
- **`testimonials`**: Đánh giá thực tế từ cô dâu chú rể, hỗ trợ kiểm duyệt trước khi hiển thị.
- **`studio_templates`, `studio_slot_definitions`, `studio_assets`, `studio_slot_rules`**: Hệ thống cấu trúc phân cấp linh hoạt cho Studio Canvas.

---

## 3. Các Quyết định Thiết kế Trọng yếu (Key Architecture Decisions)

### a. Lớp Lưu trữ Trực tiếp (No Heavy ORM)

- **Lý do**: Tránh sự cồng kềnh, chậm chạp và khó kiểm soát câu lệnh SQL của các ORM phức tạp.
- **Giải pháp**: Xây dựng adapter parameterized SQL duy nhất `apps/api/src/config/database.pg.js`. Mọi thao tác CRUD đều đi qua allowlist tên bảng và cột nghiêm ngặt, đảm bảo an toàn 100% trước lỗi SQL Injection.

### b. Quản lý Phiên Đăng nhập & Xoay vòng Refresh Token

- **Lý do**: Client và Server có thể triển khai độc lập (Vercel và Render), khiến cookie cross-site bị trình duyệt chặn.
- **Giải pháp**:
  - Access Token (JWT) lưu trong bộ nhớ / sessionStorage, thời hạn ngắn (15 phút).
  - Refresh Token được xoay vòng mỗi khi cấp lại token (Refresh Token Rotation).
  - Phía Client sử dụng cơ chế **Single-Flight Refresh Promise** trong `apps/web/src/lib/authStore.ts` để ngăn chặn các request đồng thời gửi nhiều lệnh refresh gây khóa phiên.
  - Phía Server lưu vết dòng họ token (`family_id`). Nếu một refresh token đã bị thu hồi được sử dụng lại, server lập tức thu hồi toàn bộ dòng họ token đó để chống tấn công đánh cắp phiên.

### c. Chuẩn hóa Định dạng Dữ liệu (Data Mapping Layer)

- **Lý do**: Database và API backend tuân thủ chuẩn `snake_case` của PostgreSQL, trong khi code React/TypeScript tuân thủ `camelCase`.
- **Giải pháp**: Tách tầng mapper độc lập tại `apps/web/src/lib/mappers/` (`lead.mapper.ts`, `quotation.mapper.ts`, `studio.mapper.ts`). Mọi dữ liệu vào/ra đều được chuyển đổi nhất quán, không làm ô nhiễm mã nguồn giao diện.

### d. Tuân thủ Bảo vệ Dữ liệu Cá nhân (Privacy Compliance)

- **Lý do**: Đáp ứng Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Giải pháp**:
  - Ghi vết thời điểm đồng ý (`consent_at`) và phiên bản chính sách (`consent_version`).
  - Cung cấp script tự động `npm run purge-leads -- --older-than-days=N` giúp quản trị viên định kỳ thanh lọc các liên hệ quá hạn lưu trữ.

### e. Tối ưu Hiệu năng Tải trang (Client Performance)

- **Giải pháp**:
  - Áp dụng Code Splitting (`React.lazy` và `Suspense`) cho toàn bộ các trang Admin, Studio và Bản đồ.
  - Thư viện nặng như `jspdf` và `html-to-image` chỉ được tải động (dynamic import) khi người dùng chủ động bấm xuất báo giá hoặc ảnh thiết kế.
  - Tách vendor chunks riêng biệt (`react`, `leaflet`, `dnd-kit`) qua cấu hình Rollup.
