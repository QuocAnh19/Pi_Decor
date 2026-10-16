# Các vấn đề theo dõi & Kế hoạch xử lý (FOLLOWUPS.md)

Tài liệu này ghi nhận các vấn đề kỹ thuật phát hiện trong quá trình kiểm tra hoặc thực hiện nhiệm vụ, nằm ngoài phạm vi prompt hiện tại, cần được xử lý ở các nhiệm vụ tiếp theo.

---

## 1. Xung đột Peer Dependency tại `server/` khi chạy `npm ci`

- **Mô tả**: Khi chạy `npm ci` trong thư mục `server/`, npm báo lỗi `ERESOLVE could not resolve`:
  ```
  peer cloudinary@"^1.21.0" from multer-storage-cloudinary@4.0.0
  Found: cloudinary@2.10.0
  ```
- **Nguyên nhân**: `server/package.json` khai báo `cloudinary: "^2.5.0"`, trong khi `multer-storage-cloudinary@4.0.0` chỉ hỗ trợ peer dependency `cloudinary@^1.21.0`.
- **Đề xuất xử lý ở nhiệm vụ sau**:
  - Xem xét nâng cấp adapter upload hoặc cấu hình `legacy-peer-deps` trong `.npmrc` của server, hoặc chuyển sang dùng Cloudinary v2 SDK trực tiếp không qua package `multer-storage-cloudinary` cũ.
- **Trạng thái**: Chờ duyệt.

## 2. Cảnh báo ESLint trên Client (61 warnings)

- **Mô tả**: `client/` hiện có 61 warning khi chạy `npm run lint`.
  - 18 cảnh báo `max-lines` (file vượt quá 300 dòng).
  - 39 cảnh báo `@typescript-eslint/no-explicit-any`.
  - 4 cảnh báo `react-hooks/exhaustive-deps`.
- **Đề xuất xử lý ở nhiệm vụ sau**:
  - Tách nhỏ các component lớn trong `admin/` và `features/studio/`.
  - Bổ sung types cụ thể thay thế `any`.
- **Trạng thái**: Chờ duyệt.

## 3. Cân nhắc drop bảng designs ở migration sau khi xác nhận không dùng

- **Mô tả**: Route công khai `/api/designs` đã được gỡ bỏ khỏi server. Bảng `designs` và các migration liên quan vẫn đang được giữ nguyên để không mất dữ liệu lịch sử. Phần đếm `designs_total` trong `/api/admin/summary` vẫn đang được giữ phục vụ dashboard client.
- **Đề xuất xử lý ở nhiệm vụ sau**: Cân nhắc drop bảng `designs` ở migration sau khi xác nhận không còn bất kỳ thành phần nào cần đến dữ liệu này.
- **Trạng thái**: Chờ duyệt.

## 4. Bảng quyết định quản lý ID và Timestamps theo schema DB (Nhiệm vụ P07)

Dưới đây là ma trận đối chiếu cấu trúc schema PostgreSQL (qua các migration) và quyết định loại bỏ việc sinh thủ công `id` / `created_at` / `updated_at` tại tầng application:

