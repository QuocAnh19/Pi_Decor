# Pi Decor API (server/)

Express REST API for Pi Decor — leads, saved designs, materials/services, and
a minimal JWT-protected admin area. Structured by business domain (same
pattern as the Ecovera reference project's `Server/routes`), so each area
can grow independently.

## Chạy local

```bash
cd server
cp .env.example .env      # rồi sửa ADMIN_EMAIL / ADMIN_PASSWORD / JWT_SECRET
npm install
npm run seed               # tạo tài khoản admin + dữ liệu materials/services mẫu
npm run dev                 # http://localhost:4000
```

**Lưu trữ dữ liệu — 2 chế độ, tự động chọn theo `.env`:**

- Không set `DATABASE_URL` → dữ liệu lưu ở `src/data/db.json` (tự tạo ở lần
  chạy đầu). Không cần cài gì thêm — phù hợp để thử nhanh, KHÔNG dùng khi
  deploy thật.
- Có set `DATABASE_URL` → toàn bộ dữ liệu chạy qua Postgres thật
  (Neon/Supabase, miễn phí). Route code không đổi 1 dòng nào giữa 2 chế độ.

👉 **Hướng dẫn đầy đủ (tạo project Neon/Supabase, chạy migration, bảo mật,
troubleshooting): xem [`database/README.md`](./database/README.md) và
[`database/SECURITY.md`](./database/SECURITY.md).**

## Cấu trúc thư mục

```
database/                    # Schema Postgres — xem database/README.md
├── migrations/               # 11 file .sql, chạy theo thứ tự (npm run migrate)
├── security/                  # Tạo role Postgres quyền hạn chế cho app
└── migrate.js                  # Script chạy migration

src/
├── config/
│   ├── database.js          # Lớp lưu trữ duy nhất — mọi route đi qua đây
│   ├── database.pg.js        # Bản Postgres (dùng khi có DATABASE_URL)
│   └── (JSON-file fallback nằm luôn trong database.js)
├── routes/
│   ├── leads/              # POST /api/leads (public) + admin GET/PATCH
│   ├── designs/             # POST/GET /api/designs — lưu & tải lại canvas
│   ├── materials/           # CRUD vật liệu decor (+ upload ảnh)
│   ├── services/            # CRUD nội dung Bento Services
│   ├── auth/                 # POST /api/auth/login (admin)
│   └── admin/                 # GET /api/admin/summary (JWT + role required)
├── middlewares/verifyToken.js # verifyToken + requireAdmin, dùng chung
├── utils/uploadImage.js       # Multer wrapper — local disk, swap-ready cho Cloudinary
├── utils/seed.js               # Tạo admin + seed materials/services
├── app.js                       # Lắp ráp Express app: helmet, rate limit, routes
└── server.js                     # Chỉ chịu trách nhiệm app.listen(PORT)
```

## API chính

| Method | Path | Auth | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Health check |
| POST | `/api/leads` | — | Lưu lead (form liên hệ hoặc "Xuất thiết kế") |
| GET | `/api/leads` | admin | Danh sách leads |
| PATCH | `/api/leads/:id` | admin | Đổi trạng thái lead |
| POST | `/api/designs` | — | Lưu layers của một thiết kế |
| GET | `/api/designs/:leadId` | — | Lấy các thiết kế đã lưu của một lead |
| GET | `/api/materials` | — | Danh sách vật liệu (thay materials.json tĩnh) |
| POST/PATCH/DELETE | `/api/materials/:id?` | admin | Quản trị vật liệu (hỗ trợ upload ảnh) |
| GET | `/api/services` | — | Danh sách dịch vụ Bento |
| POST/PATCH/DELETE | `/api/services/:id?` | admin | Quản trị dịch vụ |
| POST | `/api/auth/login` | — | Đăng nhập admin, trả về JWT |
| PATCH | `/api/auth/me` | admin | Cập nhật thông tin/mật khẩu tài khoản hiện tại |
| GET | `/api/auth/admins` | admin | Danh sách tài khoản admin |
| POST | `/api/auth/admins` | owner | Tạo tài khoản admin mới |
| DELETE | `/api/auth/admins/:id` | owner | Xoá tài khoản admin |
| GET | `/api/admin/summary` | admin | Số liệu tổng quan cho dashboard |

## Deploy (miễn phí — xem Mục 4 của tài liệu phân tích kỹ thuật)

1. Tạo database Postgres thật trên **Neon** hoặc **Supabase** (free) — xem
   [`database/README.md`](./database/README.md), chạy `npm run migrate` rồi
   `npm run seed` từ máy bạn, trỏ vào database đó.
2. Tạo role Postgres quyền hạn chế cho server (`pidecor_app`) theo
   [`database/SECURITY.md`](./database/SECURITY.md) §1 — **không** dùng
   connection string owner cho server đang chạy thật.
3. Push `server/` lên GitHub, tạo Web Service mới trên **Render** (Free),
   root directory = `server`, build command = `npm install`, start command
   = `npm start`.
4. Set biến môi trường trên Render giống `.env.example` — bao gồm
   `DATABASE_URL` (role `pidecor_app`, không phải owner), `JWT_SECRET`
   (random thật, khác với local), `CORS_ORIGIN` (domain Vercel/Netlify thật
   của client).
5. Trước khi có traffic thật: điền 3 biến `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` trên Render dashboard —
   `utils/uploadImage.js` đã hỗ trợ Cloudinary tự động khi 3 biến này được set
   (ổ đĩa Render Free bị xoá mỗi lần restart).
6. Cập nhật `VITE_API_URL` ở phía client trỏ về URL Render vừa deploy.

`app.js` đã bật sẵn `helmet` (security headers) và rate limiting cho
`/api/auth/login` + `/api/leads` — không cần cấu hình thêm gì ở bước
deploy, chỉ cần biết chúng tồn tại nếu traffic thật cần điều chỉnh giới
hạn (xem `database/SECURITY.md` §5).
