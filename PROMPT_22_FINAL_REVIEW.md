# PROMPT 22 — Final review + checklist trước go-live

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
- Toàn bộ `server/database/migrations/` (bản mới nhất sau khi làm hết
  Prompt 02-06 + 21)
- `server/database/SECURITY.md`
- `server/database/security/create_app_role.sql`
- `server/.env.example`, `client/.env.example`
- `server/src/app.js`
- `server/src/routes/auth/index.js`

## Đây KHÔNG phải prompt code mới — là prompt rà soát
Yêu cầu Claude thực hiện tuần tự từng mục dưới đây và báo cáo kết quả từng
mục (Pass/Fail + lý do), không tự ý sửa code trừ khi mục đó Fail và cách
sửa rõ ràng, an toàn:

1. **Migration toàn vẹn**: chạy `npm run migrate` trên 1 Postgres rỗng, xác
   nhận toàn bộ file từ `0001` đến file cuối cùng (kể cả các file mới từ
   Prompt 02, 03, 04, 05, 06, 21) áp dụng thành công theo đúng thứ tự,
   không có FK tham chiếu tới bảng chưa tồn tại.
2. **Phân quyền DB**: đối chiếu `database/SECURITY.md` §1 và
   `security/create_app_role.sql` — xác nhận `DATABASE_URL` dùng ở môi
   trường triển khai thật (Render) là role ít quyền `pidecor_app`, KHÔNG
   phải role owner dùng để chạy migration.
3. **JWT_SECRET**: `routes/auth/index.js` hiện chỉ `console.warn` nếu
   `NODE_ENV === "production"` mà `JWT_SECRET` vẫn là `"dev-secret"` — cân
   nhắc đổi thành **fail-fast** (throw lúc khởi động server thay vì chỉ
   warn) để không thể vô tình deploy với secret mặc định; đề xuất thay đổi
   này, không tự áp dụng nếu ảnh hưởng cách người dùng đang chạy local.
4. **CORS_ORIGIN**: xác nhận biến môi trường ở Render trỏ đúng domain
   Vercel thật, không còn là `http://localhost:5173`.
5. **Cloudinary**: xác nhận `CLOUDINARY_*` đã set ở môi trường Render, và
   `/uploads` static fallback trong `app.js` không còn ảnh nào thực sự phụ
   thuộc vào nó (grep response từ các bảng `materials`/`testimonials`/
   `studio_assets` xem còn URL nào trỏ `localhost`/`/uploads/` không).
6. **Rate limit**: rà lại `loginLimiter`, `leadsLimiter`, và limiter mới
   cho `/api/testimonials` (Prompt 10) — xác nhận số/window hợp lý cho quy
   mô traffic thật dự kiến, không quá chặt (chặn khách thật) hay quá lỏng
   (không chặn được spam).
7. **Build sạch**: chạy `npm run build` ở `client/` (script đã có sẵn
   `tsc && vite build`) — fix mọi lỗi type còn sót lại từ Prompt 13-18.
8. **Smoke test toàn bộ admin**: đi qua checklist bảng "How the tables map
   to the app" trong `database/README.md`, **cập nhật bảng này** thêm 6
   bảng mới (`media_assets`, `lead_activities`, `quotations`,
   `testimonials`, `studio_templates` + 3 bảng con, `refresh_tokens`) và
   route file tương ứng của từng bảng — test thủ công từng màn hình admin
   1 lượt.
9. **Không còn base64 rò rỉ**: `grep -rn "data:image" client/src` — xác
   nhận không còn nơi nào lưu ảnh base64 vào state lâu dài/gửi lên server
   (ngoại trừ preview tạm thời trước khi upload, nếu có, phải được thay
   bằng URL thật ngay sau khi upload xong).

## Tiêu chí nghiệm thu
- Báo cáo đầy đủ 9 mục trên, mỗi mục ghi rõ Pass/Fail + evidence (lệnh đã
  chạy, output, hoặc đường dẫn file đã kiểm tra) — không được kết luận
  "Pass" mà không có bằng chứng cụ thể.
