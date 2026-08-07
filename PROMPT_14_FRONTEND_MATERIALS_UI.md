# PROMPT 14 — Frontend: Admin Materials page

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
Prompt 07 (backend materials validation), Prompt 13 (types/api).

## File cần đính kèm (mẫu để copy đúng pattern)
- `client/src/pages/admin/AdminVenuesPage.tsx` + `.module.scss`
- `client/src/components/admin/VenueForm.tsx` + `.module.scss`
- `client/src/components/admin/VenueList.tsx` + `.module.scss`
- `client/src/components/admin/AdminLayout.tsx` (để thêm nav link)
- `client/src/App.tsx` (để thêm route)

## Bối cảnh
Bảng `materials` và API `/api/materials` đã hoạt động đầy đủ từ trước
(xem comment trong `0006_materials.sql`: *"this table exists and its admin
API already works end-to-end, but there is currently no admin UI screen for
it"*) — **route đã có, chỉ thiếu màn hình admin**.

## Yêu cầu
1. Tạo `client/src/pages/admin/AdminMaterialsPage.tsx` +
   `AdminMaterialsPage.module.scss` — copy cấu trúc từ
   `AdminVenuesPage.tsx` (load list on mount, trạng thái
   `loading/ready/error`, mở form thêm/sửa, optimistic update kiểu
   `AdminLeadsPage.tsx`).
2. Tạo `client/src/components/admin/MaterialForm.tsx` +
   `.module.scss` — copy cấu trúc từ `VenueForm.tsx`: field `name`,
   `category` (select — dùng đúng danh sách category từ Prompt 07),
   `color_hex` (color picker input `type="color"` + input text hex),
   `image` (file input, gửi `multipart/form-data` tới
   `POST/PATCH /api/materials` với field `image`, đúng như
   `materialsRouter` đã dùng `uploadImage.single("image")`).
3. Tạo `client/src/components/admin/MaterialList.tsx` +
   `.module.scss` — copy cấu trúc từ `VenueList.tsx`, hiển thị swatch màu
   (`color_hex`) hoặc thumbnail (`image_url`), category, nút sửa/xoá.
4. Thêm route `/admin/materials` (tham khảo cách `/admin/venues` đã đăng
   ký trong `App.tsx`), thêm mục nav trong `AdminLayout.tsx`'s nav array
   (icon `lucide-react` phù hợp, ví dụ `Palette` hoặc `Layers`).

## Tiêu chí nghiệm thu
- Vào `/admin/materials` thấy danh sách vật liệu load từ API thật.
- Thêm 1 material mới kèm ảnh → xuất hiện ngay trong list (optimistic hoặc
  refetch), ảnh hiển thị đúng từ `/uploads/...`.
- Sửa/xoá hoạt động, có xác nhận trước khi xoá (giống `VenueList.tsx`).
