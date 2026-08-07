# PROMPT 20 — Backend + Frontend: Pagination + search leads

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
- `server/src/routes/leads/index.js`
- `server/src/routes/venues/index.js` (mẫu search: xem
  `GET /api/venues/search?q=` — filter JS sau `db.get()`, KHÔNG viết SQL
  riêng — giữ hành vi giống nhau ở cả JSON-file và Postgres mode)
- `client/src/lib/api.ts`
- `client/src/pages/admin/AdminLeadsPage.tsx` + `.module.scss`
- `client/src/components/admin/LeadTable.tsx` + `.module.scss`

## Bối cảnh
`GET /api/leads` (admin) hiện load **toàn bộ** bảng `leads` vào bộ nhớ rồi
sort trong JS — ổn ở quy mô hiện tại, nhưng không scale. Route
`/api/venues/search` đã có sẵn 1 pattern search JS-side sau khi
`db.get()` — dùng lại đúng pattern này cho leads để hành vi nhất quán giữa
2 chế độ DB (JSON-file không có SQL để mà tối ưu, nên giữ logic filter ở JS
cho cả 2 chế độ thay vì viết riêng 1 nhánh SQL cho Postgres).

## Yêu cầu Backend
1. `GET /api/leads` nhận thêm query: `?page=&limit=&q=&status=`.
   - `q`: tìm trong `name`/`phone`/`email`, không phân biệt hoa thường,
     substring match (JS `.includes()`, giống style
     `/venues/search`).
   - `status`: filter đúng `LeadStatus`.
   - `page` mặc định `1`, `limit` mặc định `20`.
2. Response đổi shape thành:
   ```json
   { "data": [...], "total": 137, "page": 1, "limit": 20 }
   ```
   Đây là **breaking change** với response cũ (mảng phẳng) — phải sửa
   toàn bộ nơi gọi ở client trong cùng prompt này, không để nửa vời.

## Yêu cầu Frontend
1. Sửa `api.getLeads` trong `api.ts`: nhận thêm params
   `{ page?, limit?, q?, status? }`, trả về type mới
   `{ data: Lead[]; total: number; page: number; limit: number }`.
2. Sửa `AdminLeadsPage.tsx`: thêm state `page`, `search`, `statusFilter`;
   thêm ô input tìm kiếm (debounce ~300ms trước khi gọi API — tránh gọi
   API mỗi phím gõ) + dropdown filter theo status + nút prev/next trang ở
   cuối `LeadTable.tsx`, style theo đúng SCSS Module + tông màu đã dùng ở
   trang này.
3. Đảm bảo `handleStatusChange` (optimistic update) vẫn hoạt động đúng
   trên `leads` là mảng trong trang hiện tại (`data`), không phải toàn bộ
   danh sách.

## Tiêu chí nghiệm thu
- Có > 20 lead trong DB → trang 1 chỉ hiện 20, `total` đúng tổng số thật.
- Gõ tìm kiếm số điện thoại → chỉ lọc đúng lead khớp, có debounce (không
  gọi API liên tục mỗi ký tự).
- Đổi trang → gọi lại API với `page` mới, giữ nguyên `q`/`status` đang
  filter.
