# Báo Cáo Sẵn Sàng Phát Hành (RELEASE_READINESS.md)

Tài liệu này ghi nhận kết quả kiểm tra toàn diện trước khi phát hành phiên bản chính thức **v1.0.0** của nền tảng Pi Decor, phân định rõ ràng giữa các tiêu chuẩn kỹ thuật đã đạt và danh sách các hạng mục bắt buộc dành riêng cho Chủ dự án.

---

## 1. Tổng Quan Trạng Thái Phát Hành

- **Mục tiêu phiên bản**: `v1.0.0` (Production Release).
- **Ngày đánh giá**: 2026-10-19.
- **Trạng thái kỹ thuật (Codebase & Pipelines)**: **100% SẴN SÀNG (READY)**.
- **Trạng thái nghiệp vụ & vận hành (Owner Gate)**: **CHỜ CHỦ DỰ ÁN HOÀN TẤT CẤU HÌNH THỰC TẾ**.

---

## 2. Bảng Tổng Hợp Kiểm Tra Kỹ Thuật

| Hạng mục kiểm tra              | Lệnh thực thi / Nguồn đối chiếu         | Trạng thái        | Bằng chứng thực tế                                                                                                                                                                                                        |
| :----------------------------- | :-------------------------------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Monorepo Verification**      | `npm run verify`                        | **ĐẠT**           | Toàn bộ các bước tuần tự vượt qua mã trạng thái `0`: `build:shared`, `tsc` (Web/API), `eslint`, `stylelint`, `knip` (dead code = 0), `test` (109 unit & integration tests), `build:web` thành công.                       |
| **End-to-End Testing**         | `npm run e2e` / `playwright test`       | **ĐẠT**           | 17 kịch bản E2E Playwright trên Desktop Chrome (`1280x800`) và Mobile Chrome (`390x844`) bao phủ luồng khách hàng gửi lead và quản trị viên CRM/Quotation; visual baselines đạt ngưỡng pixel diff.                        |
| **An ninh Dependencies**       | `npm run audit:prod`                    | **ĐẠT**           | `0` lỗ hổng mức HIGH hoặc CRITICAL (`--audit-level=high`). 2 cảnh báo moderate từ `react-router` upstream đã được cô lập an toàn trong SPA client-only.                                                                   |
| **Launch Readiness Gate**      | `npm run launch:check -- --strict`      | **CHỜ CHỦ DỰ ÁN** | 1 tiêu chí kỹ thuật đạt (build sạch không chuỗi TODO/chưa cấu hình); 4 tiêu chí nghiệp vụ giữ cổng thành công: chờ 9 biến `VITE_BUSINESS_*`, `VITE_PRIVACY_POLICY_REVIEWED`, placeholder `LICENSE`, và domain production. |
| **Đồng bộ Từ điển Dữ liệu**    | `npm run docs:db`                       | **ĐẠT**           | Sinh tự động và khớp 100% 15 bảng trong [docs/data/DATA_DICTIONARY.md](data/DATA_DICTIONARY.md) và sơ đồ Mermaid [docs/data/ERD.md](data/ERD.md) từ schema PostgreSQL thực tế.                                            |
| **Toàn vẹn Tài liệu**          | `npm run verify:docs`                   | **ĐẠT**           | Kiểm tra thành công 228 liên kết markdown và 386 đường dẫn mã nguồn qua 81 tệp tài liệu, 0 liên kết chết (broken link = 0).                                                                                               |
| **Diễn tập Phục hồi Thảm họa** | `bash scripts/backup-restore-drill.sh`  | **ĐẠT (PASS)**    | Dựng DB tạm -> migrate + seed -> `db-backup.sh` -> `db-restore.sh` -> so khớp 100% số lượng dòng trên 9 bảng cốt lõi theo [docs/ops/BACKUP_RESTORE.md](ops/BACKUP_RESTORE.md).                                            |
| **Trạng thái CI Workflows**    | GitHub Actions (`ci.yml`, `codeql.yml`) | **ĐẠT**           | 100% jobs trên nhánh `main` vượt qua (CI build, test, lint, codeql scan, license check, documentation verification).                                                                                                      |
| **Cảnh báo Styling**           | `stylelint "src/**/*.scss"`             | **ĐẠT**           | 0 lỗi cú pháp, 0 cảnh báo vi phạm Design Tokens hoặc quy chuẩn SCSS.                                                                                                                                                      |
| **Kích thước tệp tin**         | Kiểm tra luật `max-lines` (≤ 300 dòng)  | **ĐẠT**           | 100% tệp mã nguồn và tài liệu mới tuân thủ nghiêm ngặt giới hạn dưới 300 dòng theo [AGENTS.md](../AGENTS.md).                                                                                                             |
| **Rà soát TODO trong mã**      | `grep -rn "TODO" apps/ packages/`       | **ĐẠT**           | 0 TODO sót lại trong mã nguồn sản xuất (`apps/web/src`, `apps/api/src`, `packages/shared/src`).                                                                                                                           |

