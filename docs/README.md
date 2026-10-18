# Mục lục Tài liệu Dự án Pi Decor (docs/README.md)

Chào mừng bạn đến với kho tài liệu kỹ thuật và sản phẩm của dự án **Pi Decor**. Thư mục này tập trung toàn bộ các hướng dẫn kiến trúc, đặc tả nghiệp vụ, quy trình vận hành và tiêu chuẩn pháp lý của hệ thống.

---

## 1. Tài liệu Sản phẩm & Nghiệp vụ (`docs/product/`)

Các tài liệu định nghĩa yêu cầu, phạm vi và hành vi nghiệp vụ của hệ thống:

- **[PRD.md](product/PRD.md)**: Tài liệu Yêu cầu Sản phẩm (Product Requirements Document) — Mục tiêu, đối tượng người dùng, phạm vi chức năng, yêu cầu phi chức năng (NFRs) và các rủi ro.
- **[ROLES_PERMISSIONS.md](product/ROLES_PERMISSIONS.md)**: Ma trận phân quyền vai trò (Public, Admin, Owner) × Chức năng API, middleware xác thực và các ngưỡng Rate Limiting.
- **[USER_STORIES.md](product/USER_STORIES.md)**: Danh sách User Stories (US-001 đến US-014) kèm tiêu chí chấp nhận chuẩn hóa dạng `Given / When / Then`.
- **[GLOSSARY.md](product/GLOSSARY.md)**: Bảng thuật ngữ miền nghiệp vụ (Lead, Snapshot, Slot, Rule, Template, Venue, Lookbook, Quotation...) và vị trí xuất hiện trong code.

---

## 2. Kiến trúc & Đặc tả Kỹ thuật

Tài liệu thiết kế kiến trúc phần mềm và giao tiếp dữ liệu:

- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Tổng quan kiến trúc Monorepo (`apps/web`, `apps/api`, `packages/shared`), mô hình dữ liệu và các luồng tương tác chính.
- **[API.md](API.md)**: Danh mục đặc tả các REST API endpoints, tham số truy vấn, body schemas và cấu trúc phản hồi.
- **[TYPES.md](TYPES.md)**: Quy ước chia sẻ kiểu dữ liệu TypeScript, cấu trúc Zod Schemas và Centralized Mappers.
- **[DATA_SOURCES.md](DATA_SOURCES.md)**: Quản lý nguồn dữ liệu, kết nối PostgreSQL (Neon Pooled/Direct) và lưu trữ media Cloudinary.
- **[BASELINE.md](BASELINE.md)**: Báo cáo hiện trạng kỹ thuật và lịch sử chuẩn hóa hệ thống.

---

## 3. Vận hành, Kiểm thử & An toàn Thông tin

Hướng dẫn quy trình vận hành máy chủ, tự động hóa kiểm thử và bảo vệ dữ liệu:

- **[RUNBOOK.md](RUNBOOK.md)**: Cẩm nang vận hành production, hướng dẫn triển khai, sao lưu cơ sở dữ liệu và khắc phục sự cố.
- **[TESTING.md](TESTING.md)**: Chiến lược kiểm thử tự động, số liệu độ phủ mã nguồn (Coverage) và bộ kiểm thử giao diện Playwright E2E.
- **[SECURITY_NOTES.md](SECURITY_NOTES.md)**: Ghi chú bảo mật, cấu hình xác thực JWT Refresh Rotation và tuân thủ Nghị định 13/2023/NĐ-CP.
- **[FOLLOWUPS.md](FOLLOWUPS.md)**: Danh mục các vấn đề kỹ thuật đang theo dõi và kế hoạch xử lý tương lai.

---

## 4. Thiết kế Giao diện & Design Tokens

Quy chuẩn hệ thống nhận diện và styling:

- **[TOKENS.md](TOKENS.md)**: Bảng tra cứu Design Tokens (màu sắc, typography, khoảng cách, bo góc) qua biến CSS native.
- **[TOKENS_TODO.md](TOKENS_TODO.md)**: Nhật ký xử lý và lộ trình loại bỏ triệt để mã màu cứng trong SCSS.

---

## 5. Pháp lý, Bản quyền & Quản trị Kho lưu trữ

Các tiêu chuẩn pháp lý và quy tắc làm việc trên GitHub:

- **[LICENSES.md](LICENSES.md)**: Thống kê bản quyền 238 thư viện production, chính sách cô lập LGPL và quy tắc cấm GPL/AGPL.
- **[ASSETS.md](ASSETS.md)**: Bảng kiểm kê tài sản số phi mã nguồn (hình ảnh, phông chữ tự host, biểu tượng vector) và tình trạng pháp lý.
- **[GITHUB_SETTINGS.md](GITHUB_SETTINGS.md)**: Hướng dẫn thiết lập bảo vệ nhánh `main`, bảo mật repository và ký commit số.
- **[RELEASING.md](RELEASING.md)**: Quy trình đánh số phiên bản SemVer 2.0.0, gắn thẻ Git và phát hành tự động qua GitHub Actions.

---

## 6. Tài liệu Tiêu chuẩn ở Cấp gốc (Root Documentation)

- **[README.md](../README.md)**: Trang giới thiệu dự án tổng thể và hướng dẫn cài đặt môi trường phát triển cục bộ.
- **[AGENTS.md](../AGENTS.md)**: Quy tắc làm việc bắt buộc cho AI Agents và nhà phát triển (quy tắc 1 commit, 300 dòng, `npm run verify`).
- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: Hướng dẫn đóng góp mã nguồn, quy chuẩn nhánh và commit.
- **[SECURITY.md](../SECURITY.md)**: Chính sách bảo mật và hướng dẫn báo cáo lỗ hổng an toàn thông tin riêng tư.
- **[CHANGELOG.md](../CHANGELOG.md)**: Nhật ký ghi nhận các thay đổi qua từng phiên bản theo Keep a Changelog.
- **[LICENSE](../LICENSE)**: Giấy phép sở hữu độc quyền của dự án Pi Decor.
- **[NOTICE](../NOTICE)**: Thông báo bản quyền bắt buộc của các thư viện phần mềm bên thứ ba.
