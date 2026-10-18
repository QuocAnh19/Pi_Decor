# Quy trình Phát hành Phiên bản (RELEASING.md)

Tài liệu này hướng dẫn chi tiết quy trình chuẩn bị, đánh số phiên bản, gắn thẻ (tag) và phát hành phiên bản mới của dự án Pi Decor thông qua GitHub Actions.

---

## 1. Quy ước Đánh số Phiên bản (Semantic Versioning)

Dự án áp dụng chặt chẽ chuẩn **Semantic Versioning 2.0.0** (`vMAJOR.MINOR.PATCH`):

- **MAJOR (Số chính)**: Tăng khi có các thay đổi kiến trúc lớn làm **phá vỡ khả năng tương thích ngược** (ví dụ: thay đổi cấu trúc API bắt buộc, nâng cấp phiên bản cơ sở dữ liệu không tương thích).
- **MINOR (Số phụ)**: Tăng khi bổ sung **tính năng mới nhưng vẫn đảm bảo tương thích ngược** (ví dụ: thêm trang quản trị mới, bổ sung endpoint API không ảnh hưởng đến client cũ).
- **PATCH (Số vá lỗi)**: Tăng khi thực hiện **các bản sửa lỗi, tối ưu hiệu năng hoặc vá bảo mật** không làm thay đổi giao diện API hay tính năng sẵn có.

---

## 2. Các bước Chuẩn bị Trước khi Phát hành

### Bước 1: Kiểm tra sẵn sàng toàn diện

Trước khi tạo bản phát hành, đảm bảo tất cả các bài kiểm tra đều vượt qua:

```bash
# Kiểm tra toàn bộ mã nguồn monorepo
npm run verify

# Kiểm tra điều kiện triển khai môi trường production
npm run launch:check -- --strict
```

### Bước 2: Cập nhật `CHANGELOG.md`

1. Mở tệp [CHANGELOG.md](../CHANGELOG.md).
2. Chuyển các nội dung trong mục `## [Unreleased]` thành tiêu đề phiên bản mới kèm ngày hiện tại (theo chuẩn ISO `YYYY-MM-DD`):
   ```markdown
   ## [1.0.0] - 2026-10-18
   ```
3. Tạo lại một khối `## [Unreleased]` trống phía trên để chuẩn bị cho chu kỳ phát triển tiếp theo:
   ```markdown
   ## [Unreleased]

   ### Added

   ### Changed

   ### Fixed
   ```
4. Commit thay đổi này:
   ```bash
   git add CHANGELOG.md
   git commit -m "chore(release): prepare v1.0.0"
   git push origin main
   ```

---

## 3. Tạo Thẻ Phiên bản có Ký (Signed Git Tag)

Dự án khuyến khích (hoặc bắt buộc theo cài đặt bảo mật) tạo **thẻ có chữ ký số (Signed Tag)** để xác thực nguồn gốc bản phát hành:

```bash
# Tạo tag có chữ ký GPG hoặc SSH (-s)
git tag -s v1.0.0 -m "Release v1.0.0: Pi Decor production ready"

# Hoặc tạo annotated tag (-a) nếu chưa cấu hình signing key
git tag -a v1.0.0 -m "Release v1.0.0: Pi Decor production ready"

# Xác thực chữ ký của thẻ vừa tạo
git tag -v v1.0.0
```

Đẩy thẻ lên GitHub để kích hoạt quy trình phát hành tự động:

```bash
git push origin v1.0.0
```

---

## 4. Tự động hóa Phát hành qua GitHub Actions

Khi tag dạng `v*.*.*` được đẩy lên GitHub, workflow [`.github/workflows/release.yml`](../.github/workflows/release.yml) sẽ tự động thực thi các bước:

1. **Kiểm tra mã nguồn**: Cài đặt phụ thuộc sạch (`npm ci`), chạy kiểm tra toàn diện `npm run verify`.
2. **Đóng gói sản phẩm**: Chạy `npm run build:web` để đảm bảo client build hoàn tất không lỗi.
3. **Sinh SBOM**: Chạy `npm run sbom` để sinh Software Bill of Materials `dist-sbom/bom.json`.
4. **Trích xuất Release Notes**: Tự động lấy phần ghi chú tương ứng của phiên bản từ `CHANGELOG.md`.
5. **Tạo GitHub Release**: Tạo bản Release chính thức trên GitHub, đính kèm tệp `bom.json` và gắn nhãn phiên bản ổn định.

---

## 5. Quy trình Thu hồi & Hotfix khẩn cấp

- **Khi phát hiện lỗi nghiêm trọng ngay sau khi phát hành**:
  1. Tạo nhánh nóng từ tag hiện tại: `git checkout -b hotfix/v1.0.1 v1.0.0`.
  2. Khắc phục sự cố, bổ sung kiểm thử, cập nhật `CHANGELOG.md`.
  3. Merge vào `main` và gắn tag vá lỗi tiếp theo: `git tag -s v1.0.1 -m "Hotfix v1.0.1"`.
  4. Đẩy tag lên để hệ thống tự động xuất bản bản vá.
- **Không bao giờ xóa hoặc di chuyển tag đã phát hành công khai** nhằm đảm bảo tính toàn vẹn của chuỗi cung ứng phần mềm.
