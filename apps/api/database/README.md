# Pi Decor — Cơ sở dữ liệu PostgreSQL

Schema cơ sở dữ liệu PostgreSQL cho Pi Decor (hỗ trợ triển khai trên Docker cục bộ, Neon, Supabase, hoặc Render Postgres).

## Cấu trúc thư mục

```
database/
├── README.md          — Tài liệu này
├── migrate.js         — Áp dụng migrations/*.sql theo thứ tự, ghi vết qua schema_migrations
├── security/          — Script tạo role giới hạn quyền pidecor_app (hướng dẫn cho Neon/Postgres)
└── migrations/        — Thư mục chứa migrations (0001_baseline.sql, 0002_drop_orphan_objects.sql)
```

### Danh sách Migrations

1. `0001_baseline.sql`: Baseline schema tổng hợp đầy đủ extensions, hàm trigger, 17 bảng, 2 view, toàn bộ index và seed counters.
2. `0002_drop_orphan_objects.sql`: Dọn dẹp 2 view mồ côi (`admin_dashboard_summary`, `venues_with_project_count`) và 2 bảng không còn sử dụng (`designs`, `media_assets`).

## Ánh xạ Bảng đến Module API (`apps/api/src/modules/`)

| Bảng                      | Module Backend (`src/modules/*`) | Vai trò & Nghiệp vụ                             |
| ------------------------- | -------------------------------- | ----------------------------------------------- |
| `admins`                  | `auth`                           | Tài khoản admin/owner, xác thực phiên đăng nhập |
| `leads`                   | `leads`                          | Khách gửi liên hệ hoặc lưu thiết kế Studio      |
| `materials`               | `materials`                      | Danh mục vật liệu trang trí                     |
| `services`                | `services`                       | Danh mục dịch vụ Bento trang chủ                |
| `venues`                  | `venues`                         | Ghim địa điểm trên bản đồ tương tác Leaflet     |
| `projects`                | `projects`                       | Dự án thực tế gắn với từng địa điểm             |
| `lead_activities`         | `leads`                          | Lịch sử tương tác chăm sóc khách hàng           |
| `quotations`              | `quotations`                     | Báo giá chi tiết xuất cho lead                  |
| `quotation_counters`      | `quotations`                     | Đếm số thứ tự báo giá nguyên tử theo năm        |
| `testimonials`            | `testimonials`                   | Đánh giá khách hàng, kiểm duyệt hiển thị        |
| `studio_templates`        | `studio`                         | Template nền canvas studio                      |
| `studio_slot_definitions` | `studio`                         | Tọa độ và loại vị trí gắn vật phẩm decor        |
| `studio_assets`           | `studio`                         | Thư viện vật phẩm decor (rèm, hoa, chữ,...)     |
| `studio_slot_rules`       | `studio`                         | Quy tắc ràng buộc lựa chọn giữa các slot        |
| `refresh_tokens`          | `auth`                           | Token xoay vòng duy trì phiên đăng nhập         |

## Hướng dẫn kết nối PostgreSQL

### Cách 1: Chạy Docker cục bộ (Khuyên dùng khi dev)

Trong thư mục gốc dự án:

```bash
docker compose up -d
```

Chuỗi kết nối trong `apps/api/.env`:

```
DATABASE_URL=postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor
DATABASE_URL_DIRECT=postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor
```

### Cách 2: Sử dụng Neon Postgres

1. Lấy 2 chuỗi kết nối từ Neon Dashboard (Singapore region):
   - `DATABASE_URL`: Chuỗi Pooled (`-pooler`), dành cho runtime Express.
   - `DATABASE_URL_DIRECT`: Chuỗi Direct (không có `-pooler`), dành cho migrate, seed và scripts.
2. Cấu hình vào `apps/api/.env`.

### Chạy Migration & Khởi tạo Dữ liệu

- **Cơ sở dữ liệu mới (Fresh DB)**:
  ```bash
  cd apps/api
  npm run migrate    # Áp dụng 0001_baseline.sql và 0002_drop_orphan_objects.sql
  npm run seed       # Khởi tạo tài khoản admin và dữ liệu danh mục mẫu
  ```
- **Chuyển đổi từ database cũ sang Baseline (Adopt Baseline)**:
  Nếu cơ sở dữ liệu đã tồn tại các bảng từ các migration trước:
  ```bash
  cd apps/api
  npm run migrate:adopt-baseline   # Đồng bộ schema_migrations sang 0001_baseline.sql
  npm run migrate                  # Chạy các migration tiếp theo (0002_...)
  ```

## Bảo mật cơ sở dữ liệu

- **Phân quyền tối thiểu**: Không dùng role owner để chạy API production. Tạo role `pidecor_app` theo hướng dẫn tại [`database/security/create_app_role.sql`](./security/create_app_role.sql).
- **Kiến trúc bảo mật**: Frontend không bao giờ gọi trực tiếp cơ sở dữ liệu mà luôn đi qua tầng kiểm soát của Express (`authenticateToken`, `requireRole`, Zod validation).
