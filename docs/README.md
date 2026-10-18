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

## 2. Đặc tả Tính năng Công khai (`docs/features/public/`)

Chi tiết đặc tả kỹ thuật, luồng người dùng và API của 10 phân hệ công khai:

- **[home-and-brand.md](features/public/home-and-brand.md)**: Trang chủ, khối Hero giới thiệu và hệ thống điều hướng toàn trang.
- **[services-showcase.md](features/public/services-showcase.md)**: Danh mục các gói dịch vụ trang trí và xem chi tiết dịch vụ.
- **[lookbook-projects.md](features/public/lookbook-projects.md)**: Bộ sưu tập dự án thực tế, bộ lọc phân khúc giá (Standard/Premium) và xem album ảnh.
- **[materials-palette.md](features/public/materials-palette.md)**: Bảng tra cứu vật liệu thi công, bảng màu và chất liệu vải.
- **[testimonials-public.md](features/public/testimonials-public.md)**: Xem cảm nhận khách hàng đã duyệt và gửi đánh giá trải nghiệm dịch vụ mới.
- **[lead-form.md](features/public/lead-form.md)**: Biểu mẫu thu thập lead, xác thực SĐT di động Việt Nam, cam kết bảo vệ dữ liệu và đính kèm snapshot.
- **[studio-customer.md](features/public/studio-customer.md)**: Xưởng thiết kế trực quan Studio cho khách hàng, tùy biến rèm, chữ và xuất ảnh snapshot.
- **[venue-map.md](features/public/venue-map.md)**: Bản đồ tương tác Leaflet hiển thị các địa điểm sự kiện và danh sách dự án liên kết.
- **[privacy-and-consent.md](features/public/privacy-and-consent.md)**: Chính sách bảo vệ dữ liệu cá nhân theo NĐ 13/2023/NĐ-CP và cơ chế thanh lọc dữ liệu.
- **[seo-and-metadata.md](features/public/seo-and-metadata.md)**: Cấu hình SEO, Open Graph, Twitter Cards, robots.txt, sitemap và Schema LocalBusiness.

---

## 3. Đặc tả Tính năng Quản trị (`docs/features/admin/`)

Chi tiết đặc tả kỹ thuật, ma trận phân quyền và luồng vận hành của 12 phân hệ quản trị:

- **[admin-auth.md](features/admin/admin-auth.md)**: Xác thực quản trị viên, Access Token, Refresh Token Rotation, Reuse Detection, Logout và AdminGuard.
- **[admin-dashboard.md](features/admin/admin-dashboard.md)**: Bảng điều khiển trung tâm, tổng hợp các chỉ số leads, dịch vụ, vật liệu, địa điểm, dự án.
- **[leads-crm.md](features/admin/leads-crm.md)**: Quản lý Leads CRM, tìm kiếm trigram, đổi trạng thái, xem snapshot và Activity Timeline.
- **[quotations.md](features/admin/quotations.md)**: Khởi tạo báo giá, đánh số nguyên tử `BG-YYYY-XXXX` qua `quotation_counters`, tính chiết khấu và xuất PDF.
- **[projects-admin.md](features/admin/projects-admin.md)**: Quản trị dự án Lookbook, tải ảnh Cloudinary, phân loại giá Standard/Premium, bản nháp và xuất bản.
- **[venues-admin.md](features/admin/venues-admin.md)**: Quản trị địa điểm sự kiện, cấu hình tọa độ GPS, liên kết dự án và xử lý SET NULL khóa ngoại.
- **[materials-admin.md](features/admin/materials-admin.md)**: Quản lý danh mục vật tư mẫu, cập nhật mã màu HEX và cơ chế xóa lạc quan (Optimistic Deletion).
- **[services-admin.md](features/admin/services-admin.md)**: Quản lý danh mục dịch vụ, kéo thả thay đổi thứ tự `order`, biên tập hạng mục JSONB và upload ảnh.
- **[testimonials-moderation.md](features/admin/testimonials-moderation.md)**: Kiểm duyệt đánh giá khách hàng (pending, approved, rejected) và cô lập thông tin nội bộ.
- **[studio-admin.md](features/admin/studio-admin.md)**: Quản trị bản mẫu phông nền Studio, lọc mã độc qua DOMPurify, định nghĩa slot/rule và xuất bản nguyên tử.
- **[admin-settings-users.md](features/admin/admin-settings-users.md)**: Đổi thông tin cá nhân, cập nhật mật khẩu, cấp mới và thu hồi tài khoản admin theo quyền Owner.
- **[media-and-uploads.md](features/admin/media-and-uploads.md)**: Quản lý tải lên hình ảnh qua Cloudinary, MIME allowlist, giới hạn 10MB và dọn dẹp ảnh mồ côi.

---

## 4. Ma trận Truy vết Yêu cầu & Kiểm thử

