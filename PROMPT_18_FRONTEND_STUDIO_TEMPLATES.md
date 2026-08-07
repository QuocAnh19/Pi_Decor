# PROMPT 18 — Frontend: Studio templates admin UI (Khó)

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
Prompt 11 (backend studio API + SVG sanitize), Prompt 13 (types/api +
adapter functions `toStudioTemplate()` v.v.).

## File cần đính kèm
- `client/src/pages/admin/AdminStudioPage.tsx`
- `client/src/features/studio/components/admin/AdminEditor.tsx`
- `client/src/features/studio/components/admin/AdminCanvas.tsx`
- `client/src/features/studio/components/admin/SlotList.tsx`
- `client/src/features/studio/components/admin/SlotProperties.tsx`
- `client/src/features/studio/components/admin/RuleEditor.tsx`
- `client/src/features/studio/components/admin/RuleList.tsx`
- `client/src/features/studio/components/admin/TemplateUploader.tsx`
- `client/src/features/studio/components/admin/AddSlotModal.tsx`
- `client/src/features/studio/data/seed/templates.ts`

## Bước đầu tiên — BẮT BUỘC trước khi sửa code
Đọc `AdminStudioPage.tsx` để xác nhận chính xác: state hiện tại
(templates/slots/assets/rules) đang khởi tạo từ đâu — rất có thể từ
`data/seed/templates.ts` cứng, hoàn toàn client-side, không có network call
nào. Xác nhận đúng luồng dữ liệu thật trước khi viết lại, vì các component
con (`AdminEditor.tsx` v.v.) có thể nhận state qua props từ nhiều tầng —
đừng đoán, hãy trace thật.

## Yêu cầu
1. Ở `AdminStudioPage.tsx`, thay nguồn dữ liệu ban đầu từ
   `data/seed/templates.ts` sang gọi `api.getStudioTemplatesAdmin()`,
   `api.getStudioAssets()`... khi mount, dùng adapter từ Prompt 13 để
   convert response server (snake_case) sang shape runtime
   (`Template`/`Asset`/`SlotDefinition`/`SlotRule` trong
   `features/studio/types/index.ts`) mà các component con đang dùng — mục
   tiêu là **không phải sửa lại logic bên trong** `AdminEditor.tsx`/
   `AdminCanvas.tsx`/v.v., chỉ đổi nguồn + đích của state ở tầng
   `AdminStudioPage.tsx`.
2. Mỗi hành động sửa đổi (di chuyển/resize slot trong `AdminCanvas.tsx`,
   thêm rule trong `RuleEditor.tsx`, gán asset...) hiện chỉ gọi
   `setState` cục bộ — thêm 1 lớp "persist" gọi API tương ứng
   (`PATCH /api/studio/slots/:id`, `POST /api/studio/templates/:id/rules`...)
   sau khi state cục bộ update, theo pattern optimistic-update đã dùng ở
   `AdminLeadsPage.tsx` (update UI ngay, rollback nếu API lỗi).
3. Sửa `TemplateUploader.tsx`: hiện tại `processFile()` chỉ đọc SVG bằng
   `FileReader` vào state cục bộ (`pendingFile`), **không có network call
   nào cả** — thêm bước gọi thật `api.uploadStudioAsset(file, ...)` (asset)
   hoặc `api.updateStudioTemplate(id, { svg_base: content })` (base
   template) trong `handleConfirmUpload()`, tuỳ `uploadType`.
4. Thêm toggle "Kích hoạt / Ẩn" (`is_active`) cho từng template, map với
   nút gọi `api.updateStudioTemplate(id, { is_active })` — chỉ template
   `is_active: true` mới hiện cho khách ở `StudioPage.tsx`.

## Tiêu chí nghiệm thu
- Tải lại trang `/admin/studio` → dữ liệu load từ API thật, không còn phụ
  thuộc `data/seed/templates.ts` (file đó có thể giữ lại làm fallback/dev
  seed cho `npm run seed`, nhưng không còn là nguồn cho UI runtime).
- Upload 1 SVG asset mới → xuất hiện lại đúng sau khi F5 trang (chứng tỏ
  đã lưu server, không chỉ còn trong state cục bộ).
- Tắt `is_active` 1 template → template đó biến mất khỏi
  `TemplateSelectorModal.tsx` phía customer.
