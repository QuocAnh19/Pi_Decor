# Quản lý giấy phép phần mềm & Thư viện bên thứ ba (LICENSES.md)

Tài liệu này ghi nhận hiện trạng và quy chuẩn kiểm soát giấy phép bản quyền của toàn bộ các thư viện bên thứ ba (dependencies) sử dụng trong dự án Pi Decor.

---

## 1. Tóm tắt giấy phép phụ thuộc Production

Toàn bộ monorepo hiện có **238 thư viện phụ thuộc production** (bao gồm direct và transitive dependencies của `apps/web` và `apps/api`). 100% các thư viện đều tuân thủ các giấy phép nguồn mở cấp phép lỏng (permissive) hoặc tương thích thương mại, hoàn toàn không có giấy phép copyleft mạnh (GPL/AGPL).

| Loại giấy phép              | Số lượng gói | Tỷ lệ    | Đánh giá pháp lý                                                  |
| :-------------------------- | :----------- | :------- | :---------------------------------------------------------------- |
| **MIT**                     | 200          | 84.0%    | Tự do sử dụng thương mại, yêu cầu giữ nguyên thông báo bản quyền  |
| **ISC**                     | 12           | 5.0%     | Tương đương MIT / BSD-2-Clause đơn giản                           |
| **Apache-2.0**              | 5            | 2.1%     | Cho phép thương mại, yêu cầu giữ NOTICE và cấp phép sáng chế      |
| **BSD-3-Clause**            | 5            | 2.1%     | Tự do sử dụng thương mại, không dùng tên tác giả để quảng bá      |
| **BSD-2-Clause**            | 4            | 1.7%     | Tự do sử dụng thương mại, yêu cầu giữ nguyên thông báo bản quyền  |
| **OFL-1.1**                 | 3            | 1.3%     | SIL Open Font License, cho phép nhúng và phân phối kèm web        |
| **BlueOak-1.0.0**           | 3            | 1.3%     | Giấy phép permissive hiện đại, tương thích hoàn toàn MIT          |
| **MIT-0**                   | 2            | 0.8%     | Không yêu cầu ghi công (attribution-free)                         |
| **(MPL-2.0 OR Apache-2.0)** | 1            | 0.4%     | `dompurify` — áp dụng tùy chọn Apache-2.0                         |
| **CC0-1.0**                 | 1            | 0.4%     | Miền công cộng (Public Domain Dedication)                         |
| **FSL-1.1-Apache-2.0**      | 1            | 0.4%     | Sentry Functional Source License, chuyển đổi Apache-2.0 sau 2 năm |
| **0BSD**                    | 1            | 0.4%     | Giấy phép BSD 0 điều khoản (tự do sử dụng)                        |
| **Tổng cộng**               | **238**      | **100%** | **Đạt chuẩn 100% không vi phạm bản quyền**                        |

---

## 2. Bảng thư viện trực tiếp (Direct Dependencies)

### 2.1. Web Client (`apps/web`)

| Thư viện                         | Phiên bản  | Giấy phép        | Mục đích sử dụng                            |
| :------------------------------- | :--------- | :--------------- | :------------------------------------------ |
| `@dnd-kit/core`                  | `^6.3.1`   | MIT              | Kéo thả sắp xếp danh mục / thứ tự dịch vụ   |
| `@fontsource/be-vietnam-pro`     | `^5.3.0`   | OFL-1.1          | Font chữ hiển thị tiếng Việt tự host        |
| `@fontsource/cormorant-garamond` | `^5.3.0`   | OFL-1.1          | Font chữ tiêu đề thanh lịch tự host         |
| `@fontsource/fraunces`           | `^5.3.0`   | OFL-1.1          | Font chữ tiêu đề phong cách tự host         |
| `@heroicons/react`               | `^2.2.0`   | MIT              | Bộ biểu tượng giao diện người dùng          |
| `@pidecor/shared`                | `*`        | UNLICENSED       | Workspace nội bộ chứa Zod schemas và DTO    |
| `@sentry/react`                  | `^11.8.0`  | MIT / Apache-2.0 | Giám sát lỗi và hiệu năng phía frontend     |
| `@tanstack/react-query`          | `^5.104.3` | MIT              | Quản lý state bất đồng bộ và cache API      |
| `html-to-image`                  | `^1.11.13` | MIT              | Xuất snapshot thiết kế Studio sang hình ảnh |
| `jspdf`                          | `^4.2.1`   | MIT              | Tạo và xuất file PDF báo giá cho khách hàng |
| `leaflet`                        | `^1.9.4`   | BSD-2-Clause     | Bản đồ tương tác hiển thị địa điểm sự kiện  |
| `react`                          | `^18.3.1`  | MIT              | Thư viện nền tảng giao diện người dùng      |
| `react-dom`                      | `^18.3.1`  | MIT              | Cầu nối DOM cho React                       |
| `react-helmet-async`             | `^3.0.0`   | Apache-2.0       | Quản lý thẻ meta SEO và Open Graph          |
| `react-router-dom`               | `^6.30.6`  | MIT              | Định tuyến SPA cho ứng dụng web             |

### 2.2. API Server (`apps/api`)

