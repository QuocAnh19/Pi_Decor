# Pi Decor

Nền tảng website và ứng dụng Studio tương tác phục vụ thiết kế, tư vấn trang trí tiệc cưới & sự kiện cao cấp. Hệ thống được tổ chức theo cấu trúc npm workspaces monorepo với frontend web (`apps/web`), backend API (`apps/api`) và các gói thư viện dùng chung (`packages/*`).

---

## Kiến trúc Tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                 Web Client (apps/web - React 18 + Vite)     │
│   Trang chủ (Bento) │ Bản đồ (Leaflet) │ Studio Canvas      │
│   Quản trị Admin (CRM, Báo giá, Dự án, Dịch vụ, Templates) │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / HTTPS)
┌──────────────────────────────▼──────────────────────────────┐
│                 API Server (apps/api - Express 5 ESM)       │
│   verifyToken (JWT) │ Zod Validation │ Rate Limit (Helmet)  │
│   Domain Routers: leads, auth, quotations, services, studio │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL
┌──────────────────────────────▼──────────────────────────────┐
│                 Database (PostgreSQL 16)                    │
│   Schema Migrations (0001_baseline) │ Triggers │ pg_trgm    │
│   Admins, Leads, Quotations, Services, Templates, Venues    │
└─────────────────────────────────────────────────────────────┘
```

---

## Yêu cầu Hệ thống

- **Node.js**: Phiên bản `>= 20.0.0` (được khai báo trong [.nvmrc](.nvmrc) và `package.json`).
- **Docker & Docker Compose**: Để khởi chạy cơ sở dữ liệu PostgreSQL cục bộ (hoặc có thể dùng dịch vụ cloud PostgreSQL như Neon).
- **Git**: Quản lý phiên bản mã nguồn.

---

## Hướng dẫn Chạy Cục bộ Từng bước (Từ Máy Trống)

### 1. Khởi động Cơ sở dữ liệu PostgreSQL

Tại thư mục gốc của repository, khởi chạy container PostgreSQL 16:

```bash
docker compose up -d
```

Cơ sở dữ liệu sẽ lắng nghe tại cổng `localhost:5432` với tài khoản mặc định `pidecor` / `pidecor_dev_only`.

_(Ghi chú: Nếu môi trường máy tính chưa cài đặt hoặc không bật Docker Desktop, bạn có thể sử dụng PostgreSQL cài trực tiếp trên máy hoặc chuỗi kết nối từ Neon PostgreSQL / Supabase, và điền vào biến `DATABASE_URL` bên dưới. Quá trình kiểm thử Docker sẽ được CI tự động xác nhận)._

### 2. Cấu hình Biến Môi trường

Sao chép tệp mẫu và điền cấu hình cho từng ứng dụng:

```bash
# Backend API
cp apps/api/.env.example apps/api/.env

