# Sổ tay Vận hành & Xử lý Sự cố (RUNBOOK.md)

Tài liệu hướng dẫn quy trình triển khai (deploy), khôi phục (rollback), sao lưu/phục hồi dữ liệu (backup/restore), xoay vòng khóa bảo mật và xử lý các sự cố thường gặp cho hệ thống Pi Decor.

---

## 1. Quy trình Triển khai (Deployment Procedure)

Để đảm bảo không xảy ra gián đoạn hoặc lỗi truy vấn schema trong lúc khởi động dịch vụ, việc triển khai **bắt buộc tuân theo thứ tự**:

```
[1. Sao lưu DB] ──> [2. Chạy Migration] ──> [3. Khởi động API Server] ──> [4. Build & Deploy Client]
```

### Bước 1: Chạy Migration Cơ sở dữ liệu

Toàn bộ schema được đồng nhất tại `0001_baseline.sql` (gộp 30 migrations ban đầu). Quá trình migration được thiết kế an toàn, có thể chạy lặp lại (`idempotent`).

- **Cơ sở dữ liệu mới (Fresh DB)**:
  ```bash
  cd apps/api
  DATABASE_URL_DIRECT="<direct_connection_string>" npm run migrate
  ```
- **Cơ sở dữ liệu đang chạy đã có schema cũ (Adopt Baseline)**:
  Nếu cơ sở dữ liệu production/staging đã áp dụng các migration `0001`–`0029` trước đây, chạy lệnh adopt để cập nhật bảng `schema_migrations` sang `0001_baseline.sql` mà không chạy lại câu lệnh DDL:
  ```bash
  cd apps/api
  DATABASE_URL_DIRECT="<direct_connection_string>" npm run migrate:adopt-baseline
  ```

> [!IMPORTANT]
>
> - Luôn sử dụng chuỗi kết nối trực tiếp `DATABASE_URL_DIRECT` (không qua PgBouncer pooler) khi chạy `migrate` hoặc `migrate:adopt-baseline`.
> - Bắt buộc sao lưu dữ liệu trước khi chạy `migrate:adopt-baseline`.
> - Chỉ khởi động phiên bản backend mới sau khi toàn bộ migration đã áp dụng thành công.

### Bước 2: Khởi động API Server (Render / Docker)

- Nếu dùng Docker:
  ```bash
  docker build -t pidecor-api:latest -f apps/api/Dockerfile apps/api
  docker run -d --name pidecor-api -p 4000:4000 --env-file apps/api/.env pidecor-api:latest
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

1. Chỉnh sửa mật khẩu mong muốn vào biến `ADMIN_PASSWORD` trong file `apps/api/.env`.
2. Chạy lệnh seed kèm cờ `--reset-password`:
   ```bash
   cd apps/api
   npm run seed -- --reset-password
   ```
3. Script sẽ tự động băm mật khẩu mới bằng `bcryptjs` (với 10 salt rounds) và cập nhật trực tiếp vào bản ghi tài khoản `ADMIN_EMAIL` trong bảng `admins`.

---

## 6. Xử lý Sự cố Thường gặp (Troubleshooting)

### a. Lỗi Vi phạm Chính sách CORS (`CORS policy violation` - HTTP 403)

- **Triệu chứng**: Trình duyệt báo lỗi `Access to fetch at ... has been blocked by CORS policy`.
- **Nguyên nhân**: Domain của Client không nằm trong danh sách trắng `CORS_ORIGIN` của Server.
- **Cách xử lý**:
  1. Kiểm tra biến `CORS_ORIGIN` tại `apps/api/.env` (hoặc dashboard Render).
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
  3. Chạy `npm run cleanup-tokens` trong `apps/api` để dọn dẹp các token rác.

### c. Lỗi Tải lên Ảnh (Upload Failure)

- **Triệu chứng**: API trả về lỗi HTTP 400 hoặc 500 khi lưu dự án/vật liệu kèm ảnh.
- **Nguyên nhân**:
  1. Dung lượng ảnh vượt quá giới hạn Multer (tối đa 10MB/file).
  2. Định dạng tệp không phải ảnh được phép (chỉ chấp nhận JPG, PNG, WEBP, GIF, SVG).
  3. Thiếu biến môi trường Cloudinary trên môi trường production (hệ thống Render có ổ đĩa tạm thời, nếu thiếu Cloudinary ảnh sẽ mất khi restart server).
- **Cách xử lý**:
  1. Nén ảnh xuống dưới 10MB trước khi tải lên.
  2. Kiểm tra đủ các biến môi trường: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER_PREFIX`.

---