---

## 3. Danh Sách Việc Dành Riêng Cho Chủ Dự Án (Owner Gate)

Các hạng mục dưới đây thuộc thẩm quyền pháp lý và kinh doanh của Chủ sở hữu dự án, không thể can thiệp tự động bằng mã nguồn:

### 3.1. Thay thế Placeholder Bản quyền

- **Tệp cần cập nhật**: [LICENSE](../LICENSE) và trường `"author"` trong [package.json](../package.json).
- **Hành động**: Thay thế chuỗi `<TÊN CHỦ SỞ HỮU>` bằng họ tên cá nhân hoặc tên pháp nhân doanh nghiệp sở hữu thương hiệu Pi Decor.

### 3.2. Điền Thông Tin Doanh Nghiệp Thực Tế

- **Tệp cấu hình**: `apps/web/.env` trên môi trường Production (hoặc cấu hình biến môi trường trên Vercel/Netlify/Hosting).
- **Danh sách 9 biến bắt buộc**:
  1. `VITE_BUSINESS_NAME`: Tên đăng ký kinh doanh chính thức của tiệm cưới.
  2. `VITE_BUSINESS_TELEPHONE`: Hotline tiếp nhận khách hàng (dạng số điện thoại Việt Nam chuẩn).
  3. `VITE_BUSINESS_EMAIL`: Hòm thư điện tử liên hệ chính thức.
  4. `VITE_BUSINESS_STREET_ADDRESS`: Địa chỉ số nhà, tên đường của showroom/văn phòng.
  5. `VITE_BUSINESS_LOCALITY`: Phường/Xã hoặc Quận/Huyện.
  6. `VITE_BUSINESS_REGION`: Tỉnh/Thành phố (ví dụ: `Hà Nội`, `TP. Hồ Chí Minh`).
  7. `VITE_BUSINESS_COUNTRY`: Mã quốc gia (`VN`).
  8. `VITE_BUSINESS_OPENING_HOURS`: Khung giờ mở cửa đón khách (ví dụ: `Mo-Su 08:30-21:00`).
  9. `VITE_BUSINESS_DATA_PROTECTION_EMAIL`: Email chuyên trách tiếp nhận yêu cầu bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.

### 3.3. Rà Soát Pháp Lý & Bật Cờ Bảo Vệ Dữ Liệu

- **Hành động**:
  1. Chốt thời gian lưu trữ dữ liệu khách hàng (RPO/Retention) và rà soát các điều khoản trong [docs/privacy/PROCESSING_REGISTER.md](privacy/PROCESSING_REGISTER.md) cùng [docs/features/public/privacy-and-consent.md](features/public/privacy-and-consent.md) với chuyên gia tư vấn pháp lý.
  2. Sau khi chính sách bảo mật được phê chuẩn, thiết lập biến môi trường `VITE_PRIVACY_POLICY_REVIEWED=true`.

### 3.4. Cấu Hình Bảo Mật GitHub Repository

- **Hành động**: Thực hiện thiết lập theo đúng hướng dẫn tại [docs/GITHUB_SETTINGS.md](GITHUB_SETTINGS.md):
  - Bật Branch Protection Rules cho nhánh `main` (bắt buộc PR, Require status checks to pass, Require signed commits).
  - Cấu hình Secret Scanning và Dependabot Alerts.
  - Phân quyền cộng tác viên và thiết lập GitHub Environments (`production`, `staging`).

### 3.5. Điền & Quyết Định Các Mục `[CẦN XÁC NHẬN]`

- **Thống kê**: Có **52** vị trí ghi nhận `[CẦN XÁC NHẬN]` trong thư mục `docs/`.
- **Bảng phân bổ chi tiết theo tệp**:

