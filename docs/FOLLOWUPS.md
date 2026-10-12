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

| Bảng | Cột ID có Default? | `created_at` Default? | `updated_at` Default & Trigger? | Quyết định xử lý tại tầng Router / Service |
| :--- | :--- | :--- | :--- | :--- |
| `admins` (0003, 0025) | `gen_random_uuid()` | `now()` | Không có cột `updated_at` | Bỏ `id: uuid()` và `created_at`. Dùng row trả về từ `db.insert`. |
| `leads` (0004) | `gen_random_uuid()` | `now()` | Không có cột `updated_at` | Bỏ `id: uuid()` và `created_at`. Dùng row trả về từ `db.insert`. |
| `designs` (0005) | `gen_random_uuid()` | `now()` | Không có cột `updated_at` | DB tự cấp phát nếu có insert. |
| `materials` (0006, 0010) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_materials_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `services` (0007, 0010, 0022) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_services_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `venues` (0008, 0010) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_venues_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `projects` (0009, 0010, 0021) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_projects_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at` trong `projects.service.js`. |
| `media_assets` (0012) | `gen_random_uuid()` | `now()` | Không có cột `updated_at` | DB tự cấp phát nếu có insert. |
| `lead_activities` (0013) | `gen_random_uuid()` | `now()` | Không có cột `updated_at` | Bỏ `id: uuid()`, `created_at` trong `activity.service.js`. DB tự sinh. |
| `quotations` (0014, 0010) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_quotations_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `testimonials` (0015, 0010) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_testimonials_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `studio_templates` (0017, 0019, 0026) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_studio_templates_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `studio_slot_definitions` (0017) | `gen_random_uuid()` | Không có cột | Không có cột | Bỏ `id: uuid()`. DB tự sinh khi insert slot mới. |
| `studio_assets` (0017, 0023) | `gen_random_uuid()` | `now()` | `now()`, trigger `trg_studio_assets_updated_at` | Bỏ `id: uuid()`, `created_at`, `updated_at`. DB trigger tự cập nhật. |
| `studio_slot_rules` (0017) | `gen_random_uuid()` | Không có cột | Không có cột | Bỏ `id: uuid()`. DB tự sinh khi insert rule mới. |
| `refresh_tokens` (0018) | `gen_random_uuid()` | `now()` | Không có cột | Bỏ `id: uuid()`, `created_at`. DB tự sinh khi đăng nhập. |
| `quotation_counters` (0025) | Không có (PK: `year`) | Không có cột | Không có cột | Quản lý bởi upsert nguyên tử (P03). |

