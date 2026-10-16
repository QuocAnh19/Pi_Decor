# Pi Decor API (server/)

Express 5 REST API (ESM) cho Pi Decor — quản lý leads, báo giá, studio thiết kế, vật liệu/dịch vụ, địa điểm/dự án bản đồ, đánh giá khách hàng và phân quyền admin. Kiến trúc module hóa theo domain nghiệp vụ.

## Yêu cầu môi trường

- Node.js >= 20 (xem `.nvmrc` ở thư mục gốc)
- PostgreSQL 16 (chạy qua Docker Compose hoặc dịch vụ đám mây Neon/Supabase)

## Chạy local

```bash
cd server
cp .env.example .env      # cấu hình DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run migrate           # chạy các migration schema PostgreSQL
npm run seed              # khởi tạo tài khoản admin và dữ liệu mẫu
npm run dev               # khởi động server ở cổng http://localhost:4000
```

Để chạy bộ kiểm thử Vitest:

```bash
npm test
```

## Biến môi trường

| Tên biến                | Bắt buộc?    | Mặc định                | Mô tả                                                                       |
| ----------------------- | ------------ | ----------------------- | --------------------------------------------------------------------------- |
| `NODE_ENV`              | Không        | `development`           | Môi trường runtime: `development`, `test`, hoặc `production`.               |
| `PORT`                  | Không        | `4000`                  | Cổng HTTP lắng nghe.                                                        |
| `CORS_ORIGIN`           | Có (prod)    | `http://localhost:5173` | Danh sách origin hợp lệ được phép gọi API (phân tách bởi dấu phẩy).         |
| `TRUST_PROXY`           | Không        | `1` (prod) / `0` (dev)  | Cấu hình trust proxy của Express cho reverse proxy.                         |
| `JWT_SECRET`            | **BẮT BUỘC** | —                       | Khóa bí mật ký token JWT (tối thiểu 32 ký tự).                              |
| `JWT_EXPIRES_IN`        | Không        | `15m`                   | Thời hạn hiệu lực của access token.                                         |
| `DATABASE_URL`          | **BẮT BUỘC** | —                       | Chuỗi kết nối PostgreSQL (Neon, Supabase, local Docker).                    |
| `DATABASE_URL_TEST`     | Không        | —                       | Chuỗi kết nối PostgreSQL riêng cho test suite.                              |
| `DB_POOL_MAX`           | Không        | `10`                    | Số kết nối tối đa trong pg connection pool.                                 |
| `DB_SSL`                | Không        | `false`                 | Bật/tắt SSL khi kết nối PostgreSQL (`disable`, `require`, `verify-full`).   |
| `CLOUDINARY_CLOUD_NAME` | Tùy chọn     | —                       | Tên Cloudinary cloud lưu trữ ảnh upload.                                    |
| `CLOUDINARY_API_KEY`    | Tùy chọn     | —                       | API key của Cloudinary.                                                     |
| `CLOUDINARY_API_SECRET` | Tùy chọn     | —                       | API secret của Cloudinary.                                                  |
| `ADMIN_EMAIL`           | Có (seed)    | —                       | Email admin khởi tạo khi chạy `npm run seed`.                               |
| `ADMIN_PASSWORD`        | Có (seed)    | —                       | Mật khẩu admin khi chạy seed (tối thiểu 12 ký tự).                          |
| `SENTRY_DSN`            | Không        | —                       | DSN kết nối Sentry giám sát lỗi backend (tự động kích hoạt khi có giá trị). |

## Cấu trúc thư mục

```
database/                     # Schema Postgres & migrations
├── migrations/               # 0001 đến 0029 file .sql chạy tuần tự
├── security/                 # Script tạo role pidecor_app quyền tối thiểu
└── migrate.js               # Script thực thi migration tự động
src/
├── config/                   # Cấu hình db (database.pg.js) & auth
├── middlewares/              # verifyToken, validate (Zod), rateLimiter, errorHandler
├── routes/                   # Router theo domain (auth, leads, quotations, studio,...)
├── schemas/                  # Zod validation schemas
├── services/                 # Nghiệp vụ logic (projects, quotations, activities,...)
├── utils/                    # Seed script, upload multer/cloudinary
├── app.js                    # Express app: CORS, Helmet, Sentry, Rate limit, Routers
└── server.js                 # Điểm khởi chạy app.listen(PORT)
```

## Tổng quan các Endpoint chính

| Method   | Path                    | Auth           | Mô tả                                                              |
| -------- | ----------------------- | -------------- | ------------------------------------------------------------------ |
| GET      | `/api/health`           | Public         | Healthcheck trạng thái server và database                          |
| POST     | `/api/auth/login`       | Public         | Đăng nhập admin, cấp access token và refresh token                 |
| POST     | `/api/auth/refresh`     | Public         | Xoay vòng refresh token, cấp cặp token mới                         |
| POST     | `/api/auth/logout`      | Public         | Thu hồi refresh token hiện tại                                     |
| POST     | `/api/auth/logout-all`  | Admin          | Thu hồi toàn bộ refresh token của tài khoản                        |
| GET      | `/api/auth/me`          | Admin          | Lấy thông tin tài khoản đang đăng nhập                             |
| POST     | `/api/leads`            | Public         | Khách gửi thông tin liên hệ / lưu thiết kế Studio (có lưu consent) |
| GET      | `/api/leads`            | Admin          | Danh sách leads (hỗ trợ phân trang, tìm kiếm, lọc status)          |
| PATCH    | `/api/leads/:id`        | Admin          | Cập nhật trạng thái lead (new, contacted, closed)                  |
| GET/POST | `/api/quotations`       | Admin          | Xem danh sách hoặc tạo báo giá tự động tăng số hiệu                |
| GET/POST | `/api/materials`        | Public / Admin | Danh mục vật liệu trang trí                                        |
| GET/POST | `/api/services`         | Public / Admin | Danh mục dịch vụ Bento                                             |
| GET/POST | `/api/venues`           | Public / Admin | Danh sách và thông tin ghim bản đồ địa điểm                        |
| GET/POST | `/api/projects`         | Public / Admin | Danh sách dự án tiệc cưới đã thực hiện                             |
| GET/POST | `/api/testimonials`     | Public / Admin | Đánh giá của khách hàng (lưu consent cá nhân)                      |
| GET/PUT  | `/api/studio/templates` | Public / Admin | Template và cấu hình canvas Studio                                 |
| GET      | `/api/admin/summary`    | Admin          | Thống kê tổng quan cho Admin Dashboard                             |

👉 Chi tiết đầy đủ mọi endpoint xem tại [`docs/API.md`](../docs/API.md).
👉 Hướng dẫn vận hành, backup/restore xem tại [`docs/RUNBOOK.md`](../docs/RUNBOOK.md).
