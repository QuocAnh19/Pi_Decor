# Pi Decor — Bộ Prompt Nâng Cấp Hoàn Thiện Dự Án
# MASTER INDEX (bản đầy đủ, đã bám sát code thật trong `Project.zip`)

Bộ 22 prompt dưới đây được viết sau khi đọc trực tiếp mã nguồn thật của dự
án (routes Express, migrations SQL, `types.ts`, các trang admin, Studio
builder...) — mỗi prompt trích dẫn đúng tên file, đúng hàm, đúng bug/khoảng
trống đang tồn tại trong code, không viết chung chung.

## Cách dùng

1. Mở file prompt tương ứng — **context dự án đã được nhúng sẵn** vào đầu
   mỗi file (không cần copy `CONTEXT_BLOCK.md` riêng nữa).
2. Đính kèm đúng các file được liệt kê trong mục "File cần đính kèm" của
   prompt đó.
3. Paste toàn bộ nội dung file `.md` vào Claude (khuyến nghị: Claude Code,
   vì các prompt đều yêu cầu sửa/tạo file thật trong repo) và gửi.
4. Làm **theo đúng thứ tự số** — nhiều prompt phụ thuộc migration/route của
   prompt trước (được ghi rõ trong mục "Yêu cầu chạy trước" của từng file).

## Danh sách prompt theo thứ tự

| # | File | Tính năng | Phụ thuộc | Độ phức tạp |
|---|------|-----------|-----------|-------------|
| 1 | `PROMPT_01_BUG_FIX.md` | Fix bug seed `venues.type` sai enum + `AdminSummary` thiếu field | — | Dễ |
| 2 | `PROMPT_02_MIGRATION_0012_MEDIA.md` | Migration `media_assets` (chuẩn bị cho Cloudinary) | — | Dễ |
| 3 | `PROMPT_03_MIGRATION_0013_ACTIVITIES.md` | Migration `lead_activities` + trigger | — | Dễ |
| 4 | `PROMPT_04_MIGRATION_0014_QUOTATIONS.md` | Migration `quotations` | — | Dễ |
| 5 | `PROMPT_05_MIGRATION_0015_TESTIMONIALS.md` | Migration `testimonials` | — | Dễ |
| 6 | `PROMPT_06_MIGRATION_0016_TEMPLATES.md` | Migration 4 bảng Studio (`studio_templates`...) | — | Trung bình |
| 7 | `PROMPT_07_BACKEND_MATERIALS.md` | Backend: Materials API — validation + filter | — | Trung bình |
| 8 | `PROMPT_08_BACKEND_ACTIVITIES.md` | Backend: Lead activities routes + dùng `req.user.sub` | #3 | Trung bình |
| 9 | `PROMPT_09_BACKEND_QUOTATIONS.md` | Backend: Quotation CRUD API | #4, (#8) | Trung bình |
| 10 | `PROMPT_10_BACKEND_TESTIMONIALS.md` | Backend: Testimonials API (public + admin) | #5 | Dễ |
| 11 | `PROMPT_11_BACKEND_STUDIO_TEMPLATES.md` | Backend: Studio templates API + **SVG sanitize** (vá lỗ hổng XSS) | #6 | Khó |
| 12 | `PROMPT_12_BACKEND_INPUT_VALIDATION.md` | Backend: Zod validation toàn bộ routes | #7–#11 (càng nhiều càng tốt) | Trung bình |
| 13 | `PROMPT_13_FRONTEND_TYPES.md` | Frontend: `types.ts` + `api.ts` cho mọi route mới | #1, #7–#11 | Dễ→Trung bình |
| 14 | `PROMPT_14_FRONTEND_MATERIALS_UI.md` | Frontend: Trang admin Materials (chưa từng có UI) | #7, #13 | Trung bình |
| 15 | `PROMPT_15_FRONTEND_LEAD_TIMELINE.md` | Frontend: Timeline hoạt động trong Lead drawer | #8, #13 | Trung bình |
| 16 | `PROMPT_16_FRONTEND_QUOTATION_UI.md` | Frontend: Quotation builder + xuất PDF (font tiếng Việt) | #9, #13 | Khó |
| 17 | `PROMPT_17_FRONTEND_TESTIMONIALS_UI.md` | Frontend: Bỏ localStorage giả, nối API thật + trang duyệt admin | #10, #13, #19 | Trung bình |
| 18 | `PROMPT_18_FRONTEND_STUDIO_TEMPLATES.md` | Frontend: Nối Studio admin editor vào backend thật | #11, #13 | Khó |
| 19 | `PROMPT_19_CLOUDINARY_SETUP.md` | **Chỗ lưu ảnh thật, miễn phí**: local disk → Cloudinary (25 credit/tháng free) | #2 | Trung bình |
| 20 | `PROMPT_20_PAGINATION_SEARCH.md` | Backend + Frontend: Pagination + search leads | — | Trung bình |
| 21 | `PROMPT_21_REFRESH_TOKEN.md` | Auth: JWT refresh token (bảng `refresh_tokens` mới) | — | Trung bình |
| 22 | `PROMPT_22_FINAL_REVIEW.md` | Rà soát bảo mật/hiệu năng + checklist go-live | Tất cả | Dễ (nhưng dài) |

## Vài phát hiện quan trọng đã đưa vào các prompt

- **Bug thật đang tồn tại**: `server/src/utils/seed.js` seed 1 venue với
  `type: "convention"` — giá trị này **không nằm trong**
  `venues_type_check` (`0008_venues.sql`) lẫn `VenueType` union
  (`types.ts`) → seed sẽ lỗi trên Postgres, hoặc render sai trên
  JSON-file mode. → Prompt 01.
- **Lỗ hổng XSS tiềm ẩn**: `SVGCanvas.tsx`, `AssetRenderer.tsx`,
  `DraggableAsset.tsx` render SVG admin-upload bằng
  `dangerouslySetInnerHTML` — hiện chưa khai thác được vì chưa có route
  lưu SVG lên server, nhưng Prompt 11 (thêm route đó) **bắt buộc** phải
  sanitize SVG trước khi lưu, nếu không sẽ mở ra stored-XSS thật cho
  khách hàng dùng Studio.
- **Testimonials hiện tại là giả**: `Testimonials.tsx` lưu review vào
  `localStorage`, ảnh encode base64 — không hề có kiểm duyệt, không đồng
  bộ giữa các trình duyệt. Prompt 05/10/17 thay bằng bảng thật + kiểm
  duyệt admin + upload ảnh thật.
- **Chỗ lưu ảnh miễn phí**: Prompt 19 chuyển từ ổ đĩa cục bộ (bị xoá mỗi
  lần Render Free restart) sang Cloudinary — gói free 25 credit/tháng
  (1 credit = 1GB lưu trữ HOẶC 1GB băng thông HOẶC 1.000 lượt xử lý ảnh),
  đủ dùng cho quy mô dự án này, không phát sinh phí bất ngờ.
- **Studio builder hiện 100% client-side**: `Template`/`Asset`/
  `SlotDefinition`/`SlotRule` trong `features/studio/` chưa có bảng DB
  nào backing — Prompt 06/11/18 đưa toàn bộ vào Postgres thật.

## Context block (đã nhúng sẵn vào mọi prompt, để tham khảo riêng nếu cần)

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
