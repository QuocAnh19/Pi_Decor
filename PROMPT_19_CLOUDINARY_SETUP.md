# PROMPT 19 — Image upload: Local → Cloudinary (chỗ lưu ảnh thật, miễn phí)

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
- `server/src/utils/uploadImage.js`
- `server/.env.example`
- `server/src/app.js`
- `server/src/routes/materials/index.js` (route đang dùng
  `uploadImage.single("image")` — không được đổi call signature)
- Migration `0012_media_assets.sql` từ Prompt 02 (nếu đã làm)

## Vì sao cần đổi + free tier dùng được gì
`uploadImage.js` hiện ghi file thẳng vào ổ đĩa cục bộ (`multer.diskStorage`
→ `server/uploads/`) — chính comment trong file đã cảnh báo: **Render Free
xoá sạch ổ đĩa mỗi lần restart**, nên ảnh material/testimonial/asset sẽ mất
sau mỗi lần server khởi động lại. Cloudinary là chỗ lưu ảnh ngoài, có gói
**miễn phí ổn định**: **25 credit/tháng** (1 credit = 1GB lưu trữ HOẶC 1GB
băng thông HOẶC 1.000 lượt xử lý ảnh), tối đa 3 user — đủ dùng cho quy mô
project này (vài trăm ảnh material/testimonial/dự án), không phát sinh phí
bất ngờ (chỉ cảnh báo + tạm khoá khi vượt quota, không tự trừ tiền).

## Yêu cầu
1. Thêm `"cloudinary"` + `"multer-storage-cloudinary"` vào
   `server/package.json`.
2. Viết lại `uploadImage.js` theo đúng pattern nhánh-theo-biến-môi-trường
   đã dùng trong `config/database.js` (nếu có `DATABASE_URL` → Postgres,
   không có → JSON file) — áp dụng y hệt logic đó cho ảnh:
   - Có đủ `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` +
     `CLOUDINARY_API_SECRET` → dùng `CloudinaryStorage` (từ
     `multer-storage-cloudinary`), thư mục Cloudinary `pidecor/`.
   - Thiếu 1 trong 3 → fallback về `multer.diskStorage` cục bộ như hiện
     tại (giữ nguyên, không xoá), log rõ ràng giống style
     `"[database.js] Using Postgres via DATABASE_URL."`.
   - **Giữ nguyên chữ ký `uploadImage.single("image")`** — mọi route hiện
     có/mới (materials, studio assets, testimonials) dùng lại y hệt, không
     sửa gì ở route.
3. Sửa `publicUrlFor(req, file)`: khi dùng Cloudinary, `req.file.path`
   chính là `secure_url` — trả thẳng giá trị đó thay vì build URL local
   bằng `req.protocol`/`req.get("host")`.
4. Sau mỗi upload thành công, insert 1 dòng vào bảng `media_assets` (Prompt
   02) với `entity_type`, `url`, `provider: 'cloudinary'`, `public_id:
   req.file.filename` (Cloudinary trả `public_id` qua field này khi dùng
   `multer-storage-cloudinary`), `width`/`height`/`format`/`bytes` nếu có
   sẵn trong response Cloudinary.
5. Cập nhật `server/.env.example`: bỏ comment 3 dòng
   `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` đã có sẵn (hiện đang bị
   comment `#`), thêm hướng dẫn ngắn cách lấy 3 giá trị này từ Cloudinary
   Dashboard (miễn phí, không cần thẻ tín dụng).
6. **KHÔNG xoá** dòng `app.use("/uploads", express.static(...))` trong
   `app.js` ngay — giữ làm fallback cho tới khi xác nhận Cloudinary chạy ổn
   định qua kiểm thử thủ công (đây là bước 22 sẽ soát lại).

## Tiêu chí nghiệm thu
- Set đủ 3 biến Cloudinary trong `.env` → `POST /api/materials` kèm ảnh
  trả về `image_url` là 1 URL `res.cloudinary.com/...`, không phải
  `localhost:4000/uploads/...`.
- Không set biến Cloudinary nào → server vẫn chạy bình thường, upload vẫn
  hoạt động qua disk storage local như trước (không breaking change cho
  dev chưa muốn setup Cloudinary).
- `SELECT * FROM media_assets` sau khi upload thấy đúng 1 dòng mới tương
  ứng.
