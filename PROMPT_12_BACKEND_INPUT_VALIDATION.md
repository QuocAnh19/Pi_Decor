# PROMPT 12 — Backend: Zod validation toàn bộ routes

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
- `server/package.json`
- Tất cả route hiện có: `server/src/routes/leads/index.js`,
  `venues/index.js`, `materials/index.js`, `services/index.js`,
  `designs/index.js`, `auth/index.js`
- Toàn bộ route mới từ Prompt 08/09/10/11 nếu đã làm (quotations,
  testimonials, studio, lead activities)

## Bối cảnh
`zod` **chưa** có trong `server/package.json`. Validation hiện tại là các
câu `if (!name || !phone) return res.status(400).json({ message: "..." })`
rải rác trong từng route — hoạt động nhưng không nhất quán và dễ sót field.

## Yêu cầu
1. Thêm `"zod": "^3.23.0"` vào `server/package.json`.
2. Tạo `server/src/schemas/` với 1 file schema mỗi domain: `leads.schema.js`,
   `venues.schema.js`, `materials.schema.js`, `services.schema.js`,
   `auth.schema.js`, và (nếu các prompt trước đã làm)
   `quotations.schema.js`, `testimonials.schema.js`, `studio.schema.js`,
   `leadActivities.schema.js`.
3. Tạo middleware `server/src/middlewares/validate.js`:
   ```js
   export function validate(schema, source = "body") {
     return (req, res, next) => {
       const result = schema.safeParse(req[source]);
       if (!result.success) {
         const message = result.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.";
         return res.status(400).json({ message });
       }
       req[source] = result.data;
       next();
     };
   }
   ```
   Giữ **nguyên định dạng response lỗi hiện có** (`{ message: string }`,
   status `400`) để không phá client — client không cần đổi gì khi đổi
   validation layer.
4. Áp `validate(schema)` vào mọi route `POST`/`PATCH` (kể cả
   `POST /api/auth/login`), thay cho các `if (!field)` thủ công. Giữ message
   tiếng Việt tương tự bản gốc trong `.refine()`/`.min(1, "...")` của Zod.
5. KHÔNG đổi status code hay shape response thành công của bất kỳ route
   nào — chỉ thay lớp validate lỗi 400.

## Tiêu chí nghiệm thu
- Gửi thiếu field bắt buộc tới bất kỳ route nào → vẫn `400` với `message`
  tiếng Việt hợp lý (không phải message lỗi Zod tiếng Anh mặc định).
- Toàn bộ test case thành công cũ (đã pass trước khi thêm Zod) vẫn pass y
  hệt, không đổi status/shape.