| Đường dẫn tài liệu                                                                                                                                                               | Số lượng | Nội dung cần Chủ dự án quyết định                                                      |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------------------------------------------------------------------------------------- |
| [docs/ASSETS.md](ASSETS.md)                                                                                                                                                      |    8     | Tình trạng cấp phép bản quyền ảnh thực tế, phông chữ và logo thương hiệu.              |
| [docs/product/PRD.md](product/PRD.md)                                                                                                                                            |    7     | Chỉ số mục tiêu kinh doanh (Conversion rate, SLA phản hồi), ngân sách hạ tầng.         |
| [docs/privacy/PROCESSING_REGISTER.md](privacy/PROCESSING_REGISTER.md)                                                                                                            |    6     | Thời gian lưu trữ dữ liệu cá nhân (retention), thông tin DPO nội bộ.                   |
| [docs/data/DATA_DICTIONARY.md](data/DATA_DICTIONARY.md)                                                                                                                          |    5     | Xác nhận ý nghĩa nghiệp vụ của một số trường cấu hình phụ trợ.                         |
| [docs/data/DATA_NOTES.md](data/DATA_NOTES.md)                                                                                                                                    |    5     | Quyết định lộ trình dọn dẹp các trường dự phòng/nghi thừa.                             |
| [docs/CASE_STUDY.md](CASE_STUDY.md)                                                                                                                                              |    3     | Tên doanh nghiệp thực tế, số liệu tăng trưởng và trích dẫn đại diện khách hàng.        |
| [docs/ops/BACKUP_RESTORE.md](ops/BACKUP_RESTORE.md)                                                                                                                              |    3     | Cam kết mục tiêu RPO (≤ 24h), RTO (≤ 30 phút), gói dịch vụ lưu trữ Neon/S3.            |
| [docs/ops/MONITORING.md](ops/MONITORING.md)                                                                                                                                      |    3     | Kênh nhận thông báo sự cố (Discord/Telegram webhook) và ngưỡng cảnh báo dung lượng.    |
| [docs/ops/ENVIRONMENTS.md](ops/ENVIRONMENTS.md)                                                                                                                                  |    2     | Tên miền chính thức của môi trường staging và production.                              |
| [docs/features/public/materials-palette.md](features/public/materials-palette.md)                                                                                                |    2     | Quy tắc gán nhãn vật liệu nổi bật và đơn giá tham khảo công khai.                      |
| [docs/adr/](adr/0000-template.md) (13 tệp ADRs + template)                                                                                                                       |    14    | Xác nhận trạng thái áp dụng chính thức của các quyết định kiến trúc cốt lõi.           |
| Các tệp đặc tả khác (`admin-dashboard.md`, `home-and-brand.md`, `lookbook-projects.md`, `privacy-and-consent.md`, `seo-and-metadata.md`, `TEST_PLAN.md`, `INCIDENT_RESPONSE.md`) |    7     | Thông số kỹ thuật chi tiết: tọa độ mặc định showroom, email nhận sự cố, tỉ lệ nén ảnh. |

### 3.6. Trực Tiếp Nghiệm Thu Nghiệp Vụ (Ký UAT)

- **Tài liệu**: [docs/quality/UAT_CHECKLIST.md](quality/UAT_CHECKLIST.md).
- **Hành động**: Chủ doanh nghiệp tự thao tác qua 12 kịch bản nghiệm thu thực tế trên trình duyệt (không cần am hiểu kỹ thuật), đánh dấu Đạt/Không đạt và ký tên nghiệm thu vào biên bản bàn giao cuối tệp.

### 3.7. Lựa Chọn Hạ Tầng & Cấu Hình Biến Môi Trường Production

- **Hạ tầng khuyến nghị**: Neon PostgreSQL (hoặc Supabase) + Vercel/Cloudflare Pages (Web) + Render/Fly.io/Koyeb (API) theo [docs/ops/ENVIRONMENTS.md](ops/ENVIRONMENTS.md).
- **Cấu hình API**: Đặt `VITE_API_URL` trỏ tới domain API Production (bắt buộc HTTPS, không dùng `localhost`).

---

## 4. Hướng Dẫn Gắn Thẻ Phát Hành (Release Tagging)

> [!CAUTION]
> **Quy tắc an toàn**: AI Agent **tuyệt đối không tự ý gắn tag release**. Thao tác này chỉ được thực hiện bởi Chủ dự án sau khi hoàn tất toàn bộ danh mục tại Mục 3.

Khi các điều kiện trên đã được thỏa mãn và lệnh `node scripts/check-launch-readiness.mjs --strict` báo 5/5 tiêu chí ĐẠT, Chủ dự án thực hiện các lệnh sau trên máy trạm để phát hành phiên bản `v1.0.0`:

```bash
# 1. Kiểm tra lại trạng thái git sạch sẽ
git status

# 2. Tạo Git Tag có ký số bảo mật (GPG signed)
git tag -s v1.0.0 -m "Pi Decor 1.0.0"

# 3. Đẩy thẻ phát hành lên GitHub để kích hoạt Release Workflow tự động
git push origin v1.0.0
```
