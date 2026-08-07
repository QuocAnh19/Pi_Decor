# PROMPT 10 — Backend: Testimonials API

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
Prompt 05 (migration `0015_testimonials.sql`).

## File cần đính kèm
- `server/src/app.js`
- `server/src/routes/leads/index.js` (mẫu rate-limit riêng cho endpoint
  public — xem `leadsLimiter` trong `app.js`)
- `client/src/components/sections/Testimonials.tsx` (để hiểu đúng shape dữ
  liệu client hiện đang tự tạo, sẽ được thay thế ở Prompt 17)

## Yêu cầu
1. Tạo `server/src/routes/testimonials/index.js`, mount ở
   `/api/testimonials` trong `app.js`.
2. **`GET /api/testimonials`** — public, chỉ trả `status = 'approved'`,
   mới nhất trước.
3. **`POST /api/testimonials`** — public (form "Viết đánh giá"). Body:
   `{ author, role?, quote, rating?, photos?, lead_id? }`. Server **luôn
   ép** `status: 'pending'`, `source: 'customer'` bất kể client gửi gì
   khác. Thêm rate limiter riêng trong `app.js` (giống `leadsLimiter`,
   ví dụ 10 request / 15 phút) áp cho `/api/testimonials` — testimonial
   public POST cũng là bề mặt spam như lead form.
4. **`GET /api/testimonials/admin`** — admin only, trả tất cả (mọi
   status), có thể filter `?status=`.
5. **`PATCH /api/testimonials/:id`** — admin only. Cho đổi `status`
   (`approved`/`rejected`) hoặc sửa nội dung (chỉ nên cho sửa nội dung với
   `source: 'admin_seed'`, với `source: 'customer'` chỉ nên cho đổi
   `status` để tránh admin "sửa lời khách" — ghi rõ note này, không cần
   enforce cứng ở version đầu nếu thấy phức tạp, nhưng phải ghi TODO).
6. **`DELETE /api/testimonials/:id`** — admin only.
7. `photos`: chỉ chấp nhận **URL string** (đã upload qua endpoint khác),
   **cấm lưu base64 data-URL** — nếu `photos[i]` bắt đầu bằng `"data:"` thì
   trả `400` với message rõ ràng (đây chính là anti-pattern hiện tại của
   `Testimonials.tsx`, đừng lặp lại nó ở backend).

## Tiêu chí nghiệm thu
- `POST /api/testimonials` không đăng nhập vẫn tạo được (public), nhưng
  luôn ra `status: 'pending'` dù client cố gửi `status: 'approved'`.
- `GET /api/testimonials` (public) không bao giờ trả về testimonial
  `pending`/`rejected`.
- `POST /api/testimonials` với `photos: ["data:image/png;base64,..."]` →
  `400`.
