# Pi Decor — Cơ sở dữ liệu PostgreSQL

Schema cơ sở dữ liệu PostgreSQL cho Pi Decor (hỗ trợ triển khai trên Docker cục bộ, Neon, Supabase, hoặc Render Postgres).

## Cấu trúc thư mục

```
database/
├── README.md          — Tài liệu này
├── migrate.js         — Áp dụng migrations/*.sql theo thứ tự, ghi vết qua schema_migrations
├── security/          — Script tạo role giới hạn quyền pidecor_app
└── migrations/        — Danh sách migration từ 0001 đến 0029
```

### Danh sách Migration (0001 – 0029)

1. `0001_extensions.sql`: Kích hoạt pg_trgm và unaccent cho tìm kiếm toàn văn.
2. `0002_schema_migrations.sql`: Bảng ghi vết lịch sử migration.
3. `0003_admins.sql`: Bảng quản trị viên và mật khẩu băm bcrypt.
4. `0004_leads.sql`: Bảng thông tin khách hàng liên hệ và snapshot thiết kế.
5. `0005_designs.sql`: Bảng lưu trạng thái canvas tương tác.
6. `0006_materials.sql`: Bảng danh mục vật liệu trang trí.
7. `0007_services.sql`: Bảng dịch vụ Bento.
8. `0008_venues.sql`: Bảng địa điểm tổ chức tiệc trên bản đồ.
9. `0009_projects.sql`: Bảng dự án case study tiệc cưới thực tế.
10. `0010_updated_at_trigger.sql`: Trigger tự động cập nhật `updated_at`.
11. `0011_views.sql`: Các view tiện ích tổng hợp số liệu.
12. `0012_media_assets.sql`: Quản lý tài nguyên media tải lên.
13. `0013_lead_activities.sql`: Dòng thời gian hoạt động chăm sóc lead.
14. `0014_quotations.sql`: Bảng báo giá chi tiết cho lead.
15. `0015_testimonials.sql`: Bảng đánh giá và lời chứng thực của khách hàng.
16. `0016_remove_lead_status_trigger.sql`: Tinh chỉnh trigger cập nhật trạng thái lead.
17. `0017_studio_templates.sql`: Quản lý template canvas Studio và slot definitions.
18. `0018_refresh_tokens.sql`: Bảng lưu băm refresh token admin.
19. `0019_studio_templates_default_config.sql`: Cấu hình mặc định cho template studio.
20. `0020_make_venue_id_nullable_in_projects.sql`: Cho phép dự án không bắt buộc gắn venue.
21. `0021_add_missing_project_columns.sql`: Bổ sung các cột thông tin dự án.
22. `0022_update_services_schema.sql`: Cập nhật cấu trúc thuộc tính dịch vụ.
23. `0023_studio_assets_unique_name.sql`: Ràng buộc tên duy nhất cho asset studio.
24. `0024_add_price_tier_to_projects.sql`: Phân cấp mức giá dự án.
25. `0025_admins_role.sql`: Bổ sung phân quyền role (`owner` / `admin`).
26. `0025_quotation_counters.sql`: Bộ đếm nguyên tử sinh mã báo giá `BG-YYYY-XXXXX`.
27. `0026_studio_templates_columns.sql`: Mở rộng trường dữ liệu template studio.
28. `0027_query_performance_indexes.sql`: Chỉ mục tối ưu hóa hiệu năng truy vấn.
29. `0028_refresh_tokens_rotation.sql`: Bổ sung gia phả xoay vòng và phát hiện tái sử dụng refresh token.
30. `0029_add_consent_columns.sql`: Lưu trữ vết đồng ý dữ liệu cá nhân (`consent_at`, `consent_version`).

## Ánh xạ Bảng đến API

| Bảng                      | Router Backend                 | Vai trò & Nghiệp vụ                             |
| ------------------------- | ------------------------------ | ----------------------------------------------- |
| `admins`                  | `routes/auth/index.js`         | Tài khoản admin/owner, xác thực phiên đăng nhập |
| `leads`                   | `routes/leads/index.js`        | Khách gửi liên hệ hoặc lưu thiết kế Studio      |
| `designs`                 | —                              | Snapshot canvas tương tác (lịch sử)             |
| `materials`               | `routes/materials/index.js`    | Danh mục vật liệu trang trí                     |
| `services`                | `routes/services/index.js`     | Danh mục dịch vụ Bento trang chủ                |
| `venues`                  | `routes/venues/index.js`       | Ghim địa điểm trên bản đồ tương tác Leaflet     |
| `projects`                | `routes/venues/index.js`       | Dự án thực tế gắn với từng địa điểm             |
| `media_assets`            | `utils/uploadImage.js`         | Quản lý tệp tải lên (Cloudinary / Local)        |
| `lead_activities`         | `routes/leads/index.js`        | Lịch sử tương tác chăm sóc khách hàng           |
| `quotations`              | `routes/quotations/index.js`   | Báo giá chi tiết xuất cho lead                  |
| `quotation_counters`      | `routes/quotations/index.js`   | Đếm số thứ tự báo giá nguyên tử theo năm        |
| `testimonials`            | `routes/testimonials/index.js` | Đánh giá khách hàng, kiểm duyệt hiển thị        |
| `studio_templates`        | `routes/studio/index.js`       | Template nền canvas studio                      |
| `studio_slot_definitions` | `routes/studio/index.js`       | Tọa độ và loại vị trí gắn vật phẩm decor        |
| `studio_assets`           | `routes/studio/index.js`       | Thư viện vật phẩm decor (rèm, hoa, chữ,...)     |
| `studio_slot_rules`       | `routes/studio/index.js`       | Quy tắc ràng buộc lựa chọn giữa các slot        |
| `refresh_tokens`          | `routes/auth/index.js`         | Token xoay vòng duy trì phiên đăng nhập         |

## Hướng dẫn kết nối PostgreSQL

### Cách 1: Chạy Docker cục bộ (Khuyên dùng khi dev)

Trong thư mục gốc dự án hoặc thư mục `server/`:

```bash
docker compose up -d
```

Chuỗi kết nối trong `.env`:

```
DATABASE_URL=postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor
```

### Cách 2: Sử dụng Dịch vụ Cloud (Neon / Supabase / Render Postgres)

1. Tạo dự án trên nền tảng (chọn region Singapore để tối ưu độ trễ).
2. Lấy connection string có bật SSL (`?sslmode=require`).
3. Dán vào `DATABASE_URL` trong `server/.env`.

### Chạy Migration & Khởi tạo Dữ liệu

```bash
cd server
npm run migrate    # Tạo đầy đủ bảng, index, trigger
npm run seed       # Tạo tài khoản admin và dữ liệu mẫu
npm run dev        # Khởi chạy server API
```

## Bảo mật cơ sở dữ liệu

- **Phân quyền tối thiểu**: Không dùng role owner để chạy API production. Tạo role `pidecor_app` theo hướng dẫn tại [`database/SECURITY.md`](./SECURITY.md).
- **Kiến trúc bảo mật**: Frontend không bao giờ gọi trực tiếp cơ sở dữ liệu mà luôn đi qua tầng kiểm soát của Express (`verifyToken`, `requireAdmin`, `validate`).
- **Không dùng ORM phức tạp**: Sử dụng lớp adapter parameterized query (`database.pg.js`) với allowlist tên bảng và cột để triệt tiêu nguy cơ SQL Injection và kiểm soát chính xác hiệu năng truy vấn.