| Bảng                                  | Cột ID có Default?    | `created_at` Default? | `updated_at` Default & Trigger?                    | Quyết định xử lý tại tầng Router / Service                               |
| :------------------------------------ | :-------------------- | :-------------------- | :------------------------------------------------- | :----------------------------------------------------------------------- |
| `admins` (0003, 0025)                 | `gen_random_uuid()`   | `now()`               | Không có cột `updated_at`                          | Bỏ `id: uuid()` và `created_at`. Dùng row trả về từ `db.insert`.         |
| `leads` (0004)                        | `gen_random_uuid()`   | `now()`               | Không có cột `updated_at`                          | Bỏ `id: uuid()` và `created_at`. Dùng row trả về từ `db.insert`.         |
| `designs` (0005)                      | `gen_random_uuid()`   | `now()`               | Không có cột `updated_at`                          | DB tự cấp phát nếu có insert.                                            |
| `materials` (0006, 0010)              | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_materials_updated_at`        | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `services` (0007, 0010, 0022)         | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_services_updated_at`         | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `venues` (0008, 0010)                 | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_venues_updated_at`           | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `projects` (0009, 0010, 0021)         | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_projects_updated_at`         | Bỏ `id: uuid()`, `created_at`, `updated_at` trong `projects.service.js`. |
| `media_assets` (0012)                 | `gen_random_uuid()`   | `now()`               | Không có cột `updated_at`                          | DB tự cấp phát nếu có insert.                                            |
| `lead_activities` (0013)              | `gen_random_uuid()`   | `now()`               | Không có cột `updated_at`                          | Bỏ `id: uuid()`, `created_at` trong `activity.service.js`. DB tự sinh.   |
| `quotations` (0014, 0010)             | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_quotations_updated_at`       | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `testimonials` (0015, 0010)           | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_testimonials_updated_at`     | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `studio_templates` (0017, 0019, 0026) | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_studio_templates_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `studio_slot_definitions` (0017)      | `gen_random_uuid()`   | Không có cột          | Không có cột                                       | Bỏ `id: uuid()`. DB tự sinh khi insert slot mới.                         |
| `studio_assets` (0017, 0023)          | `gen_random_uuid()`   | `now()`               | `now()`, trigger `trg_studio_assets_updated_at`    | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật.     |
| `studio_slot_rules` (0017)            | `gen_random_uuid()`   | Không có cột          | Không có cột                                       | Bỏ `id: uuid()`. DB tự sinh khi insert rule mới.                         |
| `refresh_tokens` (0018)               | `gen_random_uuid()`   | `now()`               | Không có cột                                       | Bỏ `id: uuid()`, `created_at`. DB tự sinh khi đăng nhập.                 |
| `quotation_counters` (0025)           | Không có (PK: `year`) | Không có cột          | Không có cột                                       | Quản lý bởi upsert nguyên tử (P03).                                      |

## 5. Hướng dẫn chạy Cron định kỳ dọn dẹp refresh token hết hạn (Nhiệm vụ P10)

- **Tác vụ**: Dọn dẹp các bản ghi refresh token đã hết hạn hoặc đã bị thu hồi quá 7 ngày trong cơ sở dữ liệu (`server/scripts/cleanup-tokens.js`).
- **Lệnh thực thi**:
  ```bash
  cd server && npm run cleanup-tokens
  ```
- **Thiết lập Cron / Scheduler**: Khuyến nghị thiết lập Cron job hàng ngày vào lúc 03:00 sáng (giờ thấp điểm):
  ```cron
  0 3 * * * cd /path/to/server && npm run cleanup-tokens >> /var/log/pidecor-cleanup-tokens.log 2>&1
  ```
  Hoặc cấu hình scheduled task tương đương trên Render Cron Jobs, Railway Scheduled Services, hay Heroku Scheduler.

## 6. Lưu ý kiến trúc: Chuyển Refresh Token sang Cookie httpOnly (Nhiệm vụ P10)

- **Điều kiện triển khai**: Việc lưu refresh token trong cookie `httpOnly` chỉ nên thực hiện khi Web frontend và API backend được triển khai trên **cùng site / cùng domain chính** (ví dụ: frontend tại `pidecor.vn` và backend API tại `api.pidecor.vn`). Khi đó, cookie có thể cấu hình với cờ `Domain=pidecor.vn; SameSite=Lax; Secure; HttpOnly`.
- **Rủi ro khi khác site (Cross-Site)**: Nếu Web client và API server nằm trên hai domain hoàn toàn khác nhau (ví dụ: Frontend trên `pidecor.vercel.app` và API trên `pidecor-api.onrender.com`), cookie gửi qua các request API sẽ bị trình duyệt xem là **Third-Party Cookie**. Các cơ chế bảo mật trình duyệt hiện đại (Safari Intelligent Tracking Prevention, Chrome Privacy Sandbox, Firefox Total Cookie Protection) mặc định chặn toàn bộ third-party cookie trong các ngữ cảnh cross-site, dẫn tới việc refresh token bị thất bại hoàn toàn và người dùng bị đăng xuất liên tục. Do đó, giải pháp lưu trữ phiên trong `sessionStorage` kết hợp xoay vòng token (rotation) và phát hiện dùng lại (reuse detection) là giải pháp tối ưu cho kiến trúc phân tán hiện tại.

