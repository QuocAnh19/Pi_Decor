# Các vấn đề theo dõi & Kế hoạch xử lý (FOLLOWUPS.md)

Tài liệu này ghi nhận các vấn đề kỹ thuật phát hiện trong quá trình kiểm tra hoặc thực hiện nhiệm vụ, nằm ngoài phạm vi prompt hiện tại, cần được xử lý ở các nhiệm vụ tiếp theo.

---

## 1. Xung đột Peer Dependency tại `server/` khi chạy `npm ci`
- **Mô tả**: Khi chạy `npm ci` trong thư mục `server/`, npm báo lỗi `ERESOLVE could not resolve`:
  ```
  peer cloudinary@"^1.21.0" from multer-storage-cloudinary@4.0.0
  Found: cloudinary@2.10.0
  ```
- **Nguyên nhân**: `server/package.json` khai báo `cloudinary: "^2.5.0"`, trong khi `multer-storage-cloudinary@4.0.0` chỉ hỗ trợ peer dependency `cloudinary@^1.21.0`.
- **Đề xuất xử lý ở nhiệm vụ sau**:
  - Xem xét nâng cấp adapter upload hoặc cấu hình `legacy-peer-deps` trong `.npmrc` của server, hoặc chuyển sang dùng Cloudinary v2 SDK trực tiếp không qua package `multer-storage-cloudinary` cũ.
- **Trạng thái**: Chờ duyệt.

## 2. Cảnh báo ESLint trên Client (61 warnings)
- **Mô tả**: `client/` hiện có 61 warning khi chạy `npm run lint`.
  - 18 cảnh báo `max-lines` (file vượt quá 300 dòng).
  - 39 cảnh báo `@typescript-eslint/no-explicit-any`.
  - 4 cảnh báo `react-hooks/exhaustive-deps`.
- **Đề xuất xử lý ở nhiệm vụ sau**:
  - Tách nhỏ các component lớn trong `admin/` và `features/studio/`.
  - Bổ sung types cụ thể thay thế `any`.
- **Trạng thái**: Chờ duyệt.
