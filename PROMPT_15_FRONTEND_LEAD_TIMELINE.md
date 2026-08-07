# PROMPT 15 — Frontend: Lead drawer + timeline

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
Prompt 08 (backend activities routes), Prompt 13 (types/api).

## File cần đính kèm
- `client/src/components/admin/LeadDetailDrawer.tsx` + `.module.scss`
  (152 dòng hiện có — đọc kỹ để giữ nguyên phần hiển thị
  `design_snapshot` playback đã có, chỉ THÊM timeline, không sửa lại phần
  cũ)
- `client/src/pages/admin/AdminLeadsPage.tsx`

## Yêu cầu
1. Thêm section mới vào `LeadDetailDrawer.tsx`, đặt dưới phần
   `design_snapshot` hiện có: **Timeline hoạt động**.
2. Khi drawer mở (lead thay đổi), gọi
   `api.getLeadActivities(lead.id, token)` (cần `token` — lấy từ
   `useAuth()` giống cách `AdminLeadsPage.tsx` đã dùng, truyền `token`
   xuống `LeadDetailDrawer` như 1 prop mới nếu chưa có).
3. Render danh sách activity theo thời gian (mới nhất trước), mỗi item có
   icon riêng theo `activity_type` (gợi ý map bằng `lucide-react`:
   `status_change` → `ArrowRightLeft`, `note` → `StickyNote`, `call` →
   `Phone`, `email` → `Mail`, `quotation_sent` → `FileText`,
   `design_saved` → `Palette`), dùng lại `formatDate()` đã có trong file.
4. Thêm `activityTypeLabel: Record<ActivityType, string>` tiếng Việt,
   cùng style với `statusLabel` đã có ở đầu file.
5. Thêm 1 textarea + nút "Ghi chú" ở cuối timeline — gọi
   `api.addLeadActivity(lead.id, { activity_type: 'note', body }, token)`,
   sau khi thành công thì thêm ngay vào đầu danh sách timeline hiện tại
   (optimistic, giống cách `AdminLeadsPage.tsx` xử lý status change) thay
   vì phải refetch toàn bộ.
6. Với activity `status_change`, hiển thị `metadata.from → metadata.to`
   bằng `statusLabel` đã có sẵn (không hard-code text mới).

## Tiêu chí nghiệm thu
- Mở 1 lead → thấy timeline load đúng dữ liệu, kể cả dòng `status_change`
  tự động do Prompt 08 sinh ra khi đổi trạng thái ở `LeadTable`.
- Thêm ghi chú → xuất hiện ngay lập tức trong danh sách, không cần đóng
  mở lại drawer.
