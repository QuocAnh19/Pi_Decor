# PROMPT 17 — Frontend: Testimonials section + admin

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
Prompt 10 (backend testimonials API), Prompt 13 (types/api), Prompt 19
(Cloudinary upload — cần endpoint upload ảnh thật thay vì base64).

## File cần đính kèm
- `client/src/components/sections/Testimonials.tsx` (đọc kỹ toàn bộ — sẽ
  sửa nhiều nhưng GIỮ NGUYÊN toàn bộ UI/CSS class hiện có, chỉ đổi phần lấy
  & gửi dữ liệu)
- `client/src/lib/content.ts` (phần `testimonials` cũ)

## ⚠️ Thay đổi hành vi cần báo trước cho người dùng cuối
Hiện tại khi khách gửi đánh giá, nó xuất hiện **ngay lập tức** với badge
"Mới gửi" (`isNew: true`) — vì trước giờ chỉ lưu `localStorage`, không ai
kiểm duyệt. Sau khi nối API thật (Prompt 10: mọi testimonial mới đều
`status: 'pending'`), đánh giá **sẽ không hiện công khai ngay** — phải chờ
admin duyệt. Đây là thay đổi UX có chủ đích, không phải bug — nhớ update
message thành công trong modal thành ví dụ: *"Cảm ơn bạn! Đánh giá đang
được xem xét và sẽ hiển thị sau khi duyệt."* thay vì thêm thẳng vào `reviews`
state.

## Yêu cầu
1. Xoá toàn bộ logic `localStorage` (`STORAGE_KEY`, `useEffect` lưu/đọc
   `localStorage`) và `INITIAL_TESTIMONIALS` hard-code — thay bằng
   `useEffect` gọi `api.getTestimonials()` khi mount (chỉ trả về
   `approved`, theo Prompt 10).
2. Sửa `handlePhotoUpload`: thay vì `FileReader.readAsDataURL()` (base64
   vào state), upload file thật lên server (endpoint từ Prompt 19) và lưu
   URL trả về vào `selectedPhotos` — vẫn giữ UI dropzone/preview/giới hạn 3
   ảnh y hệt hiện tại, chỉ đổi nguồn dữ liệu ảnh từ base64 sang URL thật.
3. Sửa `handleSubmitReview`: gọi `api.submitTestimonial({...}, )` (public,
   không cần token) thay vì `setReviews(prev => [newReview, ...prev])` —
   sau khi gọi thành công, đóng modal và hiện toast/thông báo chờ duyệt
   (dùng component `Toast.tsx` đã có sẵn trong `client/src/components/ui/`
   nếu phù hợp) thay vì thêm ngay vào grid.
4. Bỏ badge "Mới gửi" (`t.isNew`) vì giờ mọi testimonial hiển thị đều đã
   qua duyệt, không còn khái niệm "vừa gửi xong đã public".
5. Tạo `client/src/pages/admin/AdminTestimonialsPage.tsx` +
   `.module.scss` mới: bảng danh sách (tương tự cấu trúc dữ liệu của
   `LeadTable.tsx` nhưng cột khác — author, quote rút gọn, rating, status,
   ngày gửi), filter theo status (Chờ duyệt / Đã duyệt / Từ chối), nút
   Duyệt/Từ chối/Xoá mỗi dòng. Thêm route `/admin/testimonials` + nav link
   trong `AdminLayout.tsx`.

## Tiêu chí nghiệm thu
- Trang chủ chỉ hiển thị testimonial `approved`.
- Gửi đánh giá mới → KHÔNG xuất hiện ngay trên trang chủ, xuất hiện trong
  `/admin/testimonials` với status "Chờ duyệt".
- Admin bấm Duyệt → refresh trang chủ thấy testimonial đó xuất hiện.
- Không còn bất kỳ chuỗi `"data:image"` nào trong code của
  `Testimonials.tsx`.