## 7. Vận hành Neon Postgres & Cloudinary

### a. Phân biệt Chuỗi kết nối Neon: Pooled vs Direct

Neon Postgres cung cấp 2 chuỗi kết nối riêng biệt cho từng mục đích sử dụng:

| Loại kết nối           | Biến môi trường       | Dạng Hostname       | Mục đích & Phạm vi sử dụng                                                                                                                                                     |
| :--------------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pooled (PgBouncer)** | `DATABASE_URL`        | `ep-xxxx-pooler...` | Dành riêng cho **API Runtime** (Express pg Pool). Chạy ở Transaction Pooling mode, tối ưu tài nguyên kết nối cho compute serverless. `DB_POOL_MAX` đặt mặc định 5.             |
| **Direct Connection**  | `DATABASE_URL_DIRECT` | `ep-xxxx...`        | Dành cho **Migrations** (`npm run migrate`), **Seed** (`npm run seed`), **Scripts quản trị** (`cleanup-tokens`, `purge-leads`, `media:audit`), và lệnh `pg_dump`/`pg_restore`. |

> [!WARNING]
> Tuyệt đối không chạy lệnh `npm run migrate` qua chuỗi Pooled vì PgBouncer transaction mode không hỗ trợ một số lệnh quản lý khóa/DDL phức tạp.

### b. Cấu hình SSL An toàn (`DB_SSL` và `DB_SSL_CA`)

Neon bắt buộc mã hóa SSL cho toàn bộ kết nối từ bên ngoài:

- Mặc định, hệ thống tự động bật chế độ `DB_SSL=verify-full` (xác thực toàn diện chứng chỉ máy chủ nhằm chống tấn công Man-in-the-Middle) cho mọi hostname ngoài `localhost`/`postgres`.
- Nếu container chạy trên Alpine Linux thiếu CA Root ISRG Root X1 của Let's Encrypt, tải chứng chỉ CA và truyền vào biến:
  ```env
  DB_SSL=verify-full
  DB_SSL_CA=/etc/ssl/certs/isrgrootx1.pem
  ```
  Biến `DB_SSL_CA` chấp nhận cả đường dẫn file cục bộ hoặc chuỗi chứng chỉ PEM trực tiếp.

### c. Xử lý Neon Compute Scale-to-Zero & Thiết lập Uptime Monitor

Neon tự động tạm dừng compute (scale-to-zero) khi không có truy vấn trong một khoảng thời gian:

1. **Khởi động server**: Hệ thống tích hợp cơ chế `startup retry` tự động thử lại tối đa 3 lần (giãn cách 2 giây) khi kết nối ban đầu để chờ compute Neon thức dậy mà không làm sập container.
2. **Uptime Monitor**:
   - Các dịch vụ giám sát bên ngoài (UptimeRobot, BetterStack, StatusCake) **CHỈ ĐƯỢC PING `/api/health`** (Liveness check, trả về HTTP 200 mà không query DB).
   - **TUYỆT ĐỐI KHÔNG PING `/api/health/ready`** theo chu kỳ ngắn (1-5 phút) vì câu lệnh `SELECT 1` sẽ liên tục đánh thức compute của Neon, làm mất tính năng tiết kiệm chi phí/quota tự động.
   - Endpoint `/api/health/ready` (Readiness check) chỉ dùng cho Kubernetes / Render readiness probe hoặc kiểm tra trước khi chuyển luồng traffic.

### d. Quy ước Tiền tố Thư mục Cloudinary (`CLOUDINARY_FOLDER_PREFIX`)

Để tránh ghi đè hoặc xung đột dữ liệu ảnh giữa các môi trường, hệ thống quy định tiền tố thư mục lưu trữ Cloudinary:

- **Development**: `pidecor/dev` (tự động áp dụng khi `NODE_ENV !== "production"`).
- **Staging / Testing**: `pidecor/staging`.
- **Production**: `pidecor/prod` (bắt buộc khai báo trong biến `CLOUDINARY_FOLDER_PREFIX` trên Render).

### e. Quy trình Kiểm tra & Thanh lọc Media Định kỳ (`media:audit`)

Chạy script kiểm tra đồng bộ giữa tài nguyên lưu trên Cloudinary và dữ liệu trong Postgres:

```bash
# 1. Chạy kiểm tra và xuất báo cáo (Dry-run, không xóa ảnh)
cd apps/api
npm run media:audit

# 2. Xóa an toàn các ảnh mồ côi (chỉ xóa ảnh đã tạo quá 7 ngày để tránh ảnh đang upload)
npm run media:audit -- --delete-orphans --confirm
```