| Thư viện                    | Phiên bản      | Giấy phép        | Mục đích sử dụng                              |
| :-------------------------- | :------------- | :--------------- | :-------------------------------------------- |
| `@pidecor/shared`           | `*`            | UNLICENSED       | Workspace nội bộ dùng chung                   |
| `@sentry/node`              | `^11.8.0`      | MIT / Apache-2.0 | Giám sát sự cố và logging phía server         |
| `bcryptjs`                  | `^2.4.3`       | MIT              | Băm mật khẩu quản trị viên an toàn            |
| `cloudinary`                | `^2.5.0`       | MIT              | SDK lưu trữ và xử lý hình ảnh đám mây         |
| `cors`                      | `^2.8.5`       | MIT              | Cấu hình Cross-Origin Resource Sharing        |
| `dotenv`                    | `^16.4.5`      | BSD-2-Clause     | Nạp biến môi trường cục bộ                    |
| `express`                   | `^5.0.1`       | MIT              | Web framework xử lý REST API                  |
| `express-rate-limit`        | `^7.4.1`       | MIT              | Giới hạn tần suất gọi API chống lạm dụng      |
| `helmet`                    | `^8.0.0`       | MIT              | Thiết lập HTTP Security Headers               |
| `isomorphic-dompurify`      | `^3.19.0`      | Apache-2.0       | Làm sạch HTML/SVG chống tấn công XSS          |
| `jsonwebtoken`              | `^9.0.2`       | MIT              | Xác thực phiên đăng nhập qua JWT              |
| `multer`                    | `^1.4.5-lts.1` | MIT              | Xử lý upload tệp multipart/form-data          |
| `multer-storage-cloudinary` | `^4.0.0`       | MIT              | Storage engine tích hợp multer với Cloudinary |
| `pg`                        | `^8.13.1`      | MIT              | Client kết nối cơ sở dữ liệu PostgreSQL       |
| `pino`                      | `^10.4.0`      | MIT              | Structured logging hiệu năng cao dạng JSON    |
| `pino-http`                 | `^11.0.0`      | MIT              | Middleware ghi log truy cập HTTP              |
| `pino-pretty`               | `^13.2.0`      | MIT              | Định dạng log dễ đọc trong môi trường dev     |
| `zod`                       | `^3.23.8`      | MIT              | Schema validation dữ liệu đầu vào             |

---

## 3. Các gói có giấy phép đặc biệt & Biện pháp cô lập

### 3.1. Phụ thuộc LGPL (`@img/sharp-*`)

- **Tình trạng**: Thư viện `sharp` sử dụng các binary prebuild (`@img/sharp-win32-x64`, `@img/sharp-linux-x64`...) mang giấy phép `LGPL-3.0-or-later` hoặc `Apache-2.0 AND LGPL-3.0-or-later`.
- **Biện pháp cô lập an toàn**:
  - `sharp` **CHỈ** được khai báo tại `devDependencies` ở thư mục gốc (root monorepo).
  - Không nằm trong `dependencies` của bất kỳ workspace nào (`apps/web`, `apps/api`, `packages/shared`).
  - Chỉ phục vụ script tiện ích tối ưu hóa hình ảnh nội bộ trong quá trình phát triển và build.
  - Tuyệt đối không được đóng gói vào client bundle của `apps/web` hay container production của `apps/api`.
  - Được kiểm chứng tự động qua `npm run check:licenses` và Docker smoke test trên CI.

### 3.2. Cấp phép kép `(MPL-2.0 OR Apache-2.0)` (`dompurify`)

- `dompurify` cung cấp lựa chọn giữa Mozilla Public License 2.0 (MPL-2.0) và Apache License 2.0.
- Dự án Pi Decor chính thức lựa chọn áp dụng điều khoản theo **Apache License 2.0**, tuân thủ ghi nhận bản quyền đầy đủ tại tệp [NOTICE](../NOTICE).

---

## 4. Quy tắc nghiêm ngặt khi thêm Dependency mới

1. **Tuyệt đối CẤM các giấy phép Copyleft mạnh**:
   - Nghiêm cấm đưa bất kỳ thư viện nào có giấy phép **GPL** (GPL-2.0, GPL-3.0), **AGPL** (AGPL-3.0), SSPL, hoặc EUPL vào `dependencies` của monorepo.
   - Việc vi phạm sẽ buộc mã nguồn đóng của doanh nghiệp phải mở công khai, dẫn đến tổn thất pháp lý nghiêm trọng.

2. **Chỉ chấp nhận các giấy phép Permissive**:
   - Danh mục cho phép: **MIT**, **ISC**, **Apache-2.0**, **BSD-2-Clause**, **BSD-3-Clause**, **OFL-1.1** (đối với font), **CC0-1.0** / **Public Domain**.

3. **Quy trình kiểm tra bắt buộc trước khi commit/merge**:
   - Chạy lệnh kiểm tra giấy phép tự động:
     ```bash
     npm run check:licenses
     ```
   - Chạy tái tạo tệp thông báo bản quyền khi có thay đổi dependency:
     ```bash
     npm run licenses:generate
     ```
   - Script `check:licenses` đã được tích hợp trong quy trình CI (`.github/workflows/ci.yml`) và sẽ tự động đánh trượt nếu phát hiện bất kỳ gói GPL/AGPL nào.
