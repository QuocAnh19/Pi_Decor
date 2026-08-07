# PROMPT 13 — Frontend: Cập nhật `types.ts` + `api.ts`

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
Prompt 01 (bug AdminSummary), và càng nhiều prompt backend (07-11) đã làm
càng tốt — prompt này map 1-1 theo response shape thật của các route mới.

## File cần đính kèm
- `client/src/lib/types.ts`
- `client/src/lib/api.ts`
- `client/src/features/studio/types/index.ts`
- Toàn bộ route backend mới đã hoàn thành (leads/activities, quotations,
  testimonials, studio)

## ⚠️ Lưu ý về 2 khái niệm "Template/Asset" khác nhau
`client/src/features/studio/types/index.ts` đã có sẵn `Template`, `Asset`,
`SlotDefinition`, `SlotRule` — đây là **runtime shape dùng trong Studio
builder** (camelCase, một số field optional cho state cục bộ). Bảng DB mới
từ Prompt 06 (`studio_templates`, `studio_assets`...) trả về **snake_case,
đúng với response backend**. **KHÔNG** gộp 2 loại này làm một interface —
tạo type mới trong `types.ts` (ví dụ `StudioTemplateRow`,
`StudioAssetRow`...) đại diện cho response server, và viết hàm adapter
(`toStudioTemplate(row: StudioTemplateRow): Template`) ở nơi hợp lý (gợi ý
`client/src/features/studio/utils/adapters.ts`) để chuyển đổi khi tải dữ
liệu — việc này Prompt 18 sẽ dùng.

## Yêu cầu
1. **Sửa `AdminSummary`**: thêm `venues_total`, `projects_published_total`
   (nếu Prompt 01 chưa làm).
2. Thêm các interface mới khớp response backend thật:
   `LeadActivity`, `ActivityType`, `Quotation`, `QuotationItem`,
   `QuotationStatus`, `Testimonial` (2 shape: public — không có `status`
   nếu backend không trả, và admin — đầy đủ), `StudioTemplateRow`,
   `StudioSlotDefinitionRow`, `StudioAssetRow`, `StudioSlotRuleRow`.
3. Mở rộng `api.ts` theo đúng pattern `request`/`authRequest` đã có (không
   tạo wrapper fetch mới):
   `getLeadActivities`, `addLeadActivity`,
   `getQuotations`, `getQuotation`, `createQuotation`, `updateQuotation`,
   `deleteQuotation`,
   `getTestimonials`, `submitTestimonial`, `getTestimonialsAdmin`,
   `updateTestimonialStatus`, `deleteTestimonial`,
   `getStudioTemplates`, `getStudioTemplatesAdmin`, `createStudioTemplate`,
   `updateStudioTemplate`, `deleteStudioTemplate`,
   `getStudioAssets`, `uploadStudioAsset`, ...
4. Sửa `getMaterials`/`getServices` trong `api.ts` (hiện đang gõ
   `request<unknown[]>` — rất lỏng lẻo) để dùng type cụ thể nếu Material/
   Service interface đã tồn tại hoặc cần tạo mới trong `types.ts`.

## Tiêu chí nghiệm thu
- `tsc` (script `build` của client) chạy sạch, không lỗi type.
- Không có `any`/`unknown` mới bị thêm vào mà không có lý do rõ ràng.
