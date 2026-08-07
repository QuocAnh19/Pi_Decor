# Pi Decor — Bảo mật (Security)

Checklist cụ thể cho phần Postgres + API, đi kèm các thay đổi đã áp dụng
trong lần cập nhật này. Đọc cùng với `database/README.md` (giải thích cấu
trúc migrations) — file này chỉ tập trung vào phần bảo mật.

## 1. Kết nối Postgres — 2 vai trò, KHÔNG dùng chung 1 tài khoản

| Vai trò | Dùng để | Quyền | Connection string dùng ở đâu |
|---|---|---|---|
| **Owner** (do Neon/Supabase tạo sẵn khi tạo project) | Chạy `npm run migrate` — tạo bảng, index, trigger, view | Toàn quyền (CREATE/ALTER/DROP) | Chỉ trên máy bạn hoặc trong bước CI/CD chạy migration — KHÔNG đưa vào biến môi trường của server đang chạy |
| **`pidecor_app`** (tạo thủ công bằng `database/security/create_app_role.sql`) | API Express chạy hằng ngày | Chỉ SELECT/INSERT/UPDATE/DELETE trên đúng 7 bảng của app | `DATABASE_URL` trên Render/nơi deploy server |

Lý do tách riêng: nếu API server có lỗ hổng (ví dụ một endpoint bị inject
được), kẻ tấn công chiếm được kết nối DB cũng chỉ làm được đúng những gì
`pidecor_app` được phép — không thể `DROP TABLE`, không tạo được bảng lạ,
không đọc được bảng `schema_migrations`. Đây là nguyên tắc **least
privilege**, áp dụng đúng cho một dự án thật thay vì demo.

Cách tạo role này: xem hướng dẫn từng bước ngay trong file
`database/security/create_app_role.sql`. File đó **cố tình không nằm** ở
`database/migrations/` vì nó chứa chỗ để điền mật khẩu — không được để
`migrate.js` tự động chạy (và tự động commit) một file có mật khẩu.

## 2. Kết nối luôn mã hoá (TLS)

- `src/config/database.pg.js` bật `ssl: { rejectUnauthorized: false }` cho
  mọi connection string không phải `localhost` — bắt buộc với Neon/Supabase
  (họ chỉ chấp nhận kết nối TLS).
- Luôn dùng `?sslmode=require` trong connection string Neon (xem ví dụ
  trong `.env.example`).
- Không tắt SSL để "cho dễ debug" kể cả ở staging — dữ liệu `leads` chứa số
  điện thoại, email khách hàng thật.

## 3. Giới hạn kết nối & truy vấn (chống DoS / treo pool)

`database.pg.js` đặt:
- `max: 10` — số connection tối đa trong pool (Neon Free/Supabase Free vốn
  giới hạn số connection đồng thời của cả project, để dư cho migration/CI).
- `idleTimeoutMillis` — tự đóng connection rảnh, tránh giữ connection chết.
- `statement_timeout` — bất kỳ câu query nào chạy quá lâu (query bị lỗi
  logic, hoặc dữ liệu lớn bất thường) sẽ tự bị Postgres huỷ thay vì treo cả
  pool cho các request khác.

## 4. Input & SQL injection

- **Không route nào tự viết chuỗi SQL.** Mọi INSERT/UPDATE đều đi qua
  allowlist cột (`TABLES` trong `database.pg.js`) — tên cột không bao giờ
  đến từ `req.body`, chỉ **giá trị** mới được tham số hoá (`$1, $2, ...`).
  Tên bảng cũng luôn là chuỗi hardcode trong route, không phải input.
- `assertKnownTable()` chặn cứng nếu code lỡ gọi một tên bảng không có
  trong allowlist — fail loudly thay vì âm thầm chạy sai.
- CHECK constraint ở tầng DB (`leads.status`, `venues.type`) là lớp bảo vệ
  thứ hai — kể cả nếu validate ở tầng API có bug, DB vẫn từ chối giá trị
  rác.

## 5. Rate limiting — chống spam form & brute-force login

Đã thêm `express-rate-limit` vào `app.js`:

| Route | Giới hạn | Vì sao |
|---|---|---|
| `POST /api/auth/login` | 10 lần / 15 phút / IP | Chặn dò mật khẩu admin |
| `/api/leads/*` | 20 lần / 15 phút / IP | Form liên hệ public — không giới hạn thì 1 script có thể spam hàng nghìn lead giả vào DB |

