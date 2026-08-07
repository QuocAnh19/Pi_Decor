# PROMPT 16 — Frontend: Quotation builder + PDF export (Khó)

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
Prompt 09 (backend quotations), Prompt 13 (types/api), khuyến khích Prompt
15 đã xong (nút "Tạo báo giá" gắn trong `LeadDetailDrawer`).

## File cần đính kèm
- `client/package.json` (xác nhận **chưa có** lib PDF nào — không có
  `jspdf`/`react-pdf`/`html2canvas`)
- `client/src/components/admin/LeadDetailDrawer.tsx`
- `client/src/pages/admin/AdminVenuesPage.tsx` (mẫu layout trang admin)

## ⚠️ Lưu ý về font tiếng Việt trong PDF
Font mặc định của `jsPDF` (Helvetica) **không hỗ trợ dấu tiếng Việt** — chữ
"Cảm ơn quý khách" sẽ ra lỗi font/mất dấu nếu dùng `jsPDF.text()` trực
tiếp. Có 2 hướng, chọn 1 và làm đúng:
- **(A) Nhúng font Unicode** (Roboto/Noto Sans) dạng base64 vào jsPDF bằng
  `addFont()` — chuẩn nhưng file base64 font khá nặng trong bundle.
- **(B, khuyến nghị)** Render 1 template HTML/CSS đẹp (SCSS Module riêng),
  dùng `html2canvas` chụp lại thành ảnh rồi nhúng vào PDF bằng `jsPDF` —
  đảm bảo tiếng Việt hiển thị đúng 100% vì browser tự render font, không
  phụ thuộc font embed của jsPDF.

Chọn hướng B trừ khi có lý do cụ thể để không dùng (ví dụ cần PDF text có
thể copy-paste được — nếu vậy phải làm hướng A và test kỹ với chữ có dấu).

## Yêu cầu
1. Thêm `"jspdf"` + `"html2canvas"` vào `client/package.json`.
2. Tạo `client/src/pages/admin/AdminQuotationsPage.tsx` (hoặc tích hợp như
   1 modal mở từ `LeadDetailDrawer` — quyết định dựa trên UX, khuyến nghị
   modal vì báo giá luôn gắn với 1 lead cụ thể).
3. **Line-item builder**: bảng các dòng `{description, quantity,
   unit_price}` — thêm/xoá dòng động, `subtotal` mỗi dòng tự tính
   (`quantity * unit_price`), tổng `subtotal` + field `discount` + `total`
   hiển thị realtime khi gõ (KHÔNG cần gọi API cho mỗi lần gõ — chỉ tính
   ở client, gửi lên server khi bấm Lưu; server sẽ tự tính lại theo Prompt
   09, không tin số client gửi).
4. Nút "Lưu nháp" (status `draft`) và "Gửi báo giá" (status `sent` — kèm
   xác nhận trước khi gửi).
5. Nút "Xuất PDF" — render template ẩn (off-screen div) theo bố cục báo
   giá thực tế (logo/tên Pi Decor, thông tin khách, bảng items, tổng
   tiền), dùng `html2canvas` + `jsPDF` theo hướng B ở trên, tải file
   `bao-gia-{quotation_number}.pdf`.

## Tiêu chí nghiệm thu
- Tạo báo giá với chữ có dấu tiếng Việt đầy đủ (vd "Trang trí rèm lụa hồng
  phấn") → xuất PDF, mở lên đọc đúng chữ, không mất dấu, không lỗi font.
- Tổng tiền hiển thị client khớp với tổng server trả về sau khi lưu.
