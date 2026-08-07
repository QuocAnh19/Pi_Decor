# PROMPT 01 — Fix bug `venues_type` + `AdminSummary` type

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
- `server/src/utils/seed.js`
- `server/database/migrations/0008_venues.sql`
- `server/src/routes/admin/index.js`
- `client/src/lib/types.ts`
- `client/src/pages/admin/AdminDashboardPage.tsx`
- `client/src/components/admin/VenueList.tsx`

## Bug #1 — `venues_type`
Trong `server/src/utils/seed.js`, một venue được seed với `type: "convention"`
(venue ở TP.HCM). Nhưng:
- `venues_type_check` trong `0008_venues.sql` chỉ cho phép
  `'hotel' | 'restaurant' | 'resort' | 'sảnh tiệc'` → **INSERT sẽ bị Postgres
  từ chối** khi chạy `npm run seed` với `DATABASE_URL` đã set.
- `VenueType` trong `client/src/lib/types.ts` cũng chỉ có 4 giá trị đó → nếu
  seed chạy ở chế độ JSON-file (không set `DATABASE_URL`) thì không lỗi khi
  ghi, nhưng `typeLabel: Record<VenueType, string>` trong `VenueList.tsx`
  (dòng ~5) sẽ không có key `"convention"` → render ra `undefined`.

**Yêu cầu:** Sửa `seed.js` để dùng một giá trị `type` hợp lệ đã có (gợi ý:
`"sảnh tiệc"` — venue đó là một convention center nên hợp ngữ nghĩa nhất).
KHÔNG thêm migration mới, KHÔNG sửa `venues_type_check` — chỉ sửa dữ liệu
seed. Chạy thử `npm run seed` (cả 2 chế độ nếu có thể) để xác nhận không còn
lỗi constraint violation.

## Bug #2 — `AdminSummary` thiếu field
`server/database/migrations/0011_views.sql` đã định nghĩa view
`admin_dashboard_summary` với đủ 7 cột, gồm cả `venues_total` và
`projects_published_total` — nhưng route thật `GET /api/admin/summary`
trong `server/src/routes/admin/index.js` chỉ trả về 5 field (thiếu 2 field
trên), và `AdminSummary` trong `client/src/lib/types.ts` cũng chỉ khai báo 5
field đó. Hệ quả: `AdminDashboardPage.tsx` phải tự gọi thêm
`api.getVenues()` và `reduce()` thủ công để tính `totalProjects` — chính
comment trong file đó đã ghi rõ: *"summary doesn't include venues/projects
yet"*.

**Yêu cầu:**
1. Sửa `GET /api/admin/summary` để trả thêm `venues_total` (đếm
   `db.get("venues")`) và `projects_published_total` (đếm
   `db.get("projects")` với `published === true`), song song với các
   `Promise.all` đã có.
2. Cập nhật interface `AdminSummary` trong `types.ts` thêm 2 field mới.
3. Đơn giản hoá `AdminDashboardPage.tsx`: bỏ lệnh gọi `api.getVenues()` và
   phép `reduce()` thủ công, dùng thẳng `summary.venues_total` và
   `summary.projects_published_total` cho 2 card tương ứng.

## Tiêu chí nghiệm thu
- `npm run seed` chạy sạch không lỗi constraint (cả 2 chế độ DB nếu test
  được).
- `GET /api/admin/summary` trả về đủ 7 field khớp với view
  `admin_dashboard_summary`.
- `AdminDashboardPage.tsx` chỉ còn 1 lệnh gọi API (`api.getSummary`), không
  còn `Promise.all` với `getVenues`.
- `tsc` không còn lỗi type liên quan đến `AdminSummary`.
