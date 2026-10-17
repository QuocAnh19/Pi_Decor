# Đặc tả Giao diện Lập trình REST API (API.md)

Tài liệu đặc tả toàn bộ các điểm cuối (endpoints) của hệ thống Pi Decor API (`apps/api/src/app.js`). Mọi endpoint tuân thủ chuẩn RESTful, dữ liệu trao đổi định dạng JSON (snake_case).

---

## Quy ước Chung

- **Base URL**: `http://localhost:4000/api` (Local) hoặc `https://api.pidecor.vn/api` (Production).
- **Xác thực**: Gửi token qua Header: `Authorization: Bearer <access_token>`.
- **Phân quyền**:
  - `Public`: Không yêu cầu xác thực.
  - `Admin`: Yêu cầu tài khoản có role `admin` hoặc `owner`.
  - `Owner`: Yêu cầu tài khoản có role `owner` (chủ sở hữu).
- **Mã phản hồi HTTP**:
  - `200 OK`: Yêu cầu thành công.
  - `201 Created`: Tạo mới tài nguyên thành công.
  - `400 Bad Request`: Dữ liệu gửi lên không đúng định dạng (Zod validation error).
  - `401 Unauthorized`: Thiếu token, token không hợp lệ hoặc đã hết hạn.
  - `403 Forbidden`: Không đủ quyền hạn truy cập hoặc vi phạm CORS.
  - `404 Not Found`: Không tìm thấy tài nguyên tương ứng.
  - `429 Too Many Requests`: Vượt quá giới hạn tần suất gửi yêu cầu (Rate Limit).
  - `500 Internal Server Error`: Lỗi xử lý máy chủ nội bộ.

---

## 1. Hệ thống & Giám sát (Health)

| Method | Endpoint      | Quyền  | Request Body / Params | Phản hồi tóm tắt                                    |
| ------ | ------------- | :----: | --------------------- | --------------------------------------------------- |
| `GET`  | `/api/health` | Public | —                     | `200 { status: "ok", db: "connected", ts }` / `503` |

---

## 2. Xác thực & Quản lý Quản trị viên (Auth & Admins)

