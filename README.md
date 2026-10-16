# Pi Decor

Nền tảng website và ứng dụng Studio tương tác phục vụ thiết kế, tư vấn trang trí tiệc cưới & sự kiện cao cấp. Hệ thống tích hợp bản đồ địa điểm tổ chức (Interactive Map), bộ công cụ phối cảnh canvas trực quan (Studio Builder), hệ thống quản lý khách hàng tiềm năng (Leads CRM) và tạo báo giá tự động (Quotations).

---

## Kiến trúc Tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                 Client (React 18 + Vite)                    │
│   Trang chủ (Bento) │ Bản đồ (Leaflet) │ Studio Canvas      │
│   Quản trị Admin (CRM, Báo giá, Dự án, Vật liệu, Templates) │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / HTTPS)
┌──────────────────────────────▼──────────────────────────────┐
│                 Server (Express 5 ESM)                      │
│   verifyToken (JWT) │ Zod Validation │ Rate Limit (Helmet)  │
│   Domain Routers: leads, auth, quotations, studio, venues   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL
┌──────────────────────────────▼──────────────────────────────┐
│                 Database (PostgreSQL 16)                    │
│   Schema Migrations (0001-0029) │ Triggers │ pg_trgm        │
│   Admins, Leads, Quotations, Templates, Venues, Projects    │
└─────────────────────────────────────────────────────────────┘
```

---

## Yêu cầu Hệ thống

- **Node.js**: Phiên bản `>= 20.0.0` (được khai báo trong [.nvmrc](.nvmrc) và `package.json`).
- **Docker & Docker Compose**: Để chạy cơ sở dữ liệu PostgreSQL cục bộ.
- **Git**: Quản lý phiên bản mã nguồn.

---

## Hướng dẫn Chạy Cục bộ Từng bước

### 1. Khởi động Cơ sở dữ liệu PostgreSQL

Tại thư mục gốc của repository, khởi chạy container PostgreSQL 16:

```bash
docker compose up -d
```

Cơ sở dữ liệu sẽ lắng nghe tại cổng `localhost:5432` với tài khoản mặc định `pidecor` / `pidecor_dev_only`.

### 2. Cài đặt và Khởi chạy Backend Server

```bash
cd server
cp .env.example .env
npm install
npm run migrate      # Áp dụng 29 migrations schema
npm run seed         # Khởi tạo tài khoản admin và dữ liệu danh mục mẫu
npm run dev          # API lắng nghe tại http://localhost:4000
```

Kiểm tra kết nối server:

```bash
curl http://localhost:4000/api/health
```

### 3. Cài đặt và Khởi chạy Frontend Client

Mở một terminal mới:

```bash
cd client
cp .env.example .env
npm install
npm run dev          # Giao diện chạy tại http://localhost:5173
```

Tài khoản admin mặc định khi seed: `admin@pidecor.vn` / mật khẩu được cấu hình trong `ADMIN_PASSWORD` của `server/.env`.

---

## Bảng Biến Môi trường

### Server (`server/.env`)

| Tên biến                | Bắt buộc  | Mặc định                | Mô tả                                             | Giá trị ví dụ (Dev)                                                 |
| ----------------------- | :-------: | ----------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| `NODE_ENV`              |   Không   | `development`           | Môi trường runtime                                | `development`                                                       |
| `PORT`                  |   Không   | `4000`                  | Cổng HTTP API lắng nghe                           | `4000`                                                              |
| `CORS_ORIGIN`           | Có (prod) | `http://localhost:5173` | Domain client được phép gọi API                   | `http://localhost:5173`                                             |
| `TRUST_PROXY`           |   Không   | `0` (dev) / `1` (prod)  | Đếm số hop qua reverse proxy                      | `0`                                                                 |
| `JWT_SECRET`            |  **Có**   | —                       | Khóa bí mật ký access token (>= 32 ký tự)         | `dev_secret_key_at_least_32_characters_long`                        |
| `JWT_EXPIRES_IN`        |   Không   | `15m`                   | Thời hạn của access token                         | `15m`                                                               |
| `DATABASE_URL`          |  **Có**   | —                       | Chuỗi kết nối PostgreSQL                          | `postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor`      |
| `DATABASE_URL_TEST`     |   Không   | —                       | Chuỗi kết nối Postgres riêng cho kiểm thử         | `postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor_test` |
| `DB_POOL_MAX`           |   Không   | `10`                    | Số kết nối tối đa trong connection pool           | `10`                                                                |
| `DB_SSL`                |   Không   | `false`                 | Bật/tắt SSL (`disable`, `require`, `verify-full`) | `disable`                                                           |
| `CLOUDINARY_CLOUD_NAME` |   Không   | —                       | Cloud name tài khoản Cloudinary                   | `your_cloud_name`                                                   |
| `CLOUDINARY_API_KEY`    |   Không   | —                       | API Key tài khoản Cloudinary                      | `123456789012345`                                                   |
| `CLOUDINARY_API_SECRET` |   Không   | —                       | API Secret tài khoản Cloudinary                   | `example_cloudinary_secret`                                         |
| `ADMIN_EMAIL`           | Có (seed) | —                       | Email đăng nhập admin khi seed                    | `admin@pidecor.vn`                                                  |
| `ADMIN_PASSWORD`        | Có (seed) | —                       | Mật khẩu admin khi seed (>= 12 ký tự)             | `Admin@PiDecor2026!`                                                |
| `SENTRY_DSN`            |   Không   | —                       | DSN giám sát lỗi qua Sentry                       | `https://examplePublicKey@o0.ingest.sentry.io/0`                    |

