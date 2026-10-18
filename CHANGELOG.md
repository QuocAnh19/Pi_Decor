# Nhật ký Thay đổi (CHANGELOG.md)

Tất cả những thay đổi đáng chú ý của dự án Pi Decor sẽ được ghi nhận trong tệp này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
và dự án này tuân thủ chuẩn [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Quy trình phát hành tự động qua GitHub Actions (`.github/workflows/release.yml`) khi push tag phiên bản `v*.*.*`.
- Hướng dẫn cấu hình repository và bảo vệ nhánh trong [docs/GITHUB_SETTINGS.md](docs/GITHUB_SETTINGS.md).
- Quy chuẩn phát hành và gắn thẻ phiên bản trong [docs/RELEASING.md](docs/RELEASING.md).

---

## [1.0.0-rc.1] - 2026-10-18

### Added

- Tệp giấy phép độc quyền [LICENSE](LICENSE) kèm điều khoản hạn chế quyền sao chép và phân phối trái phép.
- Tệp thông báo bản quyền bên thứ ba [NOTICE](NOTICE) tự động sinh cho 238 thư viện phụ thuộc production qua script `scripts/generate-notice.mjs`.
- Báo cáo kiểm kê giấy phép phần mềm chi tiết tại [docs/LICENSES.md](docs/LICENSES.md) và tài sản phi mã nguồn tại [docs/ASSETS.md](docs/ASSETS.md).
- Xuất Software Bill of Materials (SBOM) định dạng CycloneDX JSON qua script `npm run sbom`.
- Biểu mẫu đóng góp GitHub: `.github/PULL_REQUEST_TEMPLATE.md` và `.github/ISSUE_TEMPLATE/` (`bug_report.yml`, `feature_request.yml`, `config.yml`).
- Cơ chế phân công phụ trách mã nguồn [`.github/CODEOWNERS`](.github/CODEOWNERS) và chính sách bảo mật [SECURITY.md](SECURITY.md).

### Changed

- Cấu hình đồng bộ `"private": true`, `"license": "UNLICENSED"` trên toàn bộ các tệp `package.json` trong monorepo.

---

## [0.9.0] - 2026-10-17

### Added

- Trang quản trị danh mục dịch vụ `/admin/services` hỗ trợ sắp xếp thứ tự hiển thị và quản lý trực quan.
- Tab "Hoạt động" (Timeline) trong ngăn chi tiết khách hàng tiềm năng `LeadDetailDrawer` ghi nhận lịch sử tương tác và ghi chú tư vấn.
- Kịch bản kiểm tra sẵn sàng phát hành `npm run launch:check` đồng bộ với biến môi trường doanh nghiệp `VITE_BUSINESS_*`.
- Bộ kiểm thử tự động toàn diện: báo cáo độ phủ mã nguồn (coverage) với `@vitest/coverage-v8`, kiểm thử logic Studio và Playwright E2E visual regression baseline.

### Changed

- Chuẩn hóa toàn bộ hệ thống màu sắc SCSS sang biến CSS Design Tokens (chính sách Zero-Hex trong SCSS).
- Phân rã tất cả các tệp mã nguồn và stylesheet vượt quá 300 dòng để tuân thủ quy tắc kiến trúc `AGENTS.md`.
- Hợp nhất và tinh gọn cơ sở dữ liệu: squash 29 file migration thành một baseline duy nhất, loại bỏ các bảng cũ không còn sử dụng.

### Security

- Đóng gói container Docker bảo mật cho API: thực thi dưới quyền user phi root `node`, quét lỗ hổng Trivy và kiểm tra khởi động smoke test.
- Tích hợp kiểm tra bảo mật tự động trên CI: quét rò rỉ secret qua Gitleaks và phân tích mã tĩnh CodeQL.

---

## [0.5.0] - 2026-10-16

### Added

- Chuyển đổi toàn bộ dự án sang kiến trúc Monorepo npm workspaces (`apps/web`, `apps/api`, `packages/shared`).
- Thư viện nội bộ `packages/shared` cung cấp nguồn chân lý duy nhất cho Zod schemas và DTO types.
- Tích hợp giám sát lỗi và hiệu năng với Sentry trên cả client và server.
- Thêm biểu mẫu thu thập sự đồng ý xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP và trang dự thảo chính sách bảo mật.

### Changed

- Tái cấu trúc backend sang mô hình module hóa (`src/modules/*`: auth, leads, projects, services, venues, materials, studio, testimonials, quotations).
- Phân tách hơn 20 components giao diện lớn để giảm kích thước tệp và tăng tính tái sử dụng.

---

## [0.2.0] - 2026-10-12

### Added

- Giai đoạn gia cố và chuẩn hóa hệ thống (Hardening & Restructuring — P00 đến P24).
- Cơ chế xác thực an toàn: xoay vòng Refresh Token (Rotation), phát hiện tái sử dụng token và hỗ trợ đăng xuất trên mọi thiết bị.
- Thuật toán làm sạch SVG bằng DOMPurify ngăn chặn tấn công Stored XSS khi khách hàng lưu mẫu thiết kế.
- Cơ chế đánh số báo giá tự động nguyên tử theo định dạng `BG-YYYY-XXXX` chống trùng lặp.

### Changed

- Chuyển đổi toàn bộ truy vấn dữ liệu sang PostgreSQL thuần có tham số hóa an toàn, loại bỏ cơ sở dữ liệu tạm bằng tệp JSON.
- Thay thế hoàn toàn dữ liệu tĩnh trên giao diện bằng dữ liệu động tải từ REST API.
- Di chuyển toàn bộ hook nạp dữ liệu phía client sang TanStack Query (`@tanstack/react-query`).

---

## [0.1.0] - 2026-08-07

### Added

- Bản phát hành nguyên mẫu đầu tiên của Pi Decor.
- Trang chủ giới thiệu dịch vụ trang trí tiệc cưới, sự kiện doanh nghiệp và tiệc thôi nôi / sinh nhật.
- Ứng dụng Studio đồ họa trực quan hỗ trợ khách hàng tùy biến rèm, màu sắc và phông nền sự kiện.
- Khu vực quản trị ban đầu cho các danh mục: dự án thực hiện, địa điểm tổ chức, vật liệu và danh sách khách hàng tiềm năng.
