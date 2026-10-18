# Ma Trận Môi Trường & Quy Trình Triển Khai (ENVIRONMENTS.md)

Tài liệu định nghĩa các môi trường vận hành của nền tảng Pi Decor, cấu hình biến môi trường, phân quyền truy cập, quy trình thăng cấp phiên bản (promotion) và kịch bản hoàn tác (rollback).

---

## 1. Bảng So Sánh Các Môi Trường Vận Hành

| Đặc tính            | Phát triển Cục bộ (Development)                     | Kiểm thử Tiền phát hành (Staging)                 | Sản xuất Thực tế (Production)                |
| :------------------ | :-------------------------------------------------- | :------------------------------------------------ | :------------------------------------------- |
| **Mục đích**        | Lập trình tính năng, viết test                      | Kiểm thử tích hợp, UAT doanh nghiệp               | Phục vụ khách hàng thực tế                   |
| **URL Web**         | `http://localhost:5173`                             | `https://staging.pidecor.vn` `[CẦN XÁC NHẬN]`     | `https://pidecor.vn` `[CẦN XÁC NHẬN]`        |
| **URL API**         | `http://localhost:5001`                             | `https://api-staging.pidecor.vn` `[CẦN XÁC NHẬN]` | `https://api.pidecor.vn` `[CẦN XÁC NHẬN]`    |
| **Nguồn Database**  | Docker Compose PostgreSQL 16 cục bộ (`pidecor_dev`) | Neon PostgreSQL Branch (`staging-branch`)         | Neon PostgreSQL Main Branch (`production`)   |
| **Chế độ SSL DB**   | `DB_SSL=disable`                                    | `DB_SSL=require` (hoặc `verify-full`)             | `DB_SSL=verify-full`                         |
| **Kho ảnh Media**   | Cloudinary thư mục `pidecor/dev`                    | Cloudinary thư mục `pidecor/staging`              | Cloudinary thư mục `pidecor/prod`            |
| **Giám sát Sentry** | Tắt (`SENTRY_DSN=""`)                               | Bật môi trường `staging`                          | Bật môi trường `production`                  |
| **Quyền truy cập**  | Toàn bộ lập trình viên                              | Đội ngũ kỹ thuật & Chủ doanh nghiệp kiểm thử      | Chỉ tài khoản Quản trị viên/Owner được duyệt |

---

## 2. Điểm Khác Biệt Biến Môi Trường Giữa Các Môi Trường

| Biến môi trường       | Development                         | Staging                                      | Production                                       |
| :-------------------- | :---------------------------------- | :------------------------------------------- | :----------------------------------------------- |
| `NODE_ENV`            | `development`                       | `staging`                                    | `production`                                     |
| `DATABASE_URL`        | Chuỗi kết nối Docker local          | Neon pooled connection string                | Neon pooled connection string                    |
| `DATABASE_URL_DIRECT` | Giống DATABASE_URL                  | Neon direct connection string (chạy migrate) | Neon direct connection string (chạy migrate)     |
| `JWT_SECRET`          | Chuỗi thử nghiệm tối thiểu 32 ký tự | Khóa bí mật staging độc lập                  | Khóa bí mật sản xuất tối thiểu 64 hex ngẫu nhiên |
| `CORS_ORIGIN`         | `http://localhost:5173`             | `https://staging.pidecor.vn`                 | `https://pidecor.vn`                             |
| `RATE_LIMIT_ENABLED`  | `false` hoặc nới lỏng               | `true`                                       | `true` (chặn nghiêm ngặt)                        |

---

## 3. Quy Trình Thăng Cấp Phiên Bản (Promotion Pipeline)

```
  [1. Nhánh feature] ──> PR ──> [2. Merge vào main]
                                      │
  [4. Deploy Production] <── UAT ──< [3. Auto Deploy Staging]
```

1. **Bước 1 — Phát triển & Kiểm thử Cục bộ**:
   - Lập trình viên hoàn thành tính năng trên nhánh riêng, vượt qua `npm run verify` cục bộ.
2. **Bước 2 — Merge vào nhánh `main`**:
   - Tạo Pull Request vào `main`. Toàn bộ CI workflow (Lint, Tests, E2E, Security Scans, Docker Build) bắt buộc đạt 100% xanh lá.
3. **Bước 3 — Triển khai lên Staging**:
   - Hệ thống CI/CD tự động deploy bản build mới lên môi trường Staging.
   - Chạy kiểm tra tự động `npm run e2e` trên môi trường Staging.
   - Chủ doanh nghiệp thực hiện nghiệm thu UAT theo [UAT_CHECKLIST.md](../quality/UAT_CHECKLIST.md).
4. **Bước 4 — Phát hành lên Production**:
   - Chủ dự án gắn thẻ phiên bản Git SemVer có ký (`git tag -s vX.Y.Z`).
   - GitHub Actions chạy workflow `release.yml`: Build Docker image có gắn nhãn tag, kích hoạt deploy lên Production.
   - Kỹ sư trực thực hiện kiểm tra nhanh theo [REGRESSION_CHECKLIST.md](../quality/REGRESSION_CHECKLIST.md).

---

## 4. Quy Trình Hoàn Tác Khi Gặp Sự Cố (Rollback Procedure)

Khi phát hiện lỗi nghiêm trọng trên Production sau khi phát hành:

1. **Rollback Ứng Dụng (Container/Frontend)**:
   - Chuyển hướng lưu lượng truy cập (Traffic) về Docker image tag trước đó qua bảng điều khiển máy chủ (thời gian thực hiện: < 3 phút).
2. **Rollback Cơ Sở Dữ Liệu (Database Migration)**:
   - Nếu bản cập nhật có chứa migration làm thay đổi cấu trúc bảng, sử dụng bản sao lưu tệp dump hoặc kích hoạt Neon Point-in-time branch theo hướng dẫn tại [BACKUP_RESTORE.md](BACKUP_RESTORE.md).
3. **Kích hoạt Quy trình Ứng phó**:
   - Lập tài liệu Post-Mortem sự cố theo [INCIDENT_RESPONSE.md](../security/INCIDENT_RESPONSE.md).
