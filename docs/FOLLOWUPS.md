# Các vấn đề theo dõi & Kế hoạch xử lý (FOLLOWUPS.md)

Tài liệu này ghi nhận các vấn đề kỹ thuật phát hiện trong quá trình phát triển dự án Pi Decor, phân loại các mục đã giải quyết và các hạng mục còn mở cần theo dõi.

---

## I. Các hạng mục đang mở (Open Items)

### 1. [Ưu tiên Cao] Chốt thời gian lưu trữ dữ liệu cá nhân với chuyên viên pháp lý (P22)

- **Mô tả**: Script `npm run purge-leads -- --older-than-days=N` đã được xây dựng để hỗ trợ thanh lọc và xóa vĩnh viễn các dữ liệu khách hàng quá hạn lưu trữ nhằm tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Vấn đề cần quyết định**: Mốc thời gian lưu trữ `N` ngày (hiện tại script đang đặt giá trị kỹ thuật mặc định là 180 ngày) và điều khoản trong Chính sách bảo mật (`/chinh-sach-bao-mat`) cần được người có chuyên môn pháp lý rà soát và chốt chính thức trước khi cấu hình Cron chạy tự động kèm cờ `--confirm`.
- **Trạng thái**: Đang chờ rà soát pháp lý.

### 2. [Theo dõi Kỹ thuật] Quản lý vòng đời ảnh Cloudinary cho bảng `studio_assets` (P30)

- **Mô tả**: Sau khi xóa các endpoint granular `POST`, `PATCH`, `DELETE /api/studio/assets` ở P30, API runtime hiện tại không còn luồng endpoint nào trực tiếp tạo/xóa và dọn dẹp ảnh thumbnail Cloudinary của `studio_assets`. Flow `PUT /api/studio/templates/:id/publish` chỉ quản lý `studio_templates`, `studio_slot_definitions` và `studio_slot_rules` (không quản lý bảng `studio_assets`). Đồng thời backend chưa có script seed riêng cho bảng `studio_assets` (client đang dựa vào fallback seed local `apps/web/src/features/studio/data/seed/templates.ts`).
- **Đề xuất xử lý**: Khi xây dựng tính năng CMS quản lý thư viện tài nguyên Studio (Asset Management) trong tương lai, cần bổ sung endpoint quản lý asset tập trung kèm cơ chế dọn dẹp ảnh Cloudinary (hoặc script đồng bộ định kỳ kết hợp `apps/api/scripts/media-audit.js` để rà soát media mồ côi).
- **Trạng thái**: Đang theo dõi, hiện `scripts/media-audit.js` vẫn quét cột `thumbnail` của `studio_assets` để phát hiện ảnh mồ côi.

### 3. [Theo dõi Nghiệp vụ] Đánh giá việc sử dụng hai cột `projects.tag` và `projects.budget` (P29)

- **Mô tả**: Hai cột `tag` và `budget` trong bảng `projects` từng bị nghi là cột thừa sau khi có `style_tags` và `price_tier`.
- **Kết quả rà soát codebase thực tế**: Cả hai cột đang được sử dụng tích cực ở nhiều luồng nghiệp vụ quan trọng:
  - **`projects.tag`**:
    - Web Client: Hiển thị hashtag Lookbook (`#PiDecor_{item.tag}` trong `Lookbook.tsx`), badge album (`ProjectAlbumModal.tsx`), dropdown chọn tag phân loại con theo category (`ProjectForm.tsx`), lọc danh mục dịch vụ (`ServiceDetailModal.tsx`), bảng và lưới quản trị (`AdminProjectsGridView.tsx`, `AdminProjectsTableView.tsx`).
    - API Server: `projects.service.js` (gán tag mặc định hoặc lấy từ style_tags), `projects.schema.js` (validate Zod input), `portfolio.seed.js` (dữ liệu mẫu).
  - **`projects.budget`**:
    - Web Client: Nhập liệu khoảng ngân sách dự kiến trong `ProjectForm.tsx`, hiển thị thông tin chi phí ước tính trên thẻ dự án (`AdminProjectsGridView.tsx`).
    - API Server: `projects.service.js` lưu trường ngân sách thỏa thuận, `projects.schema.js`.
- **Kết luận**: **KHÔNG xóa** hai cột này vì đang phục vụ trực tiếp trải nghiệm người dùng và giao diện quản trị. Tiếp tục duy trì đồng bộ giữa form quản trị và hiển thị công khai.
- **Trạng thái**: Đã rà soát và giữ nguyên.

### 4. [Ưu tiên Thấp] Đánh giá đồng bộ phiên bản Major của Vitest giữa Web (^2.x) và API (^5.x) (P25)