| Method   | Endpoint               | Quyền  | Schema / Request Body / Params                                        | Phản hồi tóm tắt                                                                                          |
| -------- | ---------------------- | :----: | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/auth/login`      | Public | `loginSchema`: `{ email, password }` (Rate limit: 10 lần/15p/IP)      | `200 { admin, token, refreshToken }`                                                                      |
| `POST`   | `/api/auth/refresh`    | Public | `refreshTokenSchema`: `{ refresh_token }` (Rate limit: 30 lần/15p/IP) | `200 { token, refreshToken }`                                                                             |
| `POST`   | `/api/auth/logout`     | Public | `logoutSchema`: `{ refresh_token? }`                                  | `200 { message }`                                                                                         |
| `POST`   | `/api/auth/logout-all` | Admin  | —                                                                     | `200 { message }`                                                                                         |
| `GET`    | `/api/auth/me`         | Admin  | —                                                                     | `200 { admin: { id, email, role } }`                                                                      |
| `PATCH`  | `/api/auth/me`         | Admin  | `updateMeSchema`: `{ email?, newPassword?, currentPassword }`         | `200 { message, token, admin }`                                                                           |
| `GET`    | `/api/auth/admins`     | Admin  | —                                                                     | `200 Admin[]`                                                                                             |
| `POST`   | `/api/auth/admins`     | Owner  | `createAdminSchema`: `{ email, password (12–128 ký tự), name? }`      | `201 Admin`                                                                                               |
| `DELETE` | `/api/auth/admins/:id` | Owner  | `adminIdParamSchema` / `uuidParamSchema`: Path `id` (UUID)            | `204 No Content`                                                                                          |
| `GET`    | `/api/admin/summary`   | Admin  | —                                                                     | `200 { leads_total, leads_new, materials_total, services_total, venues_total, projects_published_total }` |

---

## 3. Quản lý Khách hàng Tiềm năng (Leads CRM)

| Method  | Endpoint                        | Quyền  | Request Body / Params                                                                     | Phản hồi tóm tắt                    |
| ------- | ------------------------------- | :----: | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| `POST`  | `/api/leads`                    | Public | `{ name, phone, email?, wedding_date?, message?, design_snapshot?, consent }` (Limit 5MB) | `201 { success: true, data: Lead }` |
| `GET`   | `/api/leads`                    | Admin  | Query: `page`, `limit`, `q`, `status`, `sort`                                             | `200 { data: Lead[], pagination }`  |
| `GET`   | `/api/leads/:id`                | Admin  | Path: `id`                                                                                | `200 { success: true, data: Lead }` |
| `PATCH` | `/api/leads/:id`                | Admin  | `{ status: "new" \| "contacted" \| "closed" }`                                            | `200 { success: true, data: Lead }` |
| `GET`   | `/api/leads/:leadId/activities` | Admin  | Path: `leadId`                                                                            | `200 Activity[]`                    |
| `POST`  | `/api/leads/:leadId/activities` | Admin  | `{ action, notes? }`                                                                      | `201 Activity`                      |

---

## 4. Quản lý Báo giá (Quotations)

| Method   | Endpoint              | Quyền | Request Body / Params                                                                 | Phản hồi tóm tắt                             |
| -------- | --------------------- | :---: | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `GET`    | `/api/quotations`     | Admin | Query: `lead_id?`                                                                     | `200 Quotation[]`                            |
| `POST`   | `/api/quotations`     | Admin | `{ lead_id, items: [{ name, quantity, unit_price, unit }], notes?, discount?, vat? }` | `201 Quotation` (Mã tự sinh `BG-YYYY-XXXXX`) |
| `GET`    | `/api/quotations/:id` | Admin | Path: `id`                                                                            | `200 Quotation`                              |
| `DELETE` | `/api/quotations/:id` | Admin | Path: `id`                                                                            | `200 { success: true }`                      |

---

## 5. Vật liệu & Gói Dịch vụ Bento (Materials & Services)

| Method   | Endpoint             | Quyền  | Request Body / Params                                          | Phản hồi tóm tắt        |
| -------- | -------------------- | :----: | -------------------------------------------------------------- | ----------------------- |
| `GET`    | `/api/materials`     | Public | —                                                              | `200 Material[]`        |
| `POST`   | `/api/materials`     | Admin  | Multipart: `{ name, category?, description?, price?, image? }` | `201 Material`          |
| `PATCH`  | `/api/materials/:id` | Admin  | Multipart: cập nhật thông tin/ảnh vật liệu                     | `200 Material`          |
| `DELETE` | `/api/materials/:id` | Admin  | Path: `id`                                                     | `200 { success: true }` |
| `GET`    | `/api/services`      | Public | —                                                              | `200 Service[]`         |
| `POST`   | `/api/services`      | Admin  | `{ title, slug, description, image, features }`                | `201 Service`           |
| `PATCH`  | `/api/services/:id`  | Admin  | Cập nhật thông tin dịch vụ                                     | `200 Service`           |
| `DELETE` | `/api/services/:id`  | Admin  | Path: `id`                                                     | `200 { success: true }` |

---

## 6. Địa điểm & Dự án Bản đồ (Venues & Projects)

| Method   | Endpoint                        | Quyền  | Request Body / Params                                            | Phản hồi tóm tắt                    |
| -------- | ------------------------------- | :----: | ---------------------------------------------------------------- | ----------------------------------- |
| `GET`    | `/api/venues`                   | Public | —                                                                | `200 Venue[]` (kèm `project_count`) |
| `POST`   | `/api/venues`                   | Admin  | `{ name, type, address, city, lat, lng, cover_image? }`          | `201 Venue`                         |
| `PATCH`  | `/api/venues/:id`               | Admin  | Cập nhật thông tin ghim địa điểm                                 | `200 Venue`                         |
| `DELETE` | `/api/venues/:id`               | Admin  | Path: `id`                                                       | `200 { success: true }`             |
| `POST`   | `/api/venues/:venueId/projects` | Admin  | Multipart: tạo dự án trực tiếp gắn với venue                     | `201 Project`                       |
| `GET`    | `/api/projects`                 | Public | — (chỉ trả về dự án `published = true`)                          | `200 Project[]`                     |
| `GET`    | `/api/projects/admin`           | Admin  | — (trả về tất cả dự án kể cả bản nháp)                           | `200 Project[]`                     |
| `POST`   | `/api/projects`                 | Admin  | Multipart: `{ title, tag, venue_id?, cover, images, published }` | `201 Project`                       |
| `PATCH`  | `/api/projects/:id`             | Admin  | Multipart: cập nhật dự án                                        | `200 Project`                       |
| `DELETE` | `/api/projects/:id`             | Admin  | Path: `id`                                                       | `200 { success: true }`             |

---

## 7. Đánh giá Khách hàng (Testimonials)

| Method   | Endpoint                  | Quyền  | Request Body / Params                                                | Phản hồi tóm tắt                        |
| -------- | ------------------------- | :----: | -------------------------------------------------------------------- | --------------------------------------- |
| `GET`    | `/api/testimonials`       | Public | — (chỉ trả về đánh giá đã được duyệt `published = true`)             | `200 Testimonial[]`                     |
| `POST`   | `/api/testimonials`       | Public | `{ client_name, event_type, content, rating, avatar_url?, consent }` | `201 Testimonial` (`published = false`) |
| `GET`    | `/api/testimonials/admin` | Admin  | — (trả về toàn bộ đánh giá chờ duyệt và đã duyệt)                    | `200 Testimonial[]`                     |
| `PATCH`  | `/api/testimonials/:id`   | Admin  | `{ published?, rating?, content? }`                                  | `200 Testimonial`                       |
| `DELETE` | `/api/testimonials/:id`   | Admin  | Path: `id`                                                           | `200 { success: true }`                 |

---

## 8. Studio Thiết kế Tương tác (Studio Templates & Assets)

| Method   | Endpoint                            | Quyền  | Request Body / Params                                                                                   | Phản hồi tóm tắt            |
| -------- | ----------------------------------- | :----: | ------------------------------------------------------------------------------------------------------- | --------------------------- |
| `GET`    | `/api/studio/templates`             | Public | — (chỉ lấy template `is_active = true`)                                                                 | `200 Template[]`            |
| `GET`    | `/api/studio/templates/admin`       | Admin  | — (lấy toàn bộ template cả nháp)                                                                        | `200 Template[]`            |
| `PATCH`  | `/api/studio/templates/:id`         | Admin  | `{ name?, thumbnail?, svg_base?, category?, is_active?, default_config? }`                              | `200 Template`              |
| `PUT`    | `/api/studio/templates/:id/publish` | Admin  | `{ name, svg_base, thumbnail?, category?, is_active?, slot_config?, slots?, rules? }` (Body limit 10MB) | `200 { message, template }` |
| `DELETE` | `/api/studio/templates/:id`         | Admin  | Path: `id` (xóa template và dọn thumbnail Cloudinary)                                                   | `204 No Content`            |
| `GET`    | `/api/studio/templates/:id/slots`   | Public | Path: `id` (danh sách slot definitions theo `sort_order`)                                               | `200 SlotDefinition[]`      |
| `DELETE` | `/api/studio/slots/:slotId`         | Admin  | Path: `slotId`                                                                                          | `204 No Content`            |
| `GET`    | `/api/studio/assets/admin`          | Admin  | — (danh mục tài nguyên decor rèm, hoa, bảng chữ dùng trong Studio)                                      | `200 Asset[]`               |
| `GET`    | `/api/studio/templates/:id/rules`   | Public | Path: `id` (danh sách slot rules theo `priority`)                                                       | `200 SlotRule[]`            |
