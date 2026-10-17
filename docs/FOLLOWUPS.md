# Các vấn đề theo dõi & Kế hoạch xử lý (FOLLOWUPS.md)

Tài liệu này ghi nhận các vấn đề kỹ thuật phát hiện trong quá trình phát triển dự án Pi Decor, phân loại các mục đã giải quyết và các hạng mục còn mở cần theo dõi.

---

## I. Các hạng mục đang mở (Open Items)

### 1. [Ưu tiên Cao] Chốt thời gian lưu trữ dữ liệu cá nhân với chuyên viên pháp lý (P22)

- **Mô tả**: Script `npm run purge-leads -- --older-than-days=N` đã được xây dựng để hỗ trợ thanh lọc và xóa vĩnh viễn các dữ liệu khách hàng quá hạn lưu trữ nhằm tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Vấn đề cần quyết định**: Mốc thời gian lưu trữ `N` ngày (hiện tại script đang đặt giá trị kỹ thuật mặc định là 180 ngày) và điều khoản trong Chính sách bảo mật (`/chinh-sach-bao-mat`) cần được người có chuyên môn pháp lý rà soát và chốt chính thức trước khi cấu hình Cron chạy tự động kèm cờ `--confirm`.
- **Trạng thái**: Đang chờ rà soát pháp lý.

### 2. [Ưu tiên Trung bình] Rà soát vòng đời các endpoint backend chưa có client consumer (P11)

- **Mô tả**: Sau khi dọn dẹp các hàm client API thừa không có component nào gọi, các endpoint backend tương ứng sau đây hiện không còn client consumer trong codebase hiện tại:
  1. `GET /api/leads/:leadId/activities` - Lấy lịch sử hoạt động của lead (admin UI hiện xem snapshot trực tiếp).
  2. `POST /api/leads/:leadId/activities` - Ghi hoạt động lead thủ công.
  3. `GET /api/quotations/:id` - Lấy chi tiết báo giá theo ID đơn lẻ (client tra cứu qua `GET /api/quotations?lead_id=...`).
  4. `DELETE /api/quotations/:id` - Xóa báo giá đơn lẻ.
  5. `POST /api/studio/templates` - Tạo mới template studio đơn lẻ (hiện dùng `PUT /api/studio/templates/:id/publish`).
  6. `POST /api/studio/templates/:templateId/slots` - Tạo slot đơn lẻ.
  7. `PATCH /api/studio/templates/:templateId/slots/reorder` - Sắp xếp lại thứ tự slots.
  8. `PATCH /api/studio/slots/:slotId` - Cập nhật slot đơn lẻ.
  9. `GET /api/studio/assets` - Lấy tài nguyên studio công khai (admin dùng `GET /api/studio/assets/admin`).
  10. `POST /api/studio/assets` - Tạo tài nguyên studio qua API.
  11. `PATCH /api/studio/assets/:id` - Sửa tài nguyên studio.
  12. `DELETE /api/studio/assets/:id` - Xóa tài nguyên studio.
  13. `POST /api/studio/templates/:templateId/rules` - Tạo rule đơn lẻ.
  14. `PATCH /api/studio/rules/:ruleId` - Sửa rule đơn lẻ.
  15. `DELETE /api/studio/rules/:ruleId` - Xóa rule đơn lẻ.
- **Đề xuất xử lý**: Quyết định duy trì làm API nội bộ mở rộng cho phiên bản nâng cấp Studio Editor & CRM tương lai hoặc đánh dấu deprecate.
- **Trạng thái**: Chờ kế hoạch roadmap tiếp theo.

### 3. [Ưu tiên Thấp] Cân nhắc drop bảng `designs` ở migration tương lai (P07)

- **Mô tả**: Route công khai `/api/designs` đã được gỡ bỏ khỏi server. Bảng `designs` và các migration liên quan vẫn đang được giữ nguyên để bảo toàn dữ liệu lịch sử. Phần đếm `designs_total` trong `/api/admin/summary` vẫn đang được giữ phục vụ dashboard.
- **Đề xuất xử lý**: Khi chắc chắn không cần đối chiếu các bản vẽ cũ, tạo migration mới để drop bảng `designs` và dọn dẹp trường `designs_total`.
- **Trạng thái**: Chờ xác nhận nghiệp vụ.

### 4. [Ưu tiên Thấp] Đánh giá đồng bộ phiên bản Major của Vitest giữa Web (^2.x) và API (^5.x) (P25)