- **Mô tả**: `apps/api` sử dụng Vitest `^5.0.5` cho testing thuần môi trường Node backend, trong khi `apps/web` dùng Vitest `^2.1.9` tích hợp chặt chẽ với `vite: ^5.3.1`, `@vitejs/plugin-react` và môi trường `jsdom`. Thử nghiệm nâng cấp `apps/web` lên Vitest 5 đòi hỏi phải nâng cấp Vite lên v6/v7/v8 và thay đổi toàn diện cấu hình môi trường test jsdom cũng như testing-library typing augmentations trong `vite-env.d.ts`.
- **Đề xuất xử lý**: Giữ nguyên phiên bản độc lập giữa hai workspace (web dùng Vitest 2.x phù hợp Vite 5, api dùng Vitest 5.x) để đảm bảo độ ổn định cao nhất. Sẽ nâng cấp đồng bộ toàn diện khi dự án có kế hoạch nâng cấp Vite lên v6+ cho client.
- **Trạng thái**: Đã đánh giá và giữ nguyên, theo dõi trong các bản nâng cấp bundler tiếp theo.

---

## II. Các hạng mục đã giải quyết (Resolved Items)

### 1. [Đã giải quyết - P30] Rà soát và loại bỏ các endpoint Studio chi tiết không có client consumer

- **Mô tả trước đây**: Sau khi tối ưu hóa Studio sang luồng lưu/xuất bản nguyên tử `PUT /api/studio/templates/:id/publish`, hàng loạt endpoint granular quản lý slot, rule, asset đơn lẻ không còn client consumer trong codebase (`apps/web`).
- **Danh sách 11 endpoint đã xóa**:
  1. `POST /api/studio/templates` (thay bằng `PUT /api/studio/templates/:id/publish`).
  2. `POST /api/studio/templates/:id/slots`
  3. `PATCH /api/studio/templates/:id/slots/reorder`
  4. `PATCH /api/studio/slots/:slotId`
  5. `POST /api/studio/templates/:id/rules`
  6. `PATCH /api/studio/rules/:ruleId`
  7. `DELETE /api/studio/rules/:ruleId`
  8. `GET /api/studio/assets` (công khai - admin dùng `GET /api/studio/assets/admin`, customer dùng catalog đã nạp hoặc seed fallback).
  9. `POST /api/studio/assets`
  10. `PATCH /api/studio/assets/:id`
  11. `DELETE /api/studio/assets/:id`
- **Danh sách endpoint giữ lại kèm lý do**:
  1. `GET /api/leads/:leadId/activities` & `POST /api/leads/:leadId/activities`: Giữ lại để phục vụ tính năng CRM timeline/activity log trong P32.
  2. `GET /api/quotations/:id` & `DELETE /api/quotations/:id`: Chuẩn REST API cho tài nguyên báo giá.
  3. `GET /api/studio/assets/admin`: Admin Studio đang gọi để tải danh mục tài nguyên phục vụ thiết kế canvas.
  4. `DELETE /api/studio/slots/:slotId`: Admin Studio (`useAdminEditor.ts`) đang gọi trực tiếp khi xóa slot lẻ trên canvas.
  5. `GET /api/studio/templates/:id/slots` & `GET /api/studio/templates/:id/rules`: Cho phép client tải slots/rules của template.
  6. `PATCH /api/studio/templates/:id` & `DELETE /api/studio/templates/:id`: Cập nhật metadata hoặc xóa template và thumbnail.
- **Giải pháp**:
  - Gỡ bỏ route khỏi `studio.routes.js`, gỡ controller methods khỏi `studio.controller.js`, gỡ service methods khỏi `studio.service.js`, gỡ các method chỉ phục vụ chúng khỏi `studio.repository.js`.
  - Gỡ các schema thừa: `ruleIdParamSchema` trong `packages/shared`, `createSlotSchema`, `updateSlotSchema`, `reorderSlotsSchema`, `createAssetSchema`, `updateAssetSchema`, `createRuleSchema`, `updateRuleSchema` trong `apps/api`.
  - Cập nhật test integration `studio.test.js` kiểm tra toàn bộ 11 route đã xóa trả về 404, giữ nguyên kiểm thử luồng publish nguyên tử.

### 2. [Đã giải quyết - P29] Xóa bỏ các bảng và view mồ côi (`designs`, `media_assets`, `admin_dashboard_summary`, `venues_with_project_count`)

- **Mô tả trước đây**: Bảng `designs` là tàn dư từ bản vẽ canvas cũ (nay snapshot đã tích hợp vào `leads.design_snapshot`), bảng `media_assets` không có consumer, hai view `admin_dashboard_summary` và `venues_with_project_count` không có route nào gọi.
- **Giải pháp**:
  - Tạo migration `0002_drop_orphan_objects.sql` drop tuần tự 2 view và 2 bảng theo đúng quan hệ phụ thuộc.
  - Gỡ bỏ `designs` và `media_assets` khỏi `TABLES` allowlist và `layers` khỏi `JSONB_COLUMNS` trong `database.pg.js`.
  - Gỡ bỏ trường `designs_total` khỏi `GET /api/admin/summary` và interface `AdminSummary` của web frontend.
  - Cập nhật script phân quyền `create_app_role.sql` và tài liệu kỹ thuật `API.md`, `README.md`.

