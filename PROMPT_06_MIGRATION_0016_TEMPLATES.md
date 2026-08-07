# PROMPT 06 — Migration `0016_studio_templates.sql` (Khó)

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
- `client/src/features/studio/types/index.ts`
- `client/src/features/studio/data/seed/templates.ts`
- `server/database/migrations/0010_updated_at_trigger.sql`
- `server/src/config/database.pg.js`

## Bối cảnh quan trọng
Toàn bộ mô hình Template/SlotDefinition/Asset/SlotRule của Studio builder
hiện chỉ tồn tại ở phía client (`client/src/features/studio/types/index.ts`
+ `data/seed/templates.ts`) — không có bảng DB nào backing nó. Migration
này tạo 4 bảng Postgres **map 1-1** với 4 interface đã có trong
`types/index.ts` (`Template`, `SlotDefinition`, `Asset`, `SlotRule`), để
Prompt 11 (API) và Prompt 18 (UI) có chỗ lưu thật thay vì hardcode.

## Schema đề xuất
```sql
create table if not exists studio_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  thumbnail   text,
  svg_base    text not null,   -- SVG string 800×600, ĐÃ được sanitize trước khi lưu (xem Prompt 11)
  category    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists studio_slot_definitions (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid not null references studio_templates(id) on delete cascade,
  slot_key      text not null,          -- "drape-main", "flower-left", ...
  label         text not null,
  slot_type     text not null check (slot_type in
                  ('drape','drape_detail','flower','text_name',
                   'text_date','color_accent','prop')),
  norm_x        numeric not null,       -- 0.0–1.0, KHÔNG phải pixel
  norm_y        numeric not null,
  norm_width    numeric,
  norm_height   numeric,
  allow_scale   boolean not null default true,
  allow_rotate  boolean not null default false,
  mirror_x      boolean not null default false,
  z_index       int not null default 0,
  sort_order    int not null default 0,
  required      boolean not null default false,
  unique (template_id, slot_key)
);

create table if not exists studio_assets (
  id               uuid primary key default gen_random_uuid(),
  asset_type       text not null check (asset_type in
                     ('drape','drape_detail','flower','text_name',
                      'text_date','color_accent','prop')),
  name             text not null,
  thumbnail        text,
  svg_data         text,     -- ĐÃ sanitize (xem Prompt 11)
  color_hex        text,
  font_family      text,
  tags             jsonb not null default '[]',
  is_active        boolean not null default true,
  dominant_colors  jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists studio_slot_rules (
  id               uuid primary key default gen_random_uuid(),
  template_id      uuid not null references studio_templates(id) on delete cascade,
  rule_name        text,
  condition_slot   text not null,
  condition_value  jsonb not null,   -- vd: { "asset_tag": "do-do" }
  target_slot      text not null,
  action           text not null check (action in
                     ('force_asset','restrict_assets','hide_slot')),
  action_value     jsonb,
  priority         int not null default 0
);

create index if not exists idx_studio_slots_template on studio_slot_definitions (template_id, sort_order);
create index if not exists idx_studio_rules_template on studio_slot_rules (template_id, priority);
```
Ghi chú trong comment: xoá 1 template thì `on delete cascade` dọn luôn slot
definitions + rules của nó, nhưng **KHÔNG** xoá `studio_assets` — asset là
tài nguyên dùng chung giữa nhiều template, không thuộc riêng template nào.

## Yêu cầu
1. Tạo file migration đúng 4 bảng + index trên, thêm trigger
   `set_updated_at` cho `studio_templates` và `studio_assets` (2 bảng có
   `updated_at`).
2. Thêm cả 4 bảng vào `TABLES` allowlist trong `database.pg.js`, thêm
   `"tags"`, `"dominant_colors"`, `"condition_value"`, `"action_value"` vào
   `JSONB_COLUMNS`.

## Tiêu chí nghiệm thu
- Migration áp dụng sạch theo đúng thứ tự (bảng con reference đúng bảng
  cha).
- Xoá thử 1 `studio_templates` row đã có `studio_slot_definitions` gắn vào
  → slot definitions bị xoá cascade, `studio_assets` không bị ảnh hưởng.