- **[TRACEABILITY.md](features/TRACEABILITY.md)**: Bảng đối chiếu chéo hai chiều giữa User Stories (US-001 đến US-014), tài liệu đặc tả, API endpoints và các bài kiểm thử tự động (Unit / API / E2E).

## 5. Dữ Liệu & Cơ Sở Dữ Liệu (`docs/data/`)

Tài liệu thiết kế lược đồ, từ điển dữ liệu và sơ đồ thực thể quan hệ cơ sở dữ liệu:

- **[DATA_DICTIONARY.md](data/DATA_DICTIONARY.md)**: Từ điển dữ liệu chi tiết 15 bảng trong PostgreSQL (kiểu dữ liệu, khóa chính, khóa ngoại, chỉ mục, trigger, mô tả cột).
- **[ERD.md](data/ERD.md)**: Sơ đồ thực thể quan hệ (Mermaid `erDiagram`) phân tách theo các nhóm CRM, Nội dung, Studio và Xác thực.
- **[DATA_NOTES.md](data/DATA_NOTES.md)**: Ghi chú quy ước kiểu dữ liệu (UUID, timestamptz), cấu trúc chi tiết các trường JSONB, chính sách dữ liệu cá nhân (PII) và danh mục các trường nghi thừa.

---

## 6. Kiến trúc & Đặc tả Kỹ thuật

Tài liệu thiết kế kiến trúc phần mềm và giao tiếp dữ liệu:

- **[C4.md](architecture/C4.md)**: Mô hình kiến trúc C4 đa tầng (Context, Containers, Components) trực quan hóa bằng Mermaid.
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Tổng quan kiến trúc Monorepo (`apps/web`, `apps/api`, `packages/shared`), mô hình dữ liệu và các luồng tương tác chính.
- **[API.md](API.md)**: Danh mục đặc tả các REST API endpoints, tham số truy vấn, body schemas và cấu trúc phản hồi.
- **[TYPES.md](TYPES.md)**: Quy ước chia sẻ kiểu dữ liệu TypeScript, cấu trúc Zod Schemas và Centralized Mappers.
- **[DATA_SOURCES.md](DATA_SOURCES.md)**: Quản lý nguồn dữ liệu, kết nối PostgreSQL (Neon Pooled/Direct) và lưu trữ media Cloudinary.
- **[BASELINE.md](BASELINE.md)**: Báo cáo hiện trạng kỹ thuật và lịch sử chuẩn hóa hệ thống.
- **[Hồ sơ Quyết định Kiến trúc (docs/adr/)](adr/0000-template.md)**: Danh mục 13 bản ghi quyết định kiến trúc (ADRs) dựng từ lịch sử Git và mã nguồn thực tế.

---

## 7. Đảm Bảo Chất Lượng & Kiểm Thử (`docs/quality/`)

Tài liệu chiến lược kiểm thử, danh sách ca kiểm thử và quy trình nghiệm thu chất lượng phần mềm:

- **[TEST_PLAN.md](quality/TEST_PLAN.md)**: Kế hoạch kiểm thử toàn diện đa tầng (Unit, API, E2E, Visual Baseline), môi trường, dữ liệu test và tiêu chí vào/ra.
- **[TEST_CASES.md](quality/TEST_CASES.md)**: Danh mục ca kiểm thử chức năng (TC-001 đến TC-016) đối chiếu với các User Story.
- **[UAT_CHECKLIST.md](quality/UAT_CHECKLIST.md)**: Bảng kiểm tra nghiệm thu bằng ngôn ngữ đời thường dành cho Chủ doanh nghiệp trực tiếp nghiệm thu.
- **[REGRESSION_CHECKLIST.md](quality/REGRESSION_CHECKLIST.md)**: Danh sách kiểm tra hồi quy nhanh (Smoke Test 10–15 phút) trước mỗi lần phát hành.
- **[TESTING.md](TESTING.md)**: Báo cáo độ bao phủ mã nguồn (Coverage thực tế qua Vitest v8) và cấu hình kịch bản Playwright E2E.

---

## 8. An Toàn Thông Tin & Ứng Phó Sự Cố (`docs/security/`)

Tài liệu phân tích mô hình đe dọa, kiểm soát an ninh ứng dụng và quy trình ứng phó khẩn cấp:

- **[THREAT_MODEL.md](security/THREAT_MODEL.md)**: Mô hình đe dọa theo phương pháp STRIDE rút gọn, phân tích tài sản, ranh giới tin cậy và biện pháp phòng vệ.
- **[OWASP_CHECKLIST.md](security/OWASP_CHECKLIST.md)**: Bảng đối chiếu 10 danh mục rủi ro OWASP Top 10:2021 kèm bằng chứng mã nguồn và kiểm thử.
- **[INCIDENT_RESPONSE.md](security/INCIDENT_RESPONSE.md)**: Quy trình 6 bước xử lý sự cố an ninh, xoay vòng khóa bí mật, thu hồi phiên và mẫu báo cáo Post-Mortem.
- **[SECURITY_NOTES.md](SECURITY_NOTES.md)**: Ghi chú bảo mật, cấu hình xác thực JWT Refresh Rotation và tuân thủ Nghị định 13/2023/NĐ-CP.

