# PROMPT 08 — Backend: Lead activities routes + JWT admin_id

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
Prompt 03 (migration `0013_lead_activities.sql`) đã được áp dụng.

## File cần đính kèm
- `server/src/routes/leads/index.js`
- `server/src/middlewares/verifyToken.js`
- `server/src/routes/auth/index.js`
- `server/src/routes/designs/index.js`

## Bối cảnh
`verifyToken.js` đã giải mã JWT thành `req.user = { sub, email, role }`
(xem `jwt.sign({ sub: admin.id, email: admin.email, role: "admin" }, ...)`
trong `routes/auth/index.js`) — nghĩa là **`req.user.sub` chính là
`admin_id`**, đã sẵn có ở MỌI route admin, chỉ là chưa route nào dùng tới
nó cả. Prompt này là nơi đầu tiên thật sự dùng `req.user.sub`.

## Yêu cầu
1. **`GET /api/leads/:id/activities`** (admin) — trả danh sách activity của
   1 lead, mới nhất trước, `404` nếu lead không tồn tại.
2. **`POST /api/leads/:id/activities`** (admin) — body
   `{ activity_type, body }`. Chỉ chấp nhận `activity_type` thuộc
   `['note','call','email']` từ client — nếu client gửi
   `'status_change'`/`'quotation_sent'`/`'design_saved'` (những loại chỉ hệ
   thống tự sinh) thì trả `400`. Set `admin_id = req.user.sub`.
3. Sửa `PATCH /api/leads/:id` (đổi status) để, sau khi update thành công,
   **tự insert thêm 1 dòng `lead_activities`** với
   `activity_type: 'status_change'`, `admin_id: req.user.sub`,
   `metadata: { from: <status cũ>, to: <status mới> }`. Làm ở application
   code (không dựa vào Postgres trigger) để hành vi giống nhau ở cả JSON-file
   và Postgres mode — đúng note đã ghi trong migration `0013`.
4. (Nên làm) Sửa `POST /api/designs` (`routes/designs/index.js`) để cũng
   tự insert 1 activity `'design_saved'` cho `lead_id` liên quan, nếu
   `lead_id` được gửi kèm.

## Tiêu chí nghiệm thu
- `PATCH /api/leads/:id` với `{status:"contacted"}` → sau đó
  `GET /api/leads/:id/activities` phải thấy 1 dòng `status_change` mới, có
  `admin_id` đúng bằng admin đang đăng nhập.
- `POST /api/leads/:id/activities` với `activity_type: "status_change"` từ
  client → `400`.
