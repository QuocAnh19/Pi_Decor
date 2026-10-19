# Từ Điển Dữ Liệu Pi Decor (Data Dictionary)

> Tài liệu này được sinh tự động bởi script `npm run docs:db` từ PostgreSQL catalog.

## Danh Sách Các Bảng

1. [admins](#1-admins) — Tài khoản quản trị viên hệ thống Pi Decor (/admin/*)
2. [lead_activities](#2-lead_activities) — Nhật ký các hoạt động, trao đổi và đổi trạng thái của lead
3. [leads](#3-leads) — Thông tin liên hệ và yêu cầu tư vấn từ khách hàng tiềm năng
4. [materials](#4-materials) — Danh mục vật liệu trang trí tiệc cưới (vải, hoa, cổng vòm, đèn)
5. [projects](#5-projects) — Dự án đám cưới mẫu và lookbook các gói trang trí thực tế
6. [quotation_counters](#6-quotation_counters) — Bộ đếm số thứ tự báo giá nguyên tử theo từng năm
7. [quotations](#7-quotations) — Bảng báo giá dịch vụ cưới gửi đến khách hàng tiềm năng
8. [refresh_tokens](#8-refresh_tokens) — Quản lý refresh token xác thực phiên làm việc của quản trị viên
9. [services](#9-services) — Danh mục gói dịch vụ tiệc cưới hiển thị trên trang chủ
10. [studio_assets](#10-studio_assets) — Thư viện vật liệu và phụ kiện họa tiết dùng cho Studio
11. [studio_slot_definitions](#11-studio_slot_definitions) — Định nghĩa vị trí và quy tắc hiển thị các slot trên mẫu Studio
12. [studio_slot_rules](#12-studio_slot_rules) — Quy tắc tương tác và ràng buộc giữa các slot trong Studio
13. [studio_templates](#13-studio_templates) — Mẫu phông nền không gian tiệc cưới cho Studio thiết kế
14. [testimonials](#14-testimonials) — Đánh giá, phản hồi và cảm nhận thực tế từ các cặp đôi
15. [venues](#15-venues) — Danh sách địa điểm tổ chức sự kiện và khách sạn đối tác

---

### 1. admins

- **Mục đích**: Tài khoản quản trị viên hệ thống Pi Decor (/admin/*)
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột             | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                    |
| :-------------- | :------------------------- | :------------ | :------------------ | :------------------------------------------------------- |
| `id`            | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh quản trị viên (UUID)                |
| `email`         | `text`                     | Không         | —                   | Địa chỉ email đăng nhập duy nhất của quản trị viên       |
| `password_hash` | `text`                     | Không         | —                   | Chuỗi băm mật khẩu bằng bcryptjs, không lưu mật khẩu gốc |
| `role`          | `text`                     | Không         | `'admin'::text`     | Vai trò phân quyền quản trị viên: admin hoặc owner       |
| `created_at`    | `timestamp with time zone` | Không         | `now()`             | Thời điểm tạo tài khoản quản trị                         |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `admins_email_key`: `CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email)`
- `admins_pkey`: `CREATE UNIQUE INDEX admins_pkey ON public.admins USING btree (id)`

#### Triggers

- Không có trigger.

---

### 2. lead_activities

- **Mục đích**: Nhật ký các hoạt động, trao đổi và đổi trạng thái của lead
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột             | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                                               |
| :-------------- | :------------------------- | :------------ | :------------------ | :-------------------------------------------------------------------------------------------------- |
| `id`            | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh hoạt động (UUID)                                                               |
| `lead_id`       | `uuid`                     | Không         | —                   | Khóa ngoại tham chiếu đến lead tiếp nhận                                                            |
| `admin_id`      | `uuid`                     | Có            | —                   | Khóa ngoại tham chiếu đến quản trị viên thực hiện thao tác                                          |
| `activity_type` | `text`                     | Không         | —                   | Loại hoạt động: status_change, note, quotation_sent, call_logged, system, call, email, design_saved |
| `body`          | `text`                     | Có            | —                   | Nội dung chi tiết của hoạt động hoặc ghi chú                                                        |
| `metadata`      | `jsonb`                    | Có            | —                   | Dữ liệu bổ sung dạng JSON tùy theo loại hoạt động                                                   |
| `created_at`    | `timestamp with time zone` | Không         | `now()`             | Thời điểm ghi nhận hoạt động                                                                        |

#### Khóa ngoại (Foreign Keys)

- `lead_activities_admin_id_fkey`: `FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL`
- `lead_activities_lead_id_fkey`: `FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE`

#### Chỉ mục (Indexes)

- `idx_lead_activities_lead_id`: `CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities USING btree (lead_id, created_at DESC)`
- `lead_activities_pkey`: `CREATE UNIQUE INDEX lead_activities_pkey ON public.lead_activities USING btree (id)`

#### Triggers

- Không có trigger.

---

### 3. leads

- **Mục đích**: Thông tin liên hệ và yêu cầu tư vấn từ khách hàng tiềm năng
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột               | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                 |
| :---------------- | :------------------------- | :------------ | :------------------ | :-------------------------------------------------------------------- |
| `id`              | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh khách hàng tiềm năng (UUID)                      |
| `name`            | `text`                     | Không         | —                   | Họ và tên khách hàng liên hệ                                          |
| `phone`           | `text`                     | Không         | —                   | Số điện thoại liên hệ (10 chữ số chuẩn Việt Nam)                      |
| `email`           | `text`                     | Có            | —                   | Địa chỉ thư điện tử của khách hàng                                    |
| `wedding_date`    | `date`                     | Có            | —                   | Ngày dự kiến tổ chức hôn lễ                                           |
| `message`         | `text`                     | Có            | —                   | Ghi chú, lời nhắn hoặc mong muốn thiết kế của khách hàng              |
| `design_snapshot` | `jsonb`                    | Có            | —                   | Dữ liệu JSON lưu trạng thái thiết kế từ Studio (BuilderState)         |
| `status`          | `text`                     | Không         | `'new'::text`       | Trạng thái xử lý: new (mới), contacted (đã liên hệ), closed (đã chốt) |
| `created_at`      | `timestamp with time zone` | Không         | `now()`             | Thời điểm khách hàng gửi biểu mẫu liên hệ                             |
| `consent_at`      | `timestamp with time zone` | Có            | —                   | Thời điểm khách hàng đồng ý điều khoản xử lý dữ liệu cá nhân          |
| `consent_version` | `text`                     | Có            | —                   | Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý          |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `idx_leads_created_at`: `CREATE INDEX idx_leads_created_at ON public.leads USING btree (created_at DESC)`
- `idx_leads_email_trgm`: `CREATE INDEX idx_leads_email_trgm ON public.leads USING gin (email gin_trgm_ops)`
- `idx_leads_name_trgm`: `CREATE INDEX idx_leads_name_trgm ON public.leads USING gin (name gin_trgm_ops)`
- `idx_leads_phone`: `CREATE INDEX idx_leads_phone ON public.leads USING btree (phone)`
- `idx_leads_phone_trgm`: `CREATE INDEX idx_leads_phone_trgm ON public.leads USING gin (phone gin_trgm_ops)`
- `idx_leads_status`: `CREATE INDEX idx_leads_status ON public.leads USING btree (status)`
- `leads_pkey`: `CREATE UNIQUE INDEX leads_pkey ON public.leads USING btree (id)`

#### Triggers

- Không có trigger.

---

### 4. materials

- **Mục đích**: Danh mục vật liệu trang trí tiệc cưới (vải, hoa, cổng vòm, đèn)
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột          | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                                      |
| :----------- | :------------------------- | :------------ | :------------------ | :----------------------------------------------------------------------------------------- |
| `id`         | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh vật liệu (UUID)                                                       |
| `name`       | `text`                     | Không         | —                   | Tên mẫu vật liệu hoặc phụ kiện                                                             |
| `category`   | `text`                     | Không         | —                   | Phân loại vật liệu: fabric, flower, flowers, arch, prop, lighting, drape_detail, text_name |
| `color_hex`  | `text`                     | Có            | —                   | Mã màu đại diện định dạng Hex (ví dụ: #F8F9FA)                                             |
| `image_url`  | `text`                     | Có            | —                   | Đường dẫn hình ảnh chụp mẫu vật liệu thực tế                                               |
| `created_at` | `timestamp with time zone` | Không         | `now()`             | Thời điểm thêm vật liệu vào hệ thống                                                       |
| `updated_at` | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật thông tin vật liệu gần nhất                                             |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `idx_materials_category`: `CREATE INDEX idx_materials_category ON public.materials USING btree (category)`
- `idx_materials_category_created_at`: `CREATE INDEX idx_materials_category_created_at ON public.materials USING btree (category, created_at)`
- `materials_pkey`: `CREATE UNIQUE INDEX materials_pkey ON public.materials USING btree (id)`

#### Triggers

- `trg_materials_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 5. projects

- **Mục đích**: Dự án đám cưới mẫu và lookbook các gói trang trí thực tế
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột            | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                               |
| :------------- | :------------------------- | :------------ | :------------------ | :---------------------------------------------------------------------------------- |
| `id`           | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh dự án (UUID)                                                   |
| `venue_id`     | `uuid`                     | Có            | —                   | Khóa ngoại tham chiếu đến địa điểm tổ chức                                          |
| `title`        | `text`                     | Không         | —                   | Tiêu đề dự án đám cưới hoặc concept trang trí                                       |
| `wedding_date` | `date`                     | Có            | —                   | Ngày diễn ra tiệc cưới của dự án                                                    |
| `style_tags`   | `text[]`                   | Không         | `'{}'::text[]`      | Mảng các thẻ phong cách dùng để lọc và tìm kiếm                                     |
| `cover_image`  | `text`                     | Có            | —                   | Đường dẫn ảnh bìa đại diện cho dự án                                                |
| `gallery`      | `jsonb`                    | Không         | `'[]'::jsonb`       | Mảng JSON chứa danh sách ảnh chi tiết trong album dự án                             |
| `lead_id`      | `uuid`                     | Có            | —                   | Khóa ngoại liên kết đến khách hàng nếu dự án tạo từ lead                            |
| `published`    | `boolean`                  | Không         | `true`              | Cờ trạng thái hiển thị công khai trên website (true = hiển thị)                     |
| `created_at`   | `timestamp with time zone` | Không         | `now()`             | Thời điểm tạo hồ sơ dự án                                                           |
| `updated_at`   | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật thông tin dự án gần nhất                                         |
| `location`     | `text`                     | Có            | —                   | Tên địa điểm hiển thị [CẦN XÁC NHẬN: có thể thay thế bằng venues.address]           |
| `description`  | `text`                     | Có            | —                   | Mô tả chi tiết concept và câu chuyện trang trí tiệc cưới                            |
| `budget`       | `text`                     | Có            | —                   | Mức ngân sách ước tính dạng văn bản [CẦN XÁC NHẬN: cột nghi thừa, đã có price_tier] |
| `status`       | `text`                     | Có            | `'active'::text`    | Trạng thái dự án: active [CẦN XÁC NHẬN: ít sử dụng, đã có cờ published]             |
| `category_id`  | `text`                     | Có            | —                   | Mã định danh danh mục dịch vụ liên quan [CẦN XÁC NHẬN]                              |
| `tag`          | `text`                     | Có            | —                   | Nhãn phân loại bổ sung [CẦN XÁC NHẬN: cột nghi thừa, đã có style_tags]              |
| `price_tier`   | `text`                     | Không         | `'standard'::text`  | Phân khúc giá dự án: standard, premium, luxury                                      |

#### Khóa ngoại (Foreign Keys)

- `projects_lead_id_fkey`: `FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL`
- `projects_venue_id_fkey`: `FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE`

#### Chỉ mục (Indexes)

- `idx_projects_category_id`: `CREATE INDEX idx_projects_category_id ON public.projects USING btree (category_id)`
- `idx_projects_lead_id`: `CREATE INDEX idx_projects_lead_id ON public.projects USING btree (lead_id) WHERE (lead_id IS NOT NULL)`
- `idx_projects_price_tier`: `CREATE INDEX idx_projects_price_tier ON public.projects USING btree (price_tier)`
- `idx_projects_published_created_at`: `CREATE INDEX idx_projects_published_created_at ON public.projects USING btree (published, created_at DESC)`
- `idx_projects_status`: `CREATE INDEX idx_projects_status ON public.projects USING btree (status)`
- `idx_projects_style_tags_gin`: `CREATE INDEX idx_projects_style_tags_gin ON public.projects USING gin (style_tags)`
- `idx_projects_venue_id`: `CREATE INDEX idx_projects_venue_id ON public.projects USING btree (venue_id)`
- `idx_projects_venue_published`: `CREATE INDEX idx_projects_venue_published ON public.projects USING btree (venue_id, published)`
- `projects_pkey`: `CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id)`

#### Triggers

- `trg_projects_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 6. quotation_counters

- **Mục đích**: Bộ đếm số thứ tự báo giá nguyên tử theo từng năm
- **Khóa chính**: `PRIMARY KEY (year)`

#### Danh sách cột

| Cột        | Kiểu dữ liệu | Cho phép Null | Mặc định | Mô tả                                             |
| :--------- | :----------- | :------------ | :------- | :------------------------------------------------ |
| `year`     | `integer`    | Không         | —        | Năm phát hành báo giá (Khóa chính)                |
| `last_seq` | `integer`    | Không         | `0`      | Số thứ tự báo giá cao nhất đã phát hành trong năm |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `quotation_counters_pkey`: `CREATE UNIQUE INDEX quotation_counters_pkey ON public.quotation_counters USING btree (year)`

#### Triggers

- Không có trigger.

---

### 7. quotations

- **Mục đích**: Bảng báo giá dịch vụ cưới gửi đến khách hàng tiềm năng
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột                | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                  |
| :----------------- | :------------------------- | :------------ | :------------------ | :--------------------------------------------------------------------- |
| `id`               | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh báo giá (UUID)                                    |
| `lead_id`          | `uuid`                     | Không         | —                   | Khóa ngoại tham chiếu đến khách hàng nhận báo giá                      |
| `admin_id`         | `uuid`                     | Có            | —                   | Khóa ngoại tham chiếu đến quản trị viên tạo báo giá                    |
| `quotation_number` | `text`                     | Không         | —                   | Mã số báo giá định dạng duy nhất BG-YYYY-XXXX                          |
| `items`            | `jsonb`                    | Không         | `'[]'::jsonb`       | Danh sách các hạng mục chi phí và số lượng dưới dạng mảng JSON         |
| `subtotal`         | `integer`                  | Không         | `0`                 | Tổng số tiền trước chiết khấu (VNĐ)                                    |
| `discount`         | `integer`                  | Không         | `0`                 | Số tiền giảm giá hoặc chiết khấu (VNĐ)                                 |
| `total`            | `integer`                  | Không         | `0`                 | Tổng chi phí thực tế khách hàng thanh toán (VNĐ)                       |
| `status`           | `text`                     | Không         | `'draft'::text`     | Trạng thái báo giá: draft, sent, accepted, rejected, declined, expired |
| `valid_until`      | `date`                     | Có            | —                   | Hạn chót có hiệu lực của bảng báo giá                                  |
| `notes`            | `text`                     | Có            | —                   | Ghi chú và điều khoản thanh toán đính kèm báo giá                      |
| `created_at`       | `timestamp with time zone` | Không         | `now()`             | Thời điểm khởi tạo báo giá                                             |
| `updated_at`       | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật báo giá gần nhất                                    |

#### Khóa ngoại (Foreign Keys)

- `quotations_admin_id_fkey`: `FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL`
- `quotations_lead_id_fkey`: `FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE`

#### Chỉ mục (Indexes)

- `idx_quotations_lead_id`: `CREATE INDEX idx_quotations_lead_id ON public.quotations USING btree (lead_id, created_at DESC)`
- `quotations_pkey`: `CREATE UNIQUE INDEX quotations_pkey ON public.quotations USING btree (id)`
- `quotations_quotation_number_key`: `CREATE UNIQUE INDEX quotations_quotation_number_key ON public.quotations USING btree (quotation_number)`

#### Triggers

- `trg_quotations_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 8. refresh_tokens

- **Mục đích**: Quản lý refresh token xác thực phiên làm việc của quản trị viên
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột           | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                    |
| :------------ | :------------------------- | :------------ | :------------------ | :----------------------------------------------------------------------- |
| `id`          | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh refresh token (UUID)                                |
| `admin_id`    | `uuid`                     | Không         | —                   | Khóa ngoại tham chiếu đến tài khoản admins sở hữu                        |
| `token_hash`  | `text`                     | Không         | —                   | Mã băm an toàn SHA-256 của refresh token                                 |
| `expires_at`  | `timestamp with time zone` | Không         | —                   | Thời điểm hết hạn hiệu lực của refresh token                             |
| `revoked_at`  | `timestamp with time zone` | Có            | —                   | Thời điểm token bị thu hồi khi đăng xuất hoặc xoay vòng                  |
| `created_at`  | `timestamp with time zone` | Không         | `now()`             | Thời điểm khởi tạo phiên refresh token                                   |
| `family_id`   | `uuid`                     | Có            | —                   | Định danh chuỗi phiên (token family) phục vụ phát hiện sử dụng lại token |
| `replaced_by` | `text`                     | Có            | —                   | Mã băm của refresh token mới đã thay thế token hiện tại                  |

#### Khóa ngoại (Foreign Keys)

- `refresh_tokens_admin_id_fkey`: `FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE`

#### Chỉ mục (Indexes)

- `idx_refresh_tokens_admin`: `CREATE INDEX idx_refresh_tokens_admin ON public.refresh_tokens USING btree (admin_id)`
- `idx_refresh_tokens_family`: `CREATE INDEX idx_refresh_tokens_family ON public.refresh_tokens USING btree (family_id)`
- `idx_refresh_tokens_token_hash`: `CREATE INDEX idx_refresh_tokens_token_hash ON public.refresh_tokens USING btree (token_hash)`
- `refresh_tokens_pkey`: `CREATE UNIQUE INDEX refresh_tokens_pkey ON public.refresh_tokens USING btree (id)`

#### Triggers

- Không có trigger.

---

### 9. services

- **Mục đích**: Danh mục gói dịch vụ tiệc cưới hiển thị trên trang chủ
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột           | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                       |
| :------------ | :------------------------- | :------------ | :------------------ | :---------------------------------------------------------- |
| `id`          | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh gói dịch vụ (UUID)                     |
| `title`       | `text`                     | Không         | —                   | Tên gói dịch vụ cưới                                        |
| `description` | `text`                     | Không         | `''::text`          | Mô tả tóm tắt nội dung gói dịch vụ                          |
| `image_url`   | `text`                     | Có            | —                   | Đường dẫn ảnh minh họa dịch vụ                              |
| `order`       | `integer`                  | Không         | `0`                 | Thứ tự ưu tiên sắp xếp hiển thị trên giao diện              |
| `created_at`  | `timestamp with time zone` | Không         | `now()`             | Thời điểm tạo dịch vụ                                       |
| `updated_at`  | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật dịch vụ gần nhất                         |
| `brand`       | `text`                     | Có            | —                   | Tên thương hiệu phụ hoặc phân nhóm dịch vụ                  |
| `tagline`     | `text`                     | Có            | —                   | Thông điệp ngắn hoặc slogan của gói dịch vụ                 |
| `icon`        | `text`                     | Có            | —                   | Tên icon đại diện cho dịch vụ                               |
| `accent`      | `text`                     | Có            | —                   | Tên lớp màu hoặc mã màu nhấn trực quan                      |
| `items`       | `jsonb`                    | Không         | `'[]'::jsonb`       | Mảng JSON danh sách các hạng mục chi tiết bao gồm trong gói |
| `href`        | `text`                     | Có            | —                   | Đường dẫn liên kết điều hướng khi nhấn vào thẻ dịch vụ      |
| `cta_label`   | `text`                     | Có            | —                   | Văn bản hiển thị trên nút kêu gọi hành động                 |
| `featured`    | `boolean`                  | Không         | `false`             | Cờ đánh dấu gói dịch vụ nổi bật hiển thị ở vị trí ưu tiên   |
| `cover`       | `text`                     | Có            | —                   | Đường dẫn ảnh bìa lớn hiển thị trong thẻ bento              |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `idx_services_order`: `CREATE INDEX idx_services_order ON public.services USING btree ("order")`
- `services_pkey`: `CREATE UNIQUE INDEX services_pkey ON public.services USING btree (id)`

#### Triggers

- `trg_services_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 10. studio_assets

- **Mục đích**: Thư viện vật liệu và phụ kiện họa tiết dùng cho Studio
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột               | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                |
| :---------------- | :------------------------- | :------------ | :------------------ | :------------------------------------------------------------------- |
| `id`              | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh tài nguyên Studio (UUID)                        |
| `asset_type`      | `text`                     | Không         | —                   | Phân loại tài nguyên: drape, drape_detail, flower, font, color, prop |
| `name`            | `text`                     | Không         | —                   | Tên phụ kiện hoặc tài nguyên trang trí                               |
| `thumbnail`       | `text`                     | Có            | —                   | Đường dẫn ảnh thu nhỏ của tài nguyên                                 |
| `svg_data`        | `text`                     | Có            | —                   | Mã nguồn đồ họa vector SVG của tài nguyên                            |
| `color_hex`       | `text`                     | Có            | —                   | Mã màu Hex nếu tài nguyên thuộc loại màu sắc                         |
| `font_family`     | `text`                     | Có            | —                   | Tên bộ phông chữ nếu tài nguyên thuộc loại văn bản                   |
| `tags`            | `jsonb`                    | Không         | `'[]'::jsonb`       | Mảng JSON chứa danh sách thẻ tìm kiếm                                |
| `is_active`       | `boolean`                  | Không         | `true`              | Cờ cho phép sử dụng tài nguyên này trên Studio                       |
| `dominant_colors` | `jsonb`                    | Có            | —                   | Mảng JSON chứa các màu sắc chủ đạo của tài nguyên                    |
| `created_at`      | `timestamp with time zone` | Không         | `now()`             | Thời điểm tải lên tài nguyên                                         |
| `updated_at`      | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật tài nguyên gần nhất                               |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `idx_studio_assets_active_created_at`: `CREATE INDEX idx_studio_assets_active_created_at ON public.studio_assets USING btree (is_active, created_at DESC)`
- `idx_studio_assets_unique_type_name`: `CREATE UNIQUE INDEX idx_studio_assets_unique_type_name ON public.studio_assets USING btree (asset_type, name)`
- `studio_assets_pkey`: `CREATE UNIQUE INDEX studio_assets_pkey ON public.studio_assets USING btree (id)`

#### Triggers

- `trg_studio_assets_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 11. studio_slot_definitions

- **Mục đích**: Định nghĩa vị trí và quy tắc hiển thị các slot trên mẫu Studio
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột            | Kiểu dữ liệu | Cho phép Null | Mặc định            | Mô tả                                                                                             |
| :------------- | :----------- | :------------ | :------------------ | :------------------------------------------------------------------------------------------------ |
| `id`           | `uuid`       | Không         | `gen_random_uuid()` | Khóa chính định danh slot (UUID)                                                                  |
| `template_id`  | `uuid`       | Không         | —                   | Khóa ngoại tham chiếu đến mẫu studio_templates chứa slot                                          |
| `slot_key`     | `text`       | Không         | —                   | Mã định danh duy nhất của slot trong cùng một mẫu không gian                                      |
| `label`        | `text`       | Không         | —                   | Tên hiển thị thân thiện của slot cho người dùng                                                   |
| `slot_type`    | `text`       | Không         | —                   | Loại vật liệu cho phép gán: drape, drape_detail, flower, text_name, text_date, color_accent, prop |
| `norm_x`       | `numeric`    | Không         | —                   | Tọa độ X chuẩn hóa (0.0 đến 1.0) tính theo tỷ lệ chiều rộng canvas                                |
| `norm_y`       | `numeric`    | Không         | —                   | Tọa độ Y chuẩn hóa (0.0 đến 1.0) tính theo tỷ lệ chiều cao canvas                                 |
| `norm_width`   | `numeric`    | Có            | —                   | Chiều rộng chuẩn hóa (0.0 đến 1.0) theo canvas                                                    |
| `norm_height`  | `numeric`    | Có            | —                   | Chiều cao chuẩn hóa (0.0 đến 1.0) theo canvas                                                     |
| `allow_scale`  | `boolean`    | Không         | `true`              | Cho phép người dùng tùy chỉnh kích thước vật liệu trên slot                                       |
| `allow_rotate` | `boolean`    | Không         | `false`             | Cho phép người dùng xoay góc nghiêng của vật liệu trên slot                                       |
| `mirror_x`     | `boolean`    | Không         | `false`             | Hỗ trợ lật đối xứng vật liệu theo trục ngang                                                      |
| `z_index`      | `integer`    | Không         | `0`                 | Thứ tự xếp lớp hiển thị (layer) trên canvas thiết kế                                              |
| `sort_order`   | `integer`    | Không         | `0`                 | Thứ tự hiển thị slot trong danh mục điều khiển                                                    |
| `required`     | `boolean`    | Không         | `false`             | Bắt buộc khách hàng phải chọn vật liệu cho slot này trước khi hoàn thành                          |

#### Khóa ngoại (Foreign Keys)

- `studio_slot_definitions_template_id_fkey`: `FOREIGN KEY (template_id) REFERENCES studio_templates(id) ON DELETE CASCADE`

#### Chỉ mục (Indexes)

- `idx_studio_slots_template`: `CREATE INDEX idx_studio_slots_template ON public.studio_slot_definitions USING btree (template_id, sort_order)`
- `studio_slot_definitions_pkey`: `CREATE UNIQUE INDEX studio_slot_definitions_pkey ON public.studio_slot_definitions USING btree (id)`
- `studio_slot_definitions_template_id_slot_key_key`: `CREATE UNIQUE INDEX studio_slot_definitions_template_id_slot_key_key ON public.studio_slot_definitions USING btree (template_id, slot_key)`

#### Triggers

- Không có trigger.

---

### 12. studio_slot_rules

- **Mục đích**: Quy tắc tương tác và ràng buộc giữa các slot trong Studio
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột               | Kiểu dữ liệu | Cho phép Null | Mặc định            | Mô tả                                                          |
| :---------------- | :----------- | :------------ | :------------------ | :------------------------------------------------------------- |
| `id`              | `uuid`       | Không         | `gen_random_uuid()` | Khóa chính định danh quy tắc (UUID)                            |
| `template_id`     | `uuid`       | Không         | —                   | Khóa ngoại tham chiếu đến mẫu studio_templates áp dụng quy tắc |
| `rule_name`       | `text`       | Có            | —                   | Tên hoặc mô tả ngắn gọn về quy tắc nghiệp vụ                   |
| `condition_slot`  | `text`       | Không         | —                   | Mã slot điều kiện để kích hoạt quy tắc                         |
| `condition_value` | `jsonb`      | Không         | —                   | Giá trị điều kiện kích hoạt dạng JSON                          |
| `target_slot`     | `text`       | Không         | —                   | Mã slot mục tiêu chịu tác động của quy tắc                     |
| `action`          | `text`       | Không         | —                   | Hành động thực thi: force_asset, restrict_assets, hide_slot    |
| `action_value`    | `jsonb`      | Có            | —                   | Tham số giá trị của hành động thực thi dạng JSON               |
| `priority`        | `integer`    | Không         | `0`                 | Độ ưu tiên áp dụng quy tắc khi có nhiều ràng buộc đồng thời    |

#### Khóa ngoại (Foreign Keys)

- `studio_slot_rules_template_id_fkey`: `FOREIGN KEY (template_id) REFERENCES studio_templates(id) ON DELETE CASCADE`

#### Chỉ mục (Indexes)

- `idx_studio_rules_template`: `CREATE INDEX idx_studio_rules_template ON public.studio_slot_rules USING btree (template_id, priority)`
- `studio_slot_rules_pkey`: `CREATE UNIQUE INDEX studio_slot_rules_pkey ON public.studio_slot_rules USING btree (id)`

#### Triggers

- Không có trigger.

---

### 13. studio_templates

- **Mục đích**: Mẫu phông nền không gian tiệc cưới cho Studio thiết kế
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột              | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                      |
| :--------------- | :------------------------- | :------------ | :------------------ | :--------------------------------------------------------- |
| `id`             | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh mẫu không gian (UUID)                 |
| `name`           | `text`                     | Không         | —                   | Tên gọi của mẫu khung nền trang trí                        |
| `thumbnail`      | `text`                     | Có            | —                   | Đường dẫn ảnh thu nhỏ xem trước mẫu không gian             |
| `svg_base`       | `text`                     | Không         | —                   | Mã nguồn SVG gốc của khung nền không gian                  |
| `category`       | `text`                     | Có            | —                   | Phân loại bối cảnh: backdrop, gallery_table, entrance      |
| `is_active`      | `boolean`                  | Không         | `true`              | Cờ cho phép sử dụng mẫu không gian trên Studio             |
| `default_config` | `jsonb`                    | Không         | `'{}'::jsonb`       | Cấu hình mặc định các slot vật liệu ban đầu dưới dạng JSON |
| `created_at`     | `timestamp with time zone` | Không         | `now()`             | Thời điểm tạo mẫu không gian                               |
| `updated_at`     | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật mẫu không gian gần nhất                 |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `idx_studio_templates_active_created_at`: `CREATE INDEX idx_studio_templates_active_created_at ON public.studio_templates USING btree (is_active, created_at DESC)`
- `studio_templates_pkey`: `CREATE UNIQUE INDEX studio_templates_pkey ON public.studio_templates USING btree (id)`

#### Triggers

- `trg_studio_templates_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 14. testimonials

- **Mục đích**: Đánh giá, phản hồi và cảm nhận thực tế từ các cặp đôi
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột               | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                                               |
| :---------------- | :------------------------- | :------------ | :------------------ | :---------------------------------------------------------------------------------- |
| `id`              | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh đánh giá (UUID)                                                |
| `lead_id`         | `uuid`                     | Có            | —                   | Khóa ngoại liên kết với khách hàng tiềm năng ban đầu nếu có                         |
| `author`          | `text`                     | Không         | —                   | Tên cô dâu, chú rể hoặc khách hàng gửi đánh giá                                     |
| `role`            | `text`                     | Có            | —                   | Thông tin vai trò hiển thị (ví dụ: Cô dâu & Chú rể)                                 |
| `quote`           | `text`                     | Không         | —                   | Nội dung nhận xét, lời cảm ơn hoặc đánh giá chất lượng                              |
| `rating`          | `integer`                  | Không         | `5`                 | Điểm số đánh giá mức độ hài lòng từ 1 đến 5 sao                                     |
| `photos`          | `jsonb`                    | Không         | `'[]'::jsonb`       | Mảng JSON chứa danh sách ảnh tiệc cưới đính kèm kèm kích thước                      |
| `status`          | `text`                     | Không         | `'pending'::text`   | Trạng thái kiểm duyệt: pending (chờ duyệt), approved (đã duyệt), rejected (từ chối) |
| `source`          | `text`                     | Không         | `'customer'::text`  | Nguồn gửi: customer (khách gửi qua web), admin_seed (tạo từ admin)                  |
| `created_at`      | `timestamp with time zone` | Không         | `now()`             | Thời điểm gửi đánh giá                                                              |
| `updated_at`      | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật trạng thái kiểm duyệt gần nhất                                   |
| `consent_at`      | `timestamp with time zone` | Có            | —                   | Thời điểm đồng ý điều khoản xử lý dữ liệu cá nhân                                   |
| `consent_version` | `text`                     | Có            | —                   | Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý                        |

#### Khóa ngoại (Foreign Keys)

- `testimonials_lead_id_fkey`: `FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL`

#### Chỉ mục (Indexes)

- `idx_testimonials_status`: `CREATE INDEX idx_testimonials_status ON public.testimonials USING btree (status, created_at DESC)`
- `testimonials_pkey`: `CREATE UNIQUE INDEX testimonials_pkey ON public.testimonials USING btree (id)`

#### Triggers

- `trg_testimonials_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---

### 15. venues

- **Mục đích**: Danh sách địa điểm tổ chức sự kiện và khách sạn đối tác
- **Khóa chính**: `PRIMARY KEY (id)`

#### Danh sách cột

| Cột           | Kiểu dữ liệu               | Cho phép Null | Mặc định            | Mô tả                                                    |
| :------------ | :------------------------- | :------------ | :------------------ | :------------------------------------------------------- |
| `id`          | `uuid`                     | Không         | `gen_random_uuid()` | Khóa chính định danh địa điểm (UUID)                     |
| `name`        | `text`                     | Không         | —                   | Tên địa điểm, trung tâm hội nghị tiệc cưới               |
| `type`        | `text`                     | Không         | `'hotel'::text`     | Loại hình địa điểm: hotel, restaurant, resort, sảnh tiệc |
| `address`     | `text`                     | Có            | —                   | Địa chỉ chi tiết của địa điểm tổ chức                    |
| `city`        | `text`                     | Có            | —                   | Tỉnh hoặc thành phố nơi địa điểm tọa lạc                 |
| `lat`         | `double precision`         | Không         | —                   | Tọa độ vĩ độ (Latitude) hiển thị trên bản đồ             |
| `lng`         | `double precision`         | Không         | —                   | Tọa độ kinh độ (Longitude) hiển thị trên bản đồ          |
| `cover_image` | `text`                     | Có            | —                   | Đường dẫn ảnh đại diện của địa điểm                      |
| `created_at`  | `timestamp with time zone` | Không         | `now()`             | Thời điểm thêm địa điểm vào hệ thống                     |
| `updated_at`  | `timestamp with time zone` | Không         | `now()`             | Thời điểm cập nhật thông tin địa điểm gần nhất           |

#### Khóa ngoại (Foreign Keys)

- Không có khóa ngoại.

#### Chỉ mục (Indexes)

- `idx_venues_address_trgm`: `CREATE INDEX idx_venues_address_trgm ON public.venues USING gin (address gin_trgm_ops)`
- `idx_venues_city`: `CREATE INDEX idx_venues_city ON public.venues USING btree (city)`
- `idx_venues_city_trgm`: `CREATE INDEX idx_venues_city_trgm ON public.venues USING gin (city gin_trgm_ops)`
- `idx_venues_name_trgm`: `CREATE INDEX idx_venues_name_trgm ON public.venues USING gin (name gin_trgm_ops)`
- `venues_pkey`: `CREATE UNIQUE INDEX venues_pkey ON public.venues USING btree (id)`

#### Triggers

- `trg_venues_updated_at`: BEFORE UPDATE — `EXECUTE FUNCTION set_updated_at()`

---