# Frontend Web
cp apps/web/.env.example apps/web/.env
```

Tại `apps/api/.env`, cấu hình tối thiểu:

- `JWT_SECRET`: Chuỗi bí mật ký token tối thiểu 32 ký tự (chạy `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` để sinh chuỗi ngẫu nhiên an toàn).
- `DATABASE_URL`: `postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor` (nếu dùng Docker cục bộ).
- `DATABASE_URL_DIRECT`: `= DATABASE_URL`.
- `ADMIN_PASSWORD`: Mật khẩu tài khoản admin ban đầu (tối thiểu 12 ký tự, ví dụ: `Admin@PiDecor2026!`).

### 3. Cài đặt Toàn bộ Phụ thuộc (Workspaces)

**BẮT BUỘC thực hiện tại thư mục gốc repository** để npm thiết lập liên kết workspace monorepo và gói thư viện dùng chung `@pidecor/shared`:

```bash
npm install
```

_(Lưu ý: Tuyệt đối không chạy `npm install` riêng lẻ bên trong `apps/api` hay `apps/web` vì sẽ làm sai lệch cấu trúc liên kết symlink giữa các gói workspace)._

### 4. Khởi tạo Cơ sở dữ liệu Backend

Chạy script migration để khởi tạo cấu trúc bảng từ baseline và nạp dữ liệu mẫu ban đầu:

```bash
cd apps/api && npm run migrate && npm run seed && cd ../..
```

### 5. Khởi chạy Ứng dụng Chế độ Phát triển

Từ thư mục gốc repository, bạn có thể khởi chạy song song cả hai ứng dụng:

```bash
npm run dev:api    # Backend API lắng nghe tại http://localhost:4000
npm run dev:web    # Frontend Web giao diện tại http://localhost:5173
```

Hoặc chạy trong từng terminal riêng biệt:

- Backend: `cd apps/api && npm run dev`
- Frontend: `cd apps/web && npm run dev`

Kiểm tra trạng thái sẵn sàng của backend:

```bash
curl http://localhost:4000/api/health
```

Tài khoản quản trị viên mặc định: `admin@pidecor.vn` / mật khẩu đã cấu hình trong `ADMIN_PASSWORD` tại `apps/api/.env`.

---

## Bảng Biến Môi trường

### API Server (`apps/api/.env`)

| Tên biến                   | Bắt buộc  | Mặc định                        | Mô tả                                            | Giá trị ví dụ (Dev)                                                      |
| -------------------------- | :-------: | ------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `NODE_ENV`                 |   Không   | `development`                   | Môi trường runtime                               | `development`                                                            |
| `PORT`                     |   Không   | `4000`                          | Cổng HTTP API lắng nghe                          | `4000`                                                                   |
| `CORS_ORIGIN`              | Có (prod) | `http://localhost:5173`         | Domain client được phép gọi API                  | `http://localhost:5173`                                                  |
| `TRUST_PROXY`              |   Không   | `0` (dev) / `1` (prod)          | Đếm số hop qua reverse proxy                     | `0`                                                                      |
| `JWT_SECRET`               |  **Có**   | —                               | Khóa bí mật ký access token (>= 32 ký tự)        | `dev_secret_key_at_least_32_characters_long`                             |
| `JWT_EXPIRES_IN`           |   Không   | `15m`                           | Thời hạn của access token                        | `15m`                                                                    |
| `DATABASE_URL`             |  **Có**   | —                               | Chuỗi kết nối PostgreSQL (Neon Pooled)           | `postgresql://user:pass@ep-pooler.neon.tech/pidecor?sslmode=verify-full` |
| `DATABASE_URL_DIRECT`      |   Không   | `= DATABASE_URL`                | Chuỗi kết nối Postgres trực tiếp (migrate, seed) | `postgresql://user:pass@ep-direct.neon.tech/pidecor?sslmode=verify-full` |
| `DATABASE_URL_TEST`        |   Không   | —                               | Chuỗi kết nối Postgres riêng cho kiểm thử        | `postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor_test`      |
| `DB_POOL_MAX`              |   Không   | `5`                             | Số kết nối tối đa trong connection pool          | `5`                                                                      |
| `DB_SSL`                   |   Không   | `disable` (dev) / `verify-full` | Chế độ SSL (`disable`, `require`, `verify-full`) | `verify-full`                                                            |
| `DB_SSL_CA`                |   Không   | —                               | Đường dẫn file PEM hoặc chứng chỉ CA tùy chọn    | `/etc/ssl/certs/isrgrootx1.pem`                                          |
| `CLOUDINARY_CLOUD_NAME`    | Có (prod) | —                               | Cloud name tài khoản Cloudinary                  | `your_cloud_name`                                                        |
| `CLOUDINARY_API_KEY`       | Có (prod) | —                               | API Key tài khoản Cloudinary                     | `123456789012345`                                                        |
| `CLOUDINARY_API_SECRET`    | Có (prod) | —                               | API Secret tài khoản Cloudinary                  | `example_cloudinary_secret`                                              |
| `CLOUDINARY_FOLDER_PREFIX` | Có (prod) | `pidecor/dev`                   | Tiền tố thư mục Cloudinary theo môi trường       | `pidecor/prod`                                                           |
| `ADMIN_EMAIL`              | Có (seed) | —                               | Email đăng nhập admin khi seed                   | `admin@pidecor.vn`                                                       |
| `ADMIN_PASSWORD`           | Có (seed) | —                               | Mật khẩu admin khi seed (>= 12 ký tự)            | `Admin@PiDecor2026!`                                                     |
| `SENTRY_DSN`               |   Không   | —                               | DSN giám sát lỗi qua Sentry                      | `https://examplePublicKey@o0.ingest.sentry.io/0`                         |

### Web Client (`apps/web/.env`)

| Tên biến                       | Bắt buộc | Mặc định                    | Mô tả                                     | Giá trị ví dụ                                    |
| ------------------------------ | :------: | --------------------------- | ----------------------------------------- | ------------------------------------------------ |
| `VITE_API_URL`                 |  Không   | `http://localhost:4000/api` | Địa chỉ gốc của backend API               | `http://localhost:4000/api`                      |
| `VITE_SENTRY_DSN`              |  Không   | —                           | DSN Sentry phía client                    | `https://examplePublicKey@o0.ingest.sentry.io/0` |
| `VITE_BUSINESS_NAME`           |  Không   | —                           | Tên thương hiệu doanh nghiệp              | `Pi Decor Wedding & Event`                       |
| `VITE_BUSINESS_TELEPHONE`      |  Không   | —                           | Số điện thoại hotline                     | `+84 789 241 260`                                |
| `VITE_BUSINESS_EMAIL`          |  Không   | —                           | Email liên hệ chính                       | `contact@pidecor.vn`                             |
| `VITE_PRIVACY_POLICY_REVIEWED` |  Không   | `false`                     | Đánh dấu chính sách bảo mật đã được duyệt | `true`                                           |

---

## Kiểm Tra Toàn Diện & Đảm Bảo Chất Lượng

Trước mỗi commit hoặc deploy, luôn chạy lệnh kiểm tra toàn diện từ thư mục gốc repository:

```bash
# Kiểm tra tự động toàn bộ workspaces (TypeScript, ESLint, Stylelint, Knip, Test, Build, Syntax)
npm run verify

# Chạy bộ kiểm thử tự động End-to-End với Playwright (bao gồm visual snapshot)
npm run e2e

# Quét kiểm tra bản quyền giấy phép (chặn copyleft GPL/AGPL)
npm run check:licenses

# Quét bảo mật lỗ hổng phụ thuộc production
npm run audit:prod

# Xuất hóa đơn nguyên vật liệu phần mềm (CycloneDX SBOM)
npm run sbom
```

---

## Tài liệu Kỹ thuật Chi tiết

- [Kiến trúc Hệ thống & Luồng Dữ liệu](docs/ARCHITECTURE.md) (`docs/ARCHITECTURE.md`)
- [Đặc tả Giao diện Lập trình REST API](docs/API.md) (`docs/API.md`)
- [Sổ tay Vận hành & Xử lý Sự cố](docs/RUNBOOK.md) (`docs/RUNBOOK.md`)
- [Hướng dẫn Đóng góp Mã nguồn](CONTRIBUTING.md) (`CONTRIBUTING.md`)
- [Kế hoạch Xử lý Vấn đề Kỹ thuật](docs/FOLLOWUPS.md) (`docs/FOLLOWUPS.md`)