## 9. Vận Hành Hệ Thống (`docs/ops/` & Cẩm Nang)

Cẩm nang vận hành hệ thống thực tế, kiến trúc môi trường, giám sát và sao lưu dữ liệu:

- **[BACKUP_RESTORE.md](ops/BACKUP_RESTORE.md)**: Quy trình sao lưu, phục hồi dữ liệu, cơ chế chống ghi đè production, kết quả kiểm tra diễn tập tự động và RPO/RTO.
- **[ENVIRONMENTS.md](ops/ENVIRONMENTS.md)**: Ma trận môi trường dev / staging / production, quy trình thăng cấp mã nguồn và khôi phục sự cố.
- **[MONITORING.md](ops/MONITORING.md)**: Danh mục chỉ số giám sát vận hành, cấu hình cảnh báo và định dạng audit log bảo mật.
- **[RUNBOOK.md](RUNBOOK.md)**: Cẩm nang vận hành production, hướng dẫn triển khai, sao lưu cơ sở dữ liệu và khắc phục sự cố.
- **[DEVLOG.md](DEVLOG.md)**: Khung nhật ký phát triển theo ngày trích xuất tự động từ lịch sử commit Git.
- **[FOLLOWUPS.md](FOLLOWUPS.md)**: Danh mục các vấn đề kỹ thuật đang theo dõi và kế hoạch xử lý tương lai.

---

## 10. Quyền Riêng Tư & Bảo Vệ Dữ Liệu (`docs/privacy/`)

Tuân thủ pháp lý theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân:

- **[PROCESSING_REGISTER.md](privacy/PROCESSING_REGISTER.md)**: Sổ ghi nhận hoạt động xử lý dữ liệu cá nhân (ROPA), bên thứ ba xử lý dữ liệu và quy trình thực thi quyền chủ thể dữ liệu (xuất/xóa dữ liệu cá nhân).

---

## 11. Thiết Kế Giao Diện & Design Tokens

Quy chuẩn hệ thống nhận diện và styling:

- **[TOKENS.md](TOKENS.md)**: Bảng tra cứu Design Tokens (màu sắc, typography, khoảng cách, bo góc) qua biến CSS native.
- **[TOKENS_TODO.md](TOKENS_TODO.md)**: Nhật ký xử lý và lộ trình loại bỏ triệt để mã màu cứng trong SCSS.

---

## 12. Pháp Lý, Bản Quyền & Quản Trị Kho Lưu Trữ

Các tiêu chuẩn pháp lý và quy tắc làm việc trên GitHub:

- **[LICENSES.md](LICENSES.md)**: Thống kê bản quyền 238 thư viện production, chính sách cô lập LGPL và quy tắc cấm GPL/AGPL.
- **[ASSETS.md](ASSETS.md)**: Bảng kiểm kê tài sản số phi mã nguồn (hình ảnh, phông chữ tự host, biểu tượng vector) và tình trạng pháp lý.
- **[GITHUB_SETTINGS.md](GITHUB_SETTINGS.md)**: Hướng dẫn thiết lập bảo vệ nhánh `main`, bảo mật repository và ký commit số.
- **[RELEASING.md](RELEASING.md)**: Quy trình đánh số phiên bản SemVer 2.0.0, gắn thẻ Git và phát hành tự động qua GitHub Actions.

---

## 13. Tài Liệu Tiêu Chuẩn ở Cấp Gốc (Root Documentation)

- **[README.md](../README.md)**: Trang giới thiệu dự án tổng thể và hướng dẫn cài đặt môi trường phát triển cục bộ.
- **[AGENTS.md](../AGENTS.md)**: Quy tắc làm việc bắt buộc cho AI Agents và nhà phát triển (quy tắc 1 commit, 300 dòng, `npm run verify`).
- **[CONTRIBUTING.md](../CONTRIBUTING.md)**: Hướng dẫn đóng góp mã nguồn, quy chuẩn nhánh và commit.
- **[SECURITY.md](../SECURITY.md)**: Chính sách bảo mật và hướng dẫn báo cáo lỗ hổng an toàn thông tin riêng tư.
- **[CHANGELOG.md](../CHANGELOG.md)**: Nhật ký ghi nhận các thay đổi qua từng phiên bản theo Keep a Changelog.
- **[LICENSE](../LICENSE)**: Giấy phép sở hữu độc quyền của dự án Pi Decor.
- **[NOTICE](../NOTICE)**: Thông báo bản quyền bắt buộc của các thư viện phần mềm bên thứ ba.
