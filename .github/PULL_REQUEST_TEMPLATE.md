## 🎯 Mục tiêu (Goal / Motivation)

<!-- Mô tả lý do hoặc bài toán nghiệp vụ cần giải quyết (kèm liên kết Issue nếu có, ví dụ: Closes #123). -->

## 📝 Thay đổi chính (Key Changes)

<!-- Liệt kê các thay đổi kỹ thuật chính theo dạng gạch đầu dòng. -->
- 
- 

## 🧪 Cách kiểm tra (Verification Steps)

<!-- Hướng dẫn chi tiết các bước để người review kiểm tra tính đúng đắn của thay đổi. -->
1. 
2. 

## 📸 Ảnh chụp / Video minh họa (UI Changes)

<!-- Bắt buộc nếu PR có thay đổi giao diện hoặc luồng người dùng (Trước / Sau). -->
- [ ] Không có thay đổi giao diện (Non-UI changes).
- <!-- Đính kèm ảnh chụp màn hình hoặc GIF minh họa ở đây -->

## 🗄️ Ảnh hưởng Database & Migration

<!-- Có tạo migration mới, sửa schema hay thay đổi chỉ mục (indexes) không? -->
- [ ] Không ảnh hưởng cơ sở dữ liệu.
- [ ] Có migration mới: đã kiểm tra tính idempotent và chạy thử qua `npm run migrate`.

## 🛡️ Ảnh hưởng Bảo mật & Dữ liệu cá nhân (Security & Privacy)

<!-- Thay đổi có liên quan đến dữ liệu nhạy cảm, quyền truy cập hay quy định NĐ 13/2023/NĐ-CP? -->
- [ ] Không thu thập thêm dữ liệu cá nhân mới.
- [ ] Đã kiểm tra validate schema đầu vào qua Zod trong `packages/shared`.
- [ ] Không để lộ thông tin bí mật hoặc biến môi trường `.env`.

## ✅ Checklist bắt buộc trước khi Merge

- [ ] Đã chạy kiểm tra toàn diện: `npm run verify` (xanh 100% tại thư mục gốc).
- [ ] Đã chạy kiểm thử E2E: `npm run e2e` (nếu có thay đổi luồng nghiệp vụ/giao diện).
- [ ] Đã cập nhật tài liệu kỹ thuật liên quan trong thư mục `docs/` (nếu có thay đổi kiến trúc/API/config).
- [ ] Đã cập nhật mục `[Unreleased]` trong [CHANGELOG.md](../CHANGELOG.md).