### 2. [Đã giải quyết - P21] Xung đột Peer Dependency tại `apps/api/` khi chạy `npm ci`

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

### 7. [Đã giải quyết - P31] Hoàn thiện giao diện quản trị Dịch vụ Bento (`/admin/services`)

- **Mô tả trước đây**: Backend đã cung cấp đầy đủ các endpoint CRUD `/api/services` và schema Zod nhưng phía frontend thiếu trang quản trị cho admin.
- **Giải pháp**:
  - Xây dựng trang `/admin/services` được bảo vệ bởi `AdminGuard`, tích hợp mục điều hướng trên thanh sidebar (`AdminLayout`).
  - Sử dụng lại các thành phần chuẩn hóa: `AdminPageHeader`, `StatusTabs` (lọc theo danh mục nhãn hiệu PiWedding, PiKids, PiEvent), `SearchInput`, `ConfirmDeleteModal`, `EmptyState`.
  - Hiển thị danh sách dịch vụ sắp xếp theo thứ tự `order`, cho phép dịch chuyển vị trí nhanh bằng nút lên/xuống (gọi `PATCH /api/services/:id`), công tắc bật/tắt hiển thị `featured`.
  - Form tạo/sửa (`ServiceFormModal`) hỗ trợ nhập liệu đầy đủ: `title`, `brand`, `tagline`, `icon`, `accent`, `description`, danh sách gạch đầu dòng `items` động (thêm/xóa/sắp xếp), link `href`, `cta_label`, tải ảnh cover/image trực tiếp hoặc dán URL.
  - Hỗ trợ tải ảnh `multipart/form-data` hoặc gửi JSON body ở API backend, tự động dọn dẹp ảnh cũ trên Cloudinary khi thay thế hoặc xóa (`cleanupRemovedMedia`).
  - Quản lý state và server cache bằng TanStack Query (`useServicesQuery`, `useCreateServiceMutation`, `useUpdateServiceMutation`, `useDeleteServiceMutation`), đồng bộ tự động vô hiệu hóa cache khi cập nhật dữ liệu.
  - Đảm bảo toàn bộ các file mới đều tuân thủ dưới 300 dòng theo quy định dự án (`max-lines`).

### 8. [Đã giải quyết - P32] Hoàn thiện dòng thời gian hoạt động & lịch sử chăm sóc khách hàng (`LeadDetailDrawer`)

- **Mô tả trước đây**: Bảng `lead_activities` đã ghi nhận các sự kiện chuyển trạng thái, tạo báo giá, lưu thiết kế nhưng chưa có giao diện hiển thị cho chuyên viên CSKH trong LeadDetailDrawer.
- **Giải pháp**:
  - **API Backend**: Bổ sung `LEFT JOIN admins` lấy thông tin `admin_email` và `admin_name` thực hiện hành động (giữ `null` đối với hoạt động hệ thống hoặc admin đã bị xóa). Hỗ trợ lọc phân trang cursor đơn giản qua `limit` (1–100) và `before` (timestamptz), sắp xếp theo `created_at desc`.
  - **Shared Schemas**: Khai báo `getLeadActivitiesQuerySchema`, `LeadActivityDto` và `createLeadActivitySchema` trong `packages/shared`.
  - **Frontend Client**: Thêm tab "Hoạt động & Lịch sử" cạnh tab "Thông tin chi tiết" trong `LeadDetailDrawer`. Tách component `LeadOverviewTab` và `LeadActivityTimeline` để đảm bảo mỗi file dưới 300 dòng.
  - **Dòng thời gian (Timeline)**: Hiển thị icon và huy hiệu tiếng Việt trực quan cho từng loại hoạt động (Ghi chú, Cuộc gọi, Email, Đổi trạng thái, Báo giá, Hệ thống), thời gian tương đối ("vừa xong", "5 phút trước",...) kèm tooltip hiển thị timestamp đầy đủ, tên admin phụ trách.
  - **Form tương tác**: Hỗ trợ chuyển đổi nhanh ghi chú, cuộc gọi, email kèm validation độ dài tối đa 2000 ký tự.
  - **TanStack Query Caching**: Tích hợp `useLeadActivitiesQuery` và `useAddLeadActivityMutation`. Tự động vô hiệu hóa khóa `activities` khi thêm ghi chú mới hoặc khi đổi trạng thái lead (`useUpdateLeadStatusMutation`).
