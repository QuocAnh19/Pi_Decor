# PROMPT 04 — Migration `0014_quotations.sql`

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
- `server/database/migrations/0008_venues.sql` (đọc phần comment về vì sao
  dùng `double precision` thay vì `numeric` cho lat/lng — áp dụng bài học
  tương tự ở đây)
- `server/database/migrations/0010_updated_at_trigger.sql`
- `server/src/config/database.pg.js`

## Mục tiêu
Bảng lưu báo giá (quotation) admin tạo cho một lead — nền tảng cho Prompt 09
(API) và Prompt 16 (UI builder + xuất PDF).

## Schema đề xuất
```sql
create table if not exists quotations (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid not null references leads(id) on delete cascade,
  admin_id          uuid references admins(id) on delete set null,
  quotation_number  text not null unique,   -- vd: "BG-2026-0001", sinh ở app-code
  items             jsonb not null default '[]',
  -- items: [{ description, quantity, unit_price, subtotal }]
  subtotal          integer not null default 0,  -- VND, không có phần thập phân
  discount          integer not null default 0,
  total             integer not null default 0,
  status            text not null default 'draft'
                     check (status in ('draft','sent','accepted','declined','expired')),
  valid_until       date,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_quotations_lead_id on quotations (lead_id, created_at desc);

drop trigger if exists trg_quotations_updated_at on quotations;
create trigger trg_quotations_updated_at
  before update on quotations
  for each row execute function set_updated_at();
```

**LƯU Ý QUAN TRỌNG:** dùng `integer` (không phải `numeric`) cho tiền VND, vì
VND không có phần thập phân — và vì `node-postgres` trả `numeric` về dưới
dạng **string** (không phải number), đúng bài học đã được ghi chú trong
`0008_venues.sql` cho lat/lng (đã chọn `double precision` để tránh lỗi này).
Nếu dùng `numeric` ở đây, mọi phép cộng `subtotal + discount` phía client sẽ
âm thầm bị lỗi string concatenation thay vì cộng số.

`set_updated_at()` đã được tạo ở migration `0010` — chỉ cần `create
trigger` trỏ tới function có sẵn, không cần `create or replace function`
lại.

## Yêu cầu
1. Tạo file migration đúng schema trên.
2. Thêm `quotations` vào `TABLES` allowlist, thêm `"items"` vào
   `JSONB_COLUMNS`.

## Tiêu chí nghiệm thu
- Migration áp dụng sạch.
- Insert thử 1 quotation với `items` là mảng object → đọc lại bằng
  `db.get("quotations")` phải parse đúng thành JS array (không phải string).