### Client (`client/.env`)

| Tên biến          | Bắt buộc | Mặc định                | Mô tả                       | Giá trị ví dụ                                    |
| ----------------- | :------: | ----------------------- | --------------------------- | ------------------------------------------------ |
| `VITE_API_URL`    |  Không   | `http://localhost:4000` | Địa chỉ gốc của backend API | `http://localhost:4000`                          |
| `VITE_SENTRY_DSN` |  Không   | —                       | DSN Sentry phía client      | `https://examplePublicKey@o0.ingest.sentry.io/0` |

---

## Các Lệnh Thường Dùng

### Client (`client/`)

- `npm run dev`: Khởi chạy môi trường phát triển Vite với Hot Module Replacement.
- `npx tsc --noEmit`: Kiểm tra tính hợp lệ kiểu dữ liệu TypeScript.
- `npm run lint`: Chạy ESLint kiểm tra quy chuẩn mã nguồn TypeScript/React.
- `npm run lint:styles`: Chạy Stylelint kiểm tra SCSS modules.
- `npm run test`: Chạy bộ kiểm thử tự động với Vitest và React Testing Library.
- `npm run knip`: Kiểm tra mã nguồn, exports và dependencies không dùng đến.
- `npm run build`: Đóng gói ứng dụng production vào thư mục `client/dist`.

### Server (`server/`)

- `npm run dev`: Chạy server chế độ watch với nodemon.
- `npm run start`: Chạy server chế độ production.
- `node --check src/**/*.js`: Kiểm tra cú pháp toàn bộ tệp JavaScript ESM.
- `npm run lint`: Chạy ESLint kiểm tra mã nguồn backend.
- `npm run test`: Chạy toàn bộ test suite backend bằng Vitest.
- `npm run migrate`: Áp dụng các tệp migration mới nhất vào cơ sở dữ liệu.
- `npm run seed`: Nạp dữ liệu mẫu ban đầu cho database.
- `npm run cleanup-tokens`: Dọn dẹp các refresh token hết hạn hoặc đã thu hồi.
- `npm run purge-leads`: Dọn dẹp dữ liệu leads quá hạn lưu trữ theo chính sách bảo mật.

---

## Tài liệu Kỹ thuật Chi tiết

- [Kiến trúc Hệ thống & Luồng Dữ liệu](docs/ARCHITECTURE.md) (`docs/ARCHITECTURE.md`)
- [Đặc tả Giao diện Lập trình REST API](docs/API.md) (`docs/API.md`)
- [Sổ tay Vận hành & Xử lý Sự cố](docs/RUNBOOK.md) (`docs/RUNBOOK.md`)
- [Hướng dẫn Đóng góp Mã nguồn](CONTRIBUTING.md) (`CONTRIBUTING.md`)
- [Kế hoạch Xử lý Vấn đề Kỹ thuật](docs/FOLLOWUPS.md) (`docs/FOLLOWUPS.md`)
