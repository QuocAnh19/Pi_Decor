# Sổ tay Vận hành & Xử lý Sự cố (RUNBOOK.md)

Tài liệu hướng dẫn quy trình triển khai (deploy), khôi phục (rollback), sao lưu/phục hồi dữ liệu (backup/restore), xoay vòng khóa bảo mật và xử lý các sự cố thường gặp cho hệ thống Pi Decor.

---

## 1. Quy trình Triển khai (Deployment Procedure)

Để đảm bảo không xảy ra gián đoạn hoặc lỗi truy vấn schema trong lúc khởi động dịch vụ, việc triển khai **bắt buộc tuân theo thứ tự**:

```
[1. Sao lưu DB] ──> [2. Chạy Migration] ──> [3. Khởi động API Server] ──> [4. Build & Deploy Client]
```

### Bước 1: Chạy Migration Cơ sở dữ liệu

Migration được thiết kế an toàn, có thể chạy lặp lại (`idempotent`). Trước khi ứng dụng phiên bản code mới, chạy lệnh migration từ môi trường CI/CD hoặc máy quản trị:

```bash
cd server
DATABASE_URL="<production_database_url>" npm run migrate
```

> [!IMPORTANT]
> Chỉ khởi động phiên bản backend mới sau khi toàn bộ migration đã áp dụng thành công.

### Bước 2: Khởi động API Server (Render / Docker)

- Nếu dùng Docker:
  ```bash
  docker build -t pidecor-api:latest -f server/Dockerfile .
  docker run -d --name pidecor-api -p 4000:4000 --env-file server/.env pidecor-api:latest
  ```
- Nếu dùng Web Service (Render):
  - Kích hoạt bản build mới qua Git push hoặc webhook.
  - Kiểm tra healthcheck: `curl -I https://api.pidecor.vn/api/health` trả về HTTP `200 OK`.

### Bước 3: Deploy Client (Vercel / Netlify)

- Đảm bảo biến môi trường `VITE_API_URL` trỏ đúng về domain backend production.
- Client là Single Page Application tĩnh, tự động kích hoạt cache dài hạn cho thư mục `/assets/*` và `no-cache` cho `index.html`.

---

## 2. Quy trình Khôi phục Khi có Sự cố (Rollback)

Khi phiên bản mới gặp lỗi nghiêm trọng sau khi deploy:

1. **Khôi phục Client**: Revert commit hoặc kích hoạt bản deployment liền kề trước đó trên Vercel Dashboard (mất dưới 1 phút).
2. **Khôi phục Server**:
   - Redeploy bản build ổn định trước đó trên Render / container registry.
   - Các migration của dự án tuân thủ nguyên tắc mở rộng tương thích ngược (chỉ thêm bảng, thêm cột cho phép null hoặc có default), do đó backend cũ vẫn hoạt động bình thường trên schema mới mà không cần rollback cơ sở dữ liệu ngay lập tức.
3. **Rollback Dữ liệu (nếu có phá vỡ schema)**: Sử dụng bản sao lưu Postgres (xem mục 3).

---

## 3. Sao lưu & Phục hồi Cơ sở Dữ liệu (Postgres Backup & Restore)

### a. Sao lưu Định kỳ (Backup)

Sử dụng công cụ tiêu chuẩn `pg_dump` với định dạng nén tùy biến (`custom format` `-Fc`):

```bash
# Sao lưu toàn bộ schema và dữ liệu
pg_dump -Fc -v \
  -d "postgresql://user:password@host:port/database?sslmode=require" \
  -f "pidecor_backup_$(date +%Y%m%d_%H%M%S).dump"
```

Khuyến nghị thiết lập Cron job tự động chạy hàng ngày và đẩy file dump lên lưu trữ đám mây (AWS S3, Google Cloud Storage).

### b. Phục hồi Dữ liệu (Restore)

Sử dụng `pg_restore` để khôi phục dữ liệu từ bản dump:

```bash
# Phục hồi vào cơ sở dữ liệu trống hoặc ghi đè
pg_restore -v --clean --no-acl --no-owner \
  -d "postgresql://user:password@host:port/database?sslmode=require" \
  "pidecor_backup_YYYYMMDD_HHMMSS.dump"
```

> [!CAUTION]
> Cờ `--clean` sẽ xóa các bảng hiện tại trước khi tạo lại. Tuyệt đối kiểm tra kỹ connection string trước khi chạy.

---

## 4. Xoay vòng Khóa Bí mật JWT (`JWT_SECRET`)

