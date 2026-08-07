# PROMPT 07 — Backend: Materials API mở rộng + validation

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
- `server/src/routes/materials/index.js`
- `server/database/migrations/0006_materials.sql`
- `client/src/features/studio/data/seed/templates.ts` (để xác nhận danh
  sách category thật đang được dùng, đừng đoán)

## Bối cảnh
`category` trong bảng `materials` cố tình để free-text (xem comment trong
`0006_materials.sql`: *"validate categories in the API layer instead"*) —
route hiện tại (`GET/POST/PATCH/DELETE /api/materials`) chưa validate gì cả
ngoài `!name || !category`.

## Yêu cầu
1. **Category allowlist ở API layer** (không phải DB constraint): đọc file
   `templates.ts` đính kèm để lấy đúng danh sách category Studio đang dùng
   (đừng hardcode `["fabric","flowers","arch","lighting"]` nếu thực tế
   khác) — validate `category` trong `POST`/`PATCH` phải thuộc danh sách
   này, trả `400` với message tiếng Việt nếu sai, giống style
   `"Thiếu tên hoặc danh mục."` đã có.
2. **Validate `color_hex`**: nếu có giá trị, phải khớp regex
   `^#[0-9A-Fa-f]{6}$`, else `400`.
3. **Filter theo category**: `GET /api/materials?category=fabric` —
   filter ở JS sau khi `db.get("materials")` (giữ đúng pattern đã dùng ở
   `routes/venues/index.js`'s `/search`, không thêm SQL riêng cho
   Postgres mode để hành vi 2 chế độ DB giống nhau).
4. KHÔNG thêm phân trang ở prompt này (đó là việc riêng của Prompt 20 cho
   leads) — giữ prompt này gọn trong phạm vi validation + filter.

## Tiêu chí nghiệm thu
- `POST /api/materials` với `category` không hợp lệ → `400`.
- `POST /api/materials` với `color_hex: "red"` → `400`; với
  `color_hex: "#E7B6BB"` → `201`.
- `GET /api/materials?category=fabric` chỉ trả về material có đúng
  category đó.