- **Mô tả**: `apps/api` sử dụng Vitest `^5.0.5` cho testing thuần môi trường Node backend, trong khi `apps/web` dùng Vitest `^2.1.9` tích hợp chặt chẽ với `vite: ^5.3.1`, `@vitejs/plugin-react` và môi trường `jsdom`. Thử nghiệm nâng cấp `apps/web` lên Vitest 5 đòi hỏi phải nâng cấp Vite lên v6/v7/v8 và thay đổi toàn diện cấu hình môi trường test jsdom cũng như testing-library typing augmentations trong `vite-env.d.ts`.
- **Đề xuất xử lý**: Giữ nguyên phiên bản độc lập giữa hai workspace (web dùng Vitest 2.x phù hợp Vite 5, api dùng Vitest 5.x) để đảm bảo độ ổn định cao nhất. Sẽ nâng cấp đồng bộ toàn diện khi dự án có kế hoạch nâng cấp Vite lên v6+ cho client.
- **Trạng thái**: Đã đánh giá và giữ nguyên, theo dõi trong các bản nâng cấp bundler tiếp theo.

---

## II. Các hạng mục đã giải quyết (Resolved Items)

### 1. [Đã giải quyết - P21] Xung đột Peer Dependency tại `apps/api/` khi chạy `npm ci`

- **Mô tả trước đây**: `apps/api/package.json` dùng `cloudinary: "^2.5.0"` xung đột peer dependency với `multer-storage-cloudinary@4.0.0`.
- **Giải pháp**: Đã cấu hình `.npmrc` hỗ trợ `legacy-peer-deps=true` đồng thời chuẩn hóa package-lock, cho phép CI chạy `npm ci` thành công tuyệt đối.

### 2. [Đã giải quyết - P17a & P17b] Cảnh báo kích thước file vượt 300 dòng và Lint

- **Mô tả trước đây**: Có 18 file component và module vượt quá 300 dòng theo luật `max-lines`.
- **Giải pháp**: Đã tái cấu trúc toàn diện khu vực Admin (`ProjectForm`, `MaterialList`, `AdminProjectsPage`, `QuotationModal`,...) và khu vực Studio/Lib (`useAdminEditor`, `TextAssetCustomizer`, `SlotProperties`, `lib/types`, `lib/api`). Mọi file đều tuân thủ dưới 300 dòng.

### 3. [Đã giải quyết - P07] Chuẩn hóa quản lý ID và Timestamps tại Schema Database

- **Mô tả trước đây**: Code application sinh thủ công `uuid` và timestamp gây lệch logic với DB trigger.
- **Giải pháp**: Chuyển toàn bộ việc cấp phát ID (`gen_random_uuid()`), `created_at` (`now()`) và `updated_at` (trigger tự động) về phía PostgreSQL.

### 4. [Đã giải quyết - P10] Quản lý vòng đời Refresh Token và Xoay vòng an toàn

- **Mô tả trước đây**: Cần cơ chế dọn dẹp token định kỳ và phát hiện tái sử dụng token.
- **Giải pháp**: Đã triển khai script `apps/api/scripts/cleanup-tokens.js` cho Cron job, đồng thời xây dựng bảng gia phả và logic phát hiện reuse token ở migration 0028.

### 5. [Đã giải quyết - P10] Đánh giá phương án Refresh Token Cookie vs SessionStorage

- **Mô tả trước đây**: Xem xét lưu refresh token qua httpOnly cookie.
- **Giải pháp**: Đã phân tích rủi ro Third-Party Cookie khi triển khai Client (Vercel) và Server (Render) trên hai domain khác nhau. Duy trì lưu trữ phiên an toàn qua `sessionStorage` kết hợp token rotation và single-flight refresh.

### 6. [Đã giải quyết - P27B] Rà soát tính năng cấp session SQL với PgBouncer Transaction Pooling (Neon)

- **Mô tả**: Khi dùng PgBouncer ở chế độ Transaction Pooling (hostname có hậu tố `-pooler` của Neon), các lệnh can thiệp trạng thái session (như `SET lc_time`, `pg_advisory_lock`, `LISTEN/NOTIFY`, prepared statements có tên, hoặc bảng tạm `TEMPORARY TABLE`) có thể gây rò rỉ trạng thái giữa các client hoặc báo lỗi kết nối.
- **Kết quả rà soát codebase**:
  - Không sử dụng `pg_advisory_lock` (0 kết quả).
  - Không sử dụng `LISTEN` / `NOTIFY` (0 kết quả).
  - Không sử dụng `TEMPORARY TABLE` (0 kết quả).
  - Không sử dụng Prepared Statements có tên (toàn bộ truy vấn qua `pg` dùng parameterized queries `$1, $2, ...` ẩn danh).
  - Chỉ có duy nhất câu lệnh `SET enable_seqscan = off` trong script benchmark `apps/api/scripts/explain-leads.mjs` (chạy cục bộ độc lập). Runtime API hoàn toàn không gọi session `SET`.
- **Kết luận & Giải pháp**: Codebase runtime API tương thích 100% với PgBouncer Transaction Mode của Neon qua `DATABASE_URL`. Các tác vụ DDL/Admin (migrations, seed, backup/restore, scripts quản trị) được phân tách chạy qua kết nối trực tiếp `DATABASE_URL_DIRECT`.
