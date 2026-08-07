# PROMPT 09 — Backend: Quotation CRUD API

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

## Yêu cầu chạy trước
Prompt 04 (migration `0014_quotations.sql`), khuyến khích đã làm Prompt 08
(để bắn activity `quotation_sent`).

## File cần đính kèm
- `server/src/app.js` (để biết cách mount router mới — xem cách 7 router
  hiện có được import + `app.use`)
- `server/src/routes/leads/index.js` (mẫu pattern route)
- `server/src/routes/venues/index.js` (mẫu route có nested resource)

## Yêu cầu
1. Tạo `server/src/routes/quotations/index.js`, export `quotationsRouter`,
   mount ở `app.js` dưới `/api/quotations` — theo đúng cách 7 router hiện
   có được đăng ký (import ở đầu file, `app.use("/api/quotations",
   quotationsRouter)` cạnh các route khác).
2. Endpoints (tất cả admin-only, dùng `verifyToken, requireAdmin`):
   - `POST /api/quotations` — body `{ lead_id, items[], discount?,
     valid_until?, notes? }`. **Server tự tính `subtotal`/`total` từ
     `items`** (không tin số client gửi lên). Sinh `quotation_number` dạng
     `BG-{năm hiện tại}-{số thứ tự 4 chữ số}` — tính số thứ tự bằng cách
     đếm số quotation đã có trong năm đó qua `db.get("quotations")` (chấp
     nhận race condition nhỏ ở quy mô 1 admin, ghi rõ trade-off này trong
     comment).
   - `GET /api/quotations?lead_id=` — filter theo lead nếu có query.
   - `GET /api/quotations/:id`.
   - `PATCH /api/quotations/:id` — sửa `items`/`status`/`valid_until`/
     `notes`. Nếu `items` thay đổi, tính lại `subtotal`/`total`. Nếu
     `status` chuyển thành `'sent'`, insert thêm 1 `lead_activities` row
     `activity_type: 'quotation_sent'` (dùng lại logic từ Prompt 08 nếu đã
     làm — nếu chưa, bỏ qua bước này và ghi TODO).
   - `DELETE /api/quotations/:id` — chỉ cho xoá khi `status === 'draft'`,
     else `403` với message rõ lý do.

## Tiêu chí nghiệm thu
- Tạo 2 quotation liên tiếp trong cùng năm → `quotation_number` không
  trùng, tăng dần.
- `PATCH` đổi `items` → `total` trả về khớp tổng tính tay, không tin theo
  giá trị `total` client gửi kèm nếu có.
- `DELETE` một quotation `status: 'sent'` → `403`.
