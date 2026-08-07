# PROMPT 05 — Migration `0015_testimonials.sql`

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
- `client/src/components/sections/Testimonials.tsx`
- `client/src/lib/content.ts` (phần `testimonials`)
- `server/database/migrations/0010_updated_at_trigger.sql`
- `server/src/config/database.pg.js`

## Bối cảnh quan trọng
Component `Testimonials.tsx` hiện tại **hoàn toàn giả** ở phía client: nó
lưu review khách gửi vào `localStorage` (key
`"pidecor_customer_reviews"`), ảnh được encode base64 qua `FileReader` rồi
nhét thẳng vào `localStorage` — không hề gọi API, không có kiểm duyệt admin,
mỗi trình duyệt thấy review khác nhau. Migration này là bước đầu thay thế
bằng dữ liệu thật (Prompt 10 làm API, Prompt 17 sửa lại component + thêm
trang admin kiểm duyệt).

## Schema đề xuất
```sql
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete set null,
  author      text not null,
  role        text,
  quote       text not null,
  rating      int not null default 5 check (rating between 1 and 5),
  photos      jsonb not null default '[]',   -- mảng URL (Cloudinary), KHÔNG lưu base64
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  source      text not null default 'customer'
              check (source in ('customer','admin_seed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_testimonials_status on testimonials (status, created_at desc);

drop trigger if exists trg_testimonials_updated_at on testimonials;
create trigger trg_testimonials_updated_at
  before update on testimonials
  for each row execute function set_updated_at();
```
Trong comment header của migration, ghi rõ: các testimonial trong
`client/src/lib/content.ts` (`INITIAL_TESTIMONIALS`/`testimonials`) sẽ được
đưa vào `server/src/utils/seed.js` với `source = 'admin_seed'`,
`status = 'approved'` — không cần chờ admin duyệt.

## Yêu cầu
1. Tạo file migration đúng schema trên.
2. Thêm `testimonials` vào `TABLES` allowlist, `"photos"` vào
   `JSONB_COLUMNS`.
3. KHÔNG sửa `Testimonials.tsx` ở prompt này — chỉ tạo bảng (UI để Prompt
   17 xử lý).

## Tiêu chí nghiệm thu
- Migration áp dụng sạch.
- Ràng buộc `rating between 1 and 5` và `status in (...)` hoạt động đúng
  khi insert giá trị sai (phải bị Postgres từ chối).