## 7. Các endpoint server chưa có client sử dụng (Nhiệm vụ P11)

- **Mô tả**: Sau khi dọn dẹp các hàm client API thừa không có component nào gọi, các endpoint backend tương ứng sau đây hiện không còn client consumer trong codebase hiện tại:
  1. `GET /api/leads/:leadId/activities` - Lấy lịch sử hoạt động của lead (tương ứng `getLeadActivities`).
  2. `POST /api/leads/:leadId/activities` - Ghi hoạt động lead thủ công (tương ứng `addLeadActivity`).
  3. `GET /api/services` - _(Đã kích hoạt ở P12)_: Client đã kết nối lại qua `api.getServices()` để hiển thị bento grid động trên trang chủ.
  4. `GET /api/quotations/:id` - Lấy chi tiết báo giá theo ID (tương ứng `getQuotation`; client chỉ dùng `GET /api/quotations?lead_id=...`).

  5. `DELETE /api/quotations/:id` - Xóa báo giá (tương ứng `deleteQuotation`).
  6. `POST /api/studio/templates` - Tạo mới template studio đơn lẻ (tương ứng `createStudioTemplate`; client dùng `publishStudioTemplate` qua `PUT /api/studio/templates/:id/publish`).
  7. `POST /api/studio/templates/:templateId/slots` - Tạo slot đơn lẻ (tương ứng `createStudioSlotDefinition`).
  8. `PATCH /api/studio/templates/:templateId/slots/reorder` - Sắp xếp lại thứ tự slots (tương ứng `reorderStudioSlots`).
  9. `PATCH /api/studio/slots/:slotId` - Cập nhật slot đơn lẻ (tương ứng `updateStudioSlotDefinition`).
  10. `GET /api/studio/assets` - Lấy tài nguyên studio công khai (tương ứng `getStudioAssets`; admin dùng `GET /api/studio/assets/admin`).
  11. `POST /api/studio/assets` - Tạo tài nguyên studio (tương ứng `createStudioAsset`).
  12. `PATCH /api/studio/assets/:id` - Sửa tài nguyên studio (tương ứng `updateStudioAsset`).
  13. `DELETE /api/studio/assets/:id` - Xóa tài nguyên studio (tương ứng `deleteStudioAsset`).
  14. `POST /api/studio/templates/:templateId/rules` - Tạo rule đơn lẻ (tương ứng `createStudioSlotRule`).
  15. `PATCH /api/studio/rules/:ruleId` - Sửa rule đơn lẻ (tương ứng `updateStudioSlotRule`).
  16. `DELETE /api/studio/rules/:ruleId` - Xóa rule đơn lẻ (tương ứng `deleteStudioSlotRule`).
- **Đề xuất xử lý ở nhiệm vụ sau**: Xem xét deprecate hoặc duy trì làm API công khai/admin tùy thuộc vào yêu cầu mở rộng chức năng Studio Editor & CRM trong tương lai.
- **Trạng thái**: Chờ duyệt.

## 8. Chốt thời gian lưu trữ dữ liệu cá nhân (Data Retention Policy) với chuyên viên pháp lý (Nhiệm vụ P22)

- **Mô tả**: Script `npm run purge-leads -- --older-than-days=N` đã được xây dựng để hỗ trợ thanh lọc và xóa vĩnh viễn các dữ liệu khách hàng quá hạn lưu trữ nhằm tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Vấn đề cần quyết định**: Mốc thời gian lưu trữ `N` ngày (hiện tại script đang đặt giá trị kỹ thuật mặc định là 180 ngày) và điều khoản trong Chính sách bảo mật (`/chinh-sach-bao-mat`) cần được người có chuyên môn pháp lý rà soát và chốt chính thức trước khi cấu hình Cron chạy tự động kèm cờ `--confirm`.
- **Trạng thái**: Chờ duyệt pháp lý.
