# PROMPT 21 — Auth: JWT refresh token

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
- `server/src/routes/auth/index.js`
- `server/src/middlewares/verifyToken.js`
- `client/src/lib/authContext.tsx` (đọc kỹ TRƯỚC khi quyết định lưu
  refresh token ở đâu — xem token hiện tại đang lưu ở `localStorage` hay
  đâu khác, để không hạ thấp mức bảo mật hiện có một cách âm thầm)
- `client/src/lib/api.ts`
- `server/database/README.md`

## Bối cảnh
Hiện tại chỉ có 1 access token, hết hạn sau `JWT_EXPIRES_IN` (mặc định
`8h`, xem `server/.env.example`) — admin bị đăng xuất giữa chừng không có
cảnh báo, không có cách gia hạn phiên mà không đăng nhập lại.

## Yêu cầu Backend
1. Tạo migration mới `server/database/migrations/0017_refresh_tokens.sql`
   (tiếp đúng số thứ tự sau các migration đã thêm ở Prompt 02-06 — kiểm
   tra số migration cuối cùng thực tế trước khi đặt tên file):
   ```sql
   create table if not exists refresh_tokens (
     id          uuid primary key default gen_random_uuid(),
     admin_id    uuid not null references admins(id) on delete cascade,
     token_hash  text not null,   -- KHÔNG BAO GIỜ lưu token gốc, chỉ lưu hash
     expires_at  timestamptz not null,
     revoked_at  timestamptz,
     created_at  timestamptz not null default now()
   );
   create index if not exists idx_refresh_tokens_admin on refresh_tokens (admin_id);
   ```
   Thêm vào `TABLES` allowlist trong `database.pg.js`.
2. `POST /api/auth/login`: ngoài access token hiện có, sinh thêm 1 refresh
   token ngẫu nhiên (vd `crypto.randomBytes(40).toString("hex")`), lưu
   **hash** của nó (vd `crypto.createHash("sha256")...`) vào
   `refresh_tokens` với `expires_at` = now + 30 ngày, trả token gốc (không
   phải hash) về client trong response.
3. `POST /api/auth/refresh` — body `{ refresh_token }`: hash token nhận
   được, tìm dòng khớp `token_hash` + chưa `revoked_at` + chưa hết hạn →
   nếu hợp lệ, sinh access token mới, trả về. Nếu không hợp lệ → `401`.
4. `POST /api/auth/logout` — body `{ refresh_token }`: set `revoked_at =
   now()` cho dòng tương ứng.

## Yêu cầu Frontend
1. Trong `authContext.tsx`, lưu refresh token cùng chỗ với access token
   hiện tại (giữ nguyên cơ chế lưu trữ đang dùng — KHÔNG tự ý đổi sang
   cookie `httpOnly` trừ khi server đã có sẵn cơ chế set cookie, vì đó là
   thay đổi kiến trúc lớn hơn phạm vi prompt này; nếu quyết định vẫn giữ
   `localStorage`, ghi rõ trong code comment đây là đánh đổi bảo mật đã
   biết — XSS có thể đánh cắp refresh token — không được lờ đi vấn đề này).
2. Trong `request()` helper của `api.ts`: khi response `401`, thử gọi
   `/api/auth/refresh` 1 lần, nếu thành công thì retry lại request gốc với
   access token mới; nếu refresh cũng thất bại → logout thật (xoá token,
   điều hướng về `/admin/login`).

## Tiêu chí nghiệm thu
- Access token hết hạn giữa phiên làm việc → request tiếp theo tự refresh
  ngầm, người dùng không bị văng ra trang login đột ngột.
- Refresh token bị revoke (sau logout) → gọi `/api/auth/refresh` với token
  đó → `401`, không cấp access token mới.