Báo cáo được ghi tự động vào file `media-audit-report.json` và hoàn toàn che giấu thông tin khóa bí mật (API Key/Secret).

---

## 8. Quản lý Thời hạn Lưu trữ & Thanh lọc Dữ liệu Khách hàng (`purge-leads`)

Hệ thống tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân thông qua chính sách lưu trữ có thời hạn đối với dữ liệu liên hệ (leads):

- **Biến môi trường**: `RETENTION_DAYS` (mặc định 180 ngày tại `apps/api/.env`, `VITE_RETENTION_DAYS` tại `apps/web/.env`).
- **Script thanh lọc**: `apps/api/scripts/purge-leads.js` (sử dụng kết nối trực tiếp `DATABASE_URL_DIRECT`).

```bash
# 1. Xem trước danh sách leads quá hạn (Dry-run an toàn, không xóa dữ liệu)
cd apps/api
npm run purge-leads

# 2. Tùy chỉnh số ngày lọc nếu cần
npm run purge-leads -- --older-than-days=90

# 3. Thực thi xóa vĩnh viễn (yêu cầu cờ --confirm)
npm run purge-leads -- --confirm
```

---

## 9. Quy trình Go-Live & Cổng Kiểm tra Sẵn sàng (`launch:check`)

Trước khi triển khai lên môi trường Production chính thức, bắt buộc hoàn thành các bước thiết lập biến môi trường và chạy cổng kiểm tra sẵn sàng:

### Bước 1: Điền đầy đủ biến môi trường Production

1. **Backend (`apps/api/.env`)**:
   - `NODE_ENV=production`
   - `JWT_SECRET`: Khóa bí mật tối thiểu 32 ký tự.
   - `DATABASE_URL`: Chuỗi kết nối Neon Pooled (PgBouncer).
   - `DATABASE_URL_DIRECT`: Chuỗi kết nối Neon Direct.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_FOLDER_PREFIX=pidecor/prod`
   - `RETENTION_DAYS=180`
   - `CORS_ORIGIN=https://pidecor.vn,https://www.pidecor.vn`

2. **Frontend (`apps/web/.env`)**:
   - `VITE_API_URL=https://api.pidecor.vn/api` (tuyệt đối không trỏ về localhost)
   - `VITE_BUSINESS_NAME`: Tên doanh nghiệp chính thức (VD: Pi Decor)
   - `VITE_BUSINESS_TELEPHONE`: Hotline chính thức (VD: +84 789 241 260)
   - `VITE_BUSINESS_EMAIL`: Email liên hệ chính thức (VD: contact@pidecor.vn)
   - `VITE_BUSINESS_STREET_ADDRESS`: Địa chỉ đường phố chính thức
   - `VITE_BUSINESS_LOCALITY`: Phường/Xã/Quận
   - `VITE_BUSINESS_REGION`: Tỉnh/Thành phố
   - `VITE_BUSINESS_COUNTRY=VN`
   - `VITE_BUSINESS_OPENING_HOURS`: Giờ làm việc (VD: Mo-Su 08:00-20:00)
   - `VITE_BUSINESS_DATA_PROTECTION_EMAIL`: Email tiếp nhận quyền dữ liệu cá nhân
   - `VITE_RETENTION_DAYS=180`
   - `VITE_PRIVACY_POLICY_REVIEWED=true`: Bật true sau khi bộ phận pháp lý đã rà soát chính sách bảo mật (xóa bỏ banner bản nháp trên web).

### Bước 2: Build bản phân phối tĩnh

```bash
npm run build:web
```

### Bước 3: Chạy cổng kiểm tra mức độ sẵn sàng triển khai (Launch Gate)

```bash
# Kiểm tra nghiêm ngặt (Strict Gate) - bắt buộc vượt qua (Exit Code 0) trước khi deploy
npm run launch:check -- --strict
```

> [!IMPORTANT]
> Lệnh `launch:check --strict` sẽ kiểm tra toàn diện:
>
> 1. Toàn bộ biến `VITE_BUSINESS_*` bắt buộc đã được khai báo.
> 2. Thư mục build `apps/web/dist` sạch, không còn bất kỳ chuỗi `[TODO` hoặc `[chưa cấu hình]`.
> 3. `VITE_PRIVACY_POLICY_REVIEWED=true`.
> 4. Tệp `LICENSE` không còn placeholder `<TÊN CHỦ SỞ HỮU>`.
> 5. `VITE_API_URL` trỏ về domain chính thức, không trỏ về `localhost` hay `127.0.0.1`.
> 6. Script không bao giờ in các giá trị bí mật ra màn hình log.