Khóa `JWT_SECRET` dùng để ký số và xác thực các Access Token của quản trị viên.

### Các Bước Thực hiện:

1. Tạo một chuỗi bí mật ngẫu nhiên mới có độ an toàn cao (tối thiểu 32-64 ký tự):
   ```bash
   node -e "console.log(crypto.randomBytes(32).toString('hex'))"
   ```
2. Cập nhật biến môi trường `JWT_SECRET` trên dashboard của nhà cung cấp hosting (Render) hoặc file `.env` của server.
3. Khởi động lại (Restart) toàn bộ phiên bản backend server.

### Hệ quả Cần Lưu ý:

- **Tất cả các phiên làm việc hiện tại của Admin sẽ hết hiệu lực ngay lập tức**: Toàn bộ Access Token đã cấp trước đó sẽ không thể giải mã (`jwt.verify` trả về 401).
- Mọi tài khoản quản trị viên sẽ bị đăng xuất tự động và cần đăng nhập lại bằng email/mật khẩu.

---

## 5. Tạo Mới hoặc Đổi Mật khẩu Quản trị viên (Admin Password Reset)

Trong trường hợp quên mật khẩu quản trị viên hoặc cần đặt lại mật khẩu khẩn cấp:

1. Chỉnh sửa mật khẩu mong muốn vào biến `ADMIN_PASSWORD` trong file `server/.env`.
2. Chạy lệnh seed kèm cờ `--reset-password`:
   ```bash
   cd server
   npm run seed -- --reset-password
   ```
3. Script sẽ tự động băm mật khẩu mới bằng `bcryptjs` (với 10 salt rounds) và cập nhật trực tiếp vào bản ghi tài khoản `ADMIN_EMAIL` trong bảng `admins`.

---

## 6. Xử lý Sự cố Thường gặp (Troubleshooting)

### a. Lỗi Vi phạm Chính sách CORS (`CORS policy violation` - HTTP 403)

- **Triệu chứng**: Trình duyệt báo lỗi `Access to fetch at ... has been blocked by CORS policy`.
- **Nguyên nhân**: Domain của Client không nằm trong danh sách trắng `CORS_ORIGIN` của Server.
- **Cách xử lý**:
  1. Kiểm tra biến `CORS_ORIGIN` tại `server/.env` (hoặc dashboard Render).
  2. Bổ sung domain chính xác của client, ví dụ: `CORS_ORIGIN=https://pidecor.vn,https://www.pidecor.vn`.
  3. Nếu server nằm sau Reverse Proxy / Cloudflare, kiểm tra cấu hình `TRUST_PROXY=1` để Express đọc đúng header `X-Forwarded-*`.

### b. Vòng lặp Lỗi 401 Unauthorized Liên tục

- **Triệu chứng**: Giao diện Admin liên tục gửi request và bị đăng xuất hoặc giật lag.
- **Nguyên nhân**:
  1. Refresh token đã hết hạn (sau 7 ngày không hoạt động) hoặc bị thu hồi.
  2. Phát hiện tái sử dụng Refresh Token (Reuse Detection): Khi 2 request refresh gửi cùng lúc mà không có single-flight lock, hoặc token bị sao chép trái phép, server sẽ thu hồi toàn bộ dòng họ token để bảo vệ tài khoản.
  3. Lệch đồng hồ máy chủ (Server Clock Drift): Thời gian server bị sai lệch so với thời gian client.
- **Cách xử lý**:
  1. Mở Console trình duyệt, xóa `sessionStorage.removeItem("pidecor_admin_auth")`.
  2. Đăng nhập lại bằng tài khoản admin.
  3. Chạy `npm run cleanup-tokens` trên server để dọn dẹp các token rác.

### c. Lỗi Tải lên Ảnh (Upload Failure)

- **Triệu chứng**: API trả về lỗi HTTP 400 hoặc 500 khi lưu dự án/vật liệu kèm ảnh.
- **Nguyên nhân**:
  1. Dung lượng ảnh vượt quá giới hạn Multer (tối đa 5MB/file).
  2. Định dạng tệp không phải ảnh được phép (chỉ chấp nhận JPG, PNG, WEBP, SVG).
  3. Thiếu biến môi trường Cloudinary trên môi trường production (hệ thống Render có ổ đĩa tạm thời, nếu thiếu Cloudinary ảnh sẽ mất khi restart server).
- **Cách xử lý**:
  1. Nén ảnh xuống dưới 5MB trước khi tải lên.
  2. Kiểm tra đủ 3 biến môi trường: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
