# Pi Decor — Database

Postgres schema for the whole project (Neon, Supabase, Render Postgres, or a
local `postgres` Docker container — any standard Postgres connection string
works, this isn't tied to one vendor).

## Why the SQL lives here and not inside routes/components

Yes — pulling every `CREATE TABLE` out of route files (or, worse, out of
React components) and into its own folder is the right call, for three
concrete reasons specific to this project:

1. **One migration file = one reviewable, orderable change.** `git diff` on
   `0009_projects.sql` tells you exactly what changed about that table. A
   schema string buried inside `routes/venues/index.js` would mix "what
   this endpoint does" with "what the table looks like" in the same diff.
2. **Schema evolves on a different clock than API code.** You'll add a
   column or an index long before you touch the route that uses it (e.g.
   the `pg_trgm` search indexes in `0008_venues.sql` — added ahead of the
   route rewrite that will actually use them). Keeping them apart means
   neither change waits on the other.
3. **The same file runs in three different places**: locally (`npm run
   migrate`), in CI, and against the real Neon/Supabase database before a
   deploy. That only works cleanly if the SQL is a standalone file, not a
   string interpolated inside a JS request handler or a `.tsx` component.

The one place SQL-like logic still touches JS is
`server/src/config/database.pg.js` — and even there it's parameterized
query *building* (table/column allowlists), never a hand-written SQL
string per route. Routes themselves (`routes/leads/index.js` etc.) contain
**zero** SQL; they only ever call `db.get()`, `db.insert()`, `db.update()`,
`db.remove()`.

## Folder structure

```
database/
├── README.md          — this file
├── migrate.js          — applies migrations/*.sql in order, tracks progress
└── migrations/
    ├── 0001_extensions.sql
    ├── 0002_schema_migrations.sql   (bookkeeping table, used by migrate.js)
    ├── 0003_admins.sql
    ├── 0004_leads.sql
    ├── 0005_designs.sql
    ├── 0006_materials.sql
    ├── 0007_services.sql
    ├── 0008_venues.sql
    ├── 0009_projects.sql
    ├── 0010_updated_at_trigger.sql
    ├── 0011_views.sql
    ├── 0012_media_assets.sql
    ├── 0013_lead_activities.sql
    ├── 0014_quotations.sql
    ├── 0015_testimonials.sql
    ├── 0016_remove_lead_status_trigger.sql
    ├── 0017_studio_templates.sql
    ├── 0018_refresh_tokens.sql
    ├── 0019_studio_templates_default_config.sql
    ├── 0020_make_venue_id_nullable_in_projects.sql
    ├── 0021_add_missing_project_columns.sql
    ├── 0022_update_services_schema.sql
    └── 0023_studio_assets_unique_name.sql
```

Each file is numbered and runs in that exact order — `0005_designs.sql`
references `leads(id)` via foreign key, so it must run after
`0004_leads.sql`, and the numbering makes that dependency obvious without
having to open the file.

## How the tables map to the app

| Table                     | Route file                           | Notes |
|---------------------------|--------------------------------------|-------|
| `admins`                  | `routes/auth/index.js`               | 1 row today — see `PiDecor_AdminPanel.md` §2 |
| `leads`                   | `routes/leads/index.js`              | Footer form + Studio export |
| `designs`                 | —                                    | Saved canvas states (legacy/internal), FK → `leads` |
| `materials`               | `routes/materials/index.js`          | API exists; no admin UI screen yet |
| `services`                | `routes/services/index.js`           | Bento Services grid content |
| `venues`                  | `routes/venues/index.js`             | Map pins |
| `projects`                | `routes/venues/index.js`             | Case studies nested under a venue, FK → `venues`, optional FK → `leads` |
| `media_assets`            | `utils/uploadImage.js`               | Track uploaded images/assets across entity types |
| `lead_activities`         | `routes/leads/index.js`              | Timeline activities and status logs for leads |
| `quotations`              | `routes/quotations/index.js`         | Quotation records generated for leads |
| `testimonials`            | `routes/testimonials/index.js`       | Customer testimonials and moderation status |
| `studio_templates`        | `routes/studio/index.js`             | Interactive studio canvas background templates |
| `studio_slot_definitions` | `routes/studio/index.js`             | Template slot position & type definitions |
| `studio_assets`           | `routes/studio/index.js`             | Shared studio asset catalog |
| `studio_slot_rules`       | `routes/studio/index.js`             | Template conditional slot rules |
| `refresh_tokens`          | `routes/auth/index.js`               | Admin JWT refresh token hashes for session renewal |

## Kết nối Postgres — hướng dẫn từng bước

**Chọn 1 trong 2 nhà cung cấp free dưới đây (Mục 4 của
`PiDecor_PhanTich_DeXuat_KyThuat.docx`):**

### Option A — Neon (Postgres thuần, khuyên dùng nếu bạn không cần Auth/Storage của Supabase)

1. Vào [neon.tech](https://neon.tech) → tạo tài khoản (đăng nhập bằng
   GitHub là nhanh nhất) → **Create a project**.
2. Đặt tên project (ví dụ `pidecor`), chọn region gần nhất (Singapore nếu
   có, để độ trễ thấp).
3. Sau khi tạo xong, vào **Dashboard → Connection string** → chọn nhánh
   `main` → copy chuỗi dạng:
   `postgresql://<user>:<password>@ep-xxxx.aws.neon.tech/<db>?sslmode=require`
4. Dán vào `DATABASE_URL` trong `server/.env` (đây là role owner — chỉ
   dùng để chạy migration, xem phần Bảo mật bên dưới).

### Option B — Supabase (nếu sau này muốn dùng thêm Storage/Auth có sẵn)

1. Vào [supabase.com](https://supabase.com) → **New project** → đặt tên,
   đặt mật khẩu database (lưu lại, đây chính là mật khẩu role `postgres`),
   chọn region.
2. Vào **Project Settings → Database → Connection string**:
   - Dùng mục **Session/Direct connection** khi chạy migration từ máy bạn.
   - Dùng mục **Connection pooling (Transaction mode, port 6543)** cho
     server đã deploy (Render/Vercel) — phù hợp với môi trường
     serverless/nhiều instance ngắn hạn hơn direct connection.
3. Dán chuỗi tương ứng vào `DATABASE_URL`.

### Sau khi có DATABASE_URL — chạy migration & seed

```bash
# 1. Trỏ tới database thật
cp .env.example .env
# mở .env, dán DATABASE_URL vừa lấy được ở Option A/B

# 2. Tạo toàn bộ bảng, index, trigger, view
npm run migrate

# 3. Tạo tài khoản admin + dữ liệu mẫu (materials/services/venue demo)
npm run seed

# 4. Chạy server
npm run dev

# 5. Kiểm tra nhanh
curl http://localhost:4000/api/health
curl http://localhost:4000/api/services
```

Nếu bước 5 trả JSON hợp lệ (không lỗi kết nối) — vậy là đã kết nối thành
công. Muốn xem trực tiếp dữ liệu, dùng **Table editor** trên Neon/Supabase
dashboard, hoặc `psql "$DATABASE_URL"`.

## Cài Postgres tại máy (tuỳ chọn — cho dev/test, không dùng cho production)

Bạn **không bắt buộc** phải cài Postgres lên máy — Option A/B ở trên
(Neon/Supabase) đã đủ dùng kể cả khi code local. Chỉ cài local nếu bạn
muốn dev khi không có mạng, hoặc muốn có 1 database "phá cũng được" để
thử migration trước khi chạy lên Neon/Supabase thật.

### Cách 1 — Docker (khuyên dùng, giống nhau trên Windows/Mac/Linux)

1. Cài [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   nếu chưa có.
2. Trong thư mục `server/`, chạy:
   ```bash
   docker compose up -d
   ```
   (dùng file `docker-compose.yml` đã có sẵn trong thư mục này — tự tạo 1
   Postgres 16 chạy ở `localhost:5432`, dữ liệu lưu bền trong Docker
   volume, mất đi khi bạn chủ động `docker compose down -v`.)
3. Trong `.env`:
   ```
   DATABASE_URL=postgresql://pidecor:pidecor_dev_only@localhost:5432/pidecor
   ```
4. Chạy `npm run migrate && npm run seed && npm run dev` như bình thường.
5. Dừng khi không dùng nữa: `docker compose down` (giữ dữ liệu) hoặc
   `docker compose down -v` (xoá sạch, tạo lại DB trống ở lần chạy sau).

### Cách 2 — Cài Postgres trực tiếp lên máy (không qua Docker)

- **Windows**: tải installer tại
  [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
  (EDB installer) — trong lúc cài, tự đặt mật khẩu cho role `postgres`,
  ghi nhớ lại. Sau khi cài xong, tạo database mới bằng **pgAdmin** (đi kèm
  installer) hoặc lệnh `createdb pidecor`.
- **macOS**: `brew install postgresql@16` rồi `brew services start
  postgresql@16`, sau đó `createdb pidecor`.
- **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`, sau
  đó `sudo -u postgres createuser --interactive` và `sudo -u postgres
  createdb pidecor`.
- Chuỗi kết nối local dạng:
  `postgresql://<user>:<password>@localhost:5432/pidecor`

### Xem dữ liệu bằng công cụ đồ hoạ (GUI)

Không bắt buộc, nhưng tiện khi kiểm tra dữ liệu bằng mắt thay vì gõ SQL:

- **Neon/Supabase**: cả hai đều có **Table editor** ngay trên dashboard —
  không cần cài gì thêm.
- **TablePlus** ([tableplus.com](https://tableplus.com)) hoặc **DBeaver**
  ([dbeaver.io](https://dbeaver.io), miễn phí, đa nền tảng): tạo connection
  mới, dán y nguyên giá trị `DATABASE_URL` (hoặc điền host/port/user/
  password/database tách riêng nếu công cụ yêu cầu), nhớ bật SSL nếu là
  Neon/Supabase.
- **psql** (dòng lệnh, đi kèm khi cài Postgres): `psql "$DATABASE_URL"`,
  sau đó `\dt` để liệt kê bảng, `\d leads` để xem cấu trúc bảng `leads`,
  `select * from leads limit 5;` để xem dữ liệu.

### Xử lý lỗi thường gặp (Troubleshooting)

| Lỗi | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `ECONNREFUSED` | Postgres chưa chạy, hoặc sai host/port | Với Docker: kiểm tra `docker compose ps`; với local install: kiểm tra service Postgres đang chạy |
| `password authentication failed` | Sai user/password trong `DATABASE_URL` | Copy lại chính xác connection string từ Neon/Supabase dashboard, không gõ tay |
| `no pg_hba.conf entry for host ..., SSL off` | Thiếu `?sslmode=require`, hoặc `ssl` bị tắt sai chỗ | Thêm `?sslmode=require` vào cuối `DATABASE_URL` (Neon/Supabase bắt buộc TLS) |
| `relation "leads" does not exist` | Chưa chạy `npm run migrate` trên database này | Chạy `npm run migrate`, kiểm tra log thấy đủ `apply 0001...` → `0011...` |
| `permission denied for table leads` | `DATABASE_URL` đang dùng role `pidecor_app` nhưng chưa cấp quyền, hoặc gọi nhầm role không có GRANT | Chạy lại `database/security/create_app_role.sql` bằng role owner (xem `SECURITY.md` §1) |
| Lỗi thiếu `DATABASE_URL` khi start | Biến môi trường chưa được nạp (thiếu `.env`, hoặc chạy sai thư mục) | Kiểm tra file `.env` đã có `DATABASE_URL` hợp lệ chưa |
| Free-tier Neon "database sleeping", request đầu chậm | Neon tự tạm ngưng compute khi rảnh (bình thường) | Không cần xử lý — request đầu chậm ~1s để "thức dậy", các request sau bình thường |



Chuỗi `DATABASE_URL` ở trên có toàn quyền (owner) — chỉ nên dùng nó để
chạy `npm run migrate` từ máy bạn. Server đang chạy thật (Render, v.v.)
nên dùng một role riêng, quyền hạn chế hơn — xem **`database/SECURITY.md`**
để biết cách tạo và tại sao.

## Bảo mật

Toàn bộ phần role riêng cho app, giới hạn kết nối, rate limiting, HTTP
headers, secrets... đã được tách vào **`database/SECURITY.md`** — đọc file
đó trước khi deploy, không chỉ đọc phần hướng dẫn kết nối ở trên.

## Chạy nhanh (tóm tắt, đã có DATABASE_URL)

```bash
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

Biến môi trường `DATABASE_URL` là bắt buộc cho mọi môi trường chạy server.

## What's intentionally NOT here

- **No Row Level Security policies.** RLS matters when a frontend calls
  Postgres directly with a public anon key (that's the model in the
  `supabase-schema.sql` reference — no server in between, so the database
  itself has to be the security boundary). This project's frontend never
  talks to Postgres directly — every request goes through the Express API
  in `server/src/`, and that API already enforces auth with
  `verifyToken`/`requireAdmin` (`src/middlewares/verifyToken.js`) on every
  `POST`/`PATCH`/`DELETE` route. Adding RLS on top would be a second,
  redundant security layer with no client that needs it. If a future
  version lets the frontend hit Supabase directly for some read path (e.g.
  public venue listings), RLS policies belong in a new
  `0012_public_read_policies.sql`, scoped to only that use case.
- **No ORM.** Ecovera's own codebase mixes Sequelize (declared, unused) with
  raw `mysql2` queries and the technical proposal calls that out as the one
  pattern *not* to repeat (Mục 2.5). This project picks one approach —
  parameterized `pg` queries behind a small typed table allowlist in
  `database.pg.js` — and stays there.
