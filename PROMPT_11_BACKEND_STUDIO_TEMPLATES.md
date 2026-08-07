# PROMPT 11 — Backend: Studio templates API + SVG upload (Khó)

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
Prompt 06 (migration `0016_studio_templates.sql`).

## File cần đính kèm
- `server/src/utils/uploadImage.js`
- `server/src/app.js`
- `client/src/features/studio/components/admin/TemplateUploader.tsx`
- `client/src/features/studio/components/shared/SVGCanvas.tsx`
- `client/src/features/studio/components/shared/AssetRenderer.tsx`
- `client/src/features/studio/components/customer/DraggableAsset.tsx`

## ⚠️ Lỗ hổng bảo mật cần vá
`SVGCanvas.tsx`, `AssetRenderer.tsx`, và `DraggableAsset.tsx` đều render
SVG do admin upload bằng `dangerouslySetInnerHTML`. Hiện tại
`TemplateUploader.tsx` chỉ đọc file bằng `FileReader` vào state cục bộ —
**chưa hề gửi lên server**, nên chưa có input động thật sự chạm React ở
runtime từ nguồn không tin cậy. Nhưng ngay khi prompt này thêm route upload
+ lưu DB thật, mọi SVG admin tải lên sẽ được serve lại và render qua
`dangerouslySetInnerHTML` cho **khách hàng** xem ở Studio — nếu không
sanitize, đây là stored-XSS thật.

**Bắt buộc:** sanitize SVG ở server TRƯỚC khi lưu vào `svg_base`/
`svg_data` — loại bỏ `<script>`, mọi attribute `on*` (onclick, onload...),
và external reference (`xlink:href` trỏ ra ngoài). Thêm dependency mới vào
`server/package.json` (gợi ý: `dompurify` + `jsdom`, hoặc một thư viện
sanitize SVG chuyên dụng) — không tự viết regex sanitize tay, dễ sót case.

## Yêu cầu
1. Tạo `server/src/routes/studio/index.js`, mount ở `/api/studio`.
2. **Templates**: `GET /api/studio/templates` (public, chỉ `is_active`),
   `GET /api/studio/templates/admin` (admin, tất cả), `POST`/`PATCH`/
   `DELETE /api/studio/templates/:id` (admin).
3. **Slot definitions** (nested dưới template):
   `GET/POST /api/studio/templates/:id/slots`,
   `PATCH/DELETE /api/studio/slots/:slotId`, và
   `PATCH /api/studio/templates/:id/slots/reorder` (body: mảng
   `{id, sort_order}` — khớp với cách `SlotList.tsx` phía client đang quản
   lý thứ tự cục bộ, xem file đó trước khi quyết định shape payload).
4. **Assets** (không thuộc riêng template nào):
   `GET /api/studio/assets` (public, `is_active` only),
   `GET /api/studio/assets/admin`,
   `POST /api/studio/assets` (admin, multipart, field `svg` — dùng lại
   pattern `uploadImage.single()` từ `uploadImage.js` nhưng mở rộng
   `fileFilter` để chấp nhận thêm `image/svg+xml`), `PATCH`/`DELETE`.
5. **Slot rules**: `GET/POST /api/studio/templates/:id/rules`,
   `PATCH/DELETE /api/studio/rules/:ruleId`.
6. Mọi endpoint nhận SVG (`svg_base` hoặc `svg_data`, dù qua JSON string
   hay multipart file) đều phải đi qua hàm sanitize dùng chung, ví dụ
   `sanitizeSvg(rawSvgString)` trong `server/src/utils/sanitizeSvg.js`.

## Tiêu chí nghiệm thu
- Upload 1 file SVG có chứa `<script>alert(1)</script>` → lưu vào DB không
  còn `<script>` tag, và không còn attribute `onload=`.
- `GET /api/studio/templates` (public) không trả về template có
  `is_active: false`.
- Reorder slot qua `PATCH .../slots/reorder` → `GET` lại đúng thứ tự mới.
