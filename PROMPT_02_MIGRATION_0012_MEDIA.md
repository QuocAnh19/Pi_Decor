# PROMPT 02 — Migration `0012_media_assets.sql`

<context>
```
DỰ ÁN: Pi Decor — web app trang trí tiệc cưới Đà Nẵng
STACK:  React 18 + TypeScript + Vite / Express.js 5 / PostgreSQL (Neon/Supabase)
AUTH:   JWT (jsonwebtoken + bcryptjs) — admin-only, không có customer login
STYLE:  SCSS Modules + Tailwind CSS 3 — KHÔNG dùng styled-components
ICONS:  lucide-react 0.383
DB:     pg (node-postgres) với connection pool, parameterized queries.
        LƯU Ý: server/src/config/database.js tự động chọn Postgres (nếu có
        DATABASE_URL) hoặc JSON file local (src/data/db.json) khi không có.
        MỌI route chỉ gọi db.get()/insert()/update()/remove() — không bao
        giờ viết SQL trực tiếp trong route. Bảng mới PHẢI được thêm vào
        TABLES allowlist trong server/src/config/database.pg.js (và
        JSONB_COLUMNS nếu có cột jsonb) thì route mới ghi được.
DEPLOY: Render (server) + Vercel (client)
BRAND:  3 sub-brand: PiKids / PiWedding / PiEvent
```
</context>

## File cần đính kèm
- `server/database/migrations/0006_materials.sql` (để bám đúng style comment)
- `server/database/migrations/0010_updated_at_trigger.sql`
- `server/src/config/database.pg.js` (để biết cách thêm bảng vào `TABLES`)
- `server/database/README.md`

## Mục tiêu
Tạo bảng `media_assets` dùng chung để track mọi ảnh/file upload trong hệ
thống (materials, testimonials, studio assets, gallery dự án, cover venue),
chuẩn bị cho việc chuyển sang Cloudinary (Prompt 19) — cần lưu `public_id`
để sau này xoá được ảnh trên Cloudinary khi entity bị xoá.

## Schema đề xuất
```sql
create table if not exists media_assets (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in
                ('materials','testimonials','studio_assets',
                 'studio_templates','projects','venues')),
  entity_id   uuid,              -- nullable: cho phép upload-trước-rồi-gán-sau
  url         text not null,
  provider    text not null default 'local' check (provider in ('local','cloudinary')),
  public_id   text,              -- id Cloudinary, dùng để xoá sau này
  width       int,
  height      int,
  format      text,
  bytes       int,
  created_at  timestamptz not null default now()
);

create index if not exists idx_media_assets_entity on media_assets (entity_type, entity_id);
```
Viết file với comment header đúng phong cách các migration hiện có (xem
`0006_materials.sql` làm mẫu: giải thích route nào sẽ dùng bảng này — ghi rõ
là Prompt 19 sẽ wire route upload vào bảng này, migration này CHƯA có route
nào dùng tới).

## Yêu cầu
1. Tạo `server/database/migrations/0012_media_assets.sql` theo schema trên.
2. Thêm `media_assets` vào `TABLES` allowlist trong
   `server/src/config/database.pg.js` với đúng danh sách cột.
3. KHÔNG cần thêm vào `JSONB_COLUMNS` (không có cột jsonb ở bảng này).
4. Cập nhật bảng "How the tables map to the app" trong
   `server/database/README.md`, thêm dòng cho `media_assets` (route: sẽ có
   ở Prompt 19).

## Tiêu chí nghiệm thu
- `npm run migrate` áp dụng `0012_media_assets.sql` thành công, không lỗi.
- Chạy lại `npm run migrate` lần 2 → migration bị skip (đã ghi vào
  `schema_migrations`), không lỗi "already exists".
- `db.insert("media_assets", {...})` từ Node REPL/script test chạy được.