Điều chỉnh số này trong `app.js` nếu traffic thật cao hơn giả định — hiện
đặt an toàn cho quy mô 1 landing page tư vấn.

## 6. HTTP security headers

Đã thêm `helmet` — tự động bật các header như `X-Content-Type-Options`,
`X-Frame-Options`, loại bỏ header lộ thông tin server (`X-Powered-By`),
v.v. Cấu hình mặc định của helmet là an toàn cho một REST API JSON thuần
(không phục vụ HTML render phía server nên không cần tinh chỉnh CSP thêm ở
bước này).

## 7. CORS — vẫn theo allowlist, không mở `*`

`CORS_ORIGIN` trong `.env` phải là danh sách domain thật (ví dụ
`https://pidecor.vercel.app`), không dùng `*`. Route `POST /api/leads` ghi
dữ liệu khách hàng thật — không cho phép domain lạ gọi thẳng vào.

## 8. Secrets — không commit, không log

- `.env` đã có trong `.gitignore` (kiểm tra lại nếu bạn đổi tên file).
- `JWT_SECRET`: sinh bằng
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
  khác nhau giữa local/staging/production, đặt qua biến môi trường của nơi
  deploy (Render dashboard), không hardcode.
- `ADMIN_PASSWORD` trong `.env.example` chỉ là placeholder cho lần seed đầu
  tiên — đổi mật khẩu admin thật ngay sau khi seed xong (chưa có API đổi
  mật khẩu ở bản này; cách nhanh nhất hiện tại là seed lại với
  `ADMIN_PASSWORD` mới rồi xoá dòng seed admin trong `seed.js` để tránh ghi
  đè lần sau, hoặc update trực tiếp `password_hash` bằng bcrypt).
- Không bao giờ `console.log(req.body)` ở route `/api/auth/login` hay
  `/api/leads` — sẽ vô tình ghi mật khẩu/SĐT khách vào log server.

## 9. Mật khẩu admin

- Hash bằng `bcryptjs`, cost factor 10 (mặc định). Với 1 tài khoản admin
  duy nhất, có thể tăng lên 12 trong `seed.js`
  (`bcrypt.hash(password, 12)`) để tăng chi phí brute-force mà không ảnh
  hưởng UX (chỉ chậm hơn vài chục ms lúc login).
- JWT hết hạn sau 8h (`JWT_EXPIRES_IN`) — admin phải đăng nhập lại, giảm
  thiệt hại nếu token bị lộ (ví dụ máy admin bị truy cập trái phép).

## 10. Upload ảnh

`utils/uploadImage.js` đã giới hạn: chỉ nhận file `image/*`, tối đa 5MB.
Trước khi deploy thật, đổi sang Cloudinary (đã ghi chú sẵn trong file đó)
— không chỉ vì ổ đĩa Render Free bị xoá khi restart, mà còn vì lưu file
upload trực tiếp lên ổ đĩa server tăng bề mặt tấn công (path traversal,
file thực thi giả dạng ảnh) so với việc để một dịch vụ chuyên biệt xử lý.

## 11. Sao lưu (backup)

Cả Neon và Supabase (kể cả gói Free) đều giữ point-in-time recovery trong
vài ngày gần nhất theo mặc định — kiểm tra lại giới hạn cụ thể trong trang
pricing hiện tại của từng bên trước khi phụ thuộc vào nó cho dữ liệu thật.
Không cần tự dựng cơ chế backup riêng ở giai đoạn này.

## Checklist nhanh trước khi deploy production

- [ ] `DATABASE_URL` trên server dùng role `pidecor_app`, KHÔNG dùng role
      owner.
- [ ] `JWT_SECRET` là chuỗi random thật, khác giữa các môi trường.
- [ ] `ADMIN_PASSWORD` đã đổi khỏi giá trị mặc định trong `.env.example`.
- [ ] `CORS_ORIGIN` chỉ liệt kê domain thật, không có `*`.
- [ ] `sslmode=require` (hoặc tương đương) có trong connection string.
- [ ] Ảnh upload đã chuyển sang Cloudinary, không còn ghi vào ổ đĩa local.
- [ ] `.env` không nằm trong git history (`git log --all -- .env`).
