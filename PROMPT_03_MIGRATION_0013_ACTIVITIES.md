# PROMPT 03 — Migration `0013_lead_activities.sql` + trigger

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
- `server/src/routes/leads/index.js`
- `server/database/migrations/0004_leads.sql`
- `server/database/migrations/0010_updated_at_trigger.sql`
- `server/src/config/database.pg.js`

## Mục tiêu
Thêm timeline lịch sử cho mỗi lead (đổi trạng thái, ghi chú, gọi điện, gửi
báo giá...) — nền tảng cho Prompt 08 (routes) và Prompt 15 (UI timeline
trong `LeadDetailDrawer.tsx`).

## Schema đề xuất
```sql
create table if not exists lead_activities (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  admin_id      uuid references admins(id) on delete set null,
  activity_type text not null check (activity_type in
                  ('status_change','note','call','email',
                   'quotation_sent','design_saved')),
  body          text,
  metadata      jsonb,   -- vd: {"from":"new","to":"contacted"}
  created_at    timestamptz not null default now()
);

create index if not exists idx_lead_activities_lead_id on lead_activities (lead_id, created_at desc);
```

## Về cái trigger
Có thể viết một trigger Postgres (`after update on leads when
new.status is distinct from old.status`) tự insert một dòng
`lead_activities`. **Nhưng lưu ý quan trọng:** trigger chỉ chạy ở chế độ
Postgres — chế độ JSON-file (`src/data/db.json`, không có `DATABASE_URL`)
không có khái niệm trigger. Vì vậy:
- Vẫn viết trigger này trong migration (an toàn khi ai đó sửa trực tiếp
  bằng SQL editor), NHƯNG
- Ở Prompt 08, route `PATCH /api/leads/:id` phải **tự insert** activity
  row bằng application code (không dựa vào trigger), để hành vi giống nhau
  ở cả 2 chế độ DB. Ghi rõ note này trong migration comment để Prompt 08
  không quên.

## Yêu cầu
1. Tạo `server/database/migrations/0013_lead_activities.sql` với bảng +
   index + function/trigger (tái dùng ý tưởng `set_updated_at()` nhưng viết
   function riêng, ví dụ `log_lead_status_change()`).
2. Thêm `lead_activities` vào `TABLES` allowlist (cột: id, lead_id,
   admin_id, activity_type, body, metadata, created_at) và thêm
   `"metadata"` vào `JSONB_COLUMNS`.

## Tiêu chí nghiệm thu
- Migration áp dụng sạch, chạy lại lần 2 bị skip đúng cách.
- `update leads set status = 'contacted' where id = ...` (chạy trực tiếp
  bằng SQL) tự sinh ra 1 dòng trong `lead_activities` (kiểm tra trigger hoạt
  động, kể cả khi không đi qua route).
