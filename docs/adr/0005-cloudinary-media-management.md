# ADR 0005: Quản Lý Hình Ảnh & Media Tập Trung Bằng Cloudinary CDN

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-17

## Commit liên quan

[f06ea75](https://github.com/QuocAnh19/Pi_Decor/commit/f06ea75) — `feat(infra): Neon pooled/direct connections, resilient pool, split health checks, Cloudinary prefix and media audit`

---

## 1. Bối cảnh (Context)

Website ngành trang trí tiệc cưới có khối lượng hình ảnh chất lượng cao rất lớn (album Lookbook, ảnh mẫu vật liệu, ảnh đánh giá thực tế từ khách hàng):

- Lưu trữ tệp tĩnh trên đĩa cứng của máy chủ API gây phình to dung lượng container, khó scale-out nhiều replica, và tốn băng thông máy chủ chính.
- Khách hàng truy cập từ nhiều thiết bị và tốc độ mạng khác nhau cần được phục vụ ảnh với kích thước và định dạng tối ưu (WebP/AVIF).

## 2. Quyết định (Decision)

- Tích hợp dịch vụ đám mây Cloudinary làm kho lưu trữ media tập trung cho toàn bộ ứng dụng.
- Quản lý tải lên thông qua middleware `multer-storage-cloudinary` kết hợp `media.service.js`.
- Cấu hình tiền tố thư mục (folder prefix) theo quy ước nghiệp vụ `pidecor/` trên Cloudinary.
- Xây dựng script kiểm toán media định kỳ `apps/api/scripts/media-audit.js` để quét và dọn dẹp các tệp ảnh mồ côi (ảnh đã xóa khỏi DB nhưng vẫn còn trên Cloudinary).

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Sử dụng Cloudinary API vì có sẵn CDN toàn cầu, tự động chuyển đổi định dạng WebP và resize ảnh linh hoạt theo URL parameters.
- **Phương án 2**: Tự host S3 bucket hoặc MinIO kết hợp thư viện `sharp` trên máy chủ. Tốn thêm chi phí duy trì hạ tầng riêng và tài nguyên CPU/RAM khi xử lý ảnh.
- [CẦN XÁC NHẬN: chủ dự án bổ sung kế hoạch nâng cấp hạn mức Cloudinary].

## 4. Hệ quả (Consequences)

- **Tích cực**: Tốc độ tải trang tối ưu, giảm tải băng thông cho máy chủ Express, không lo rủi ro mất ảnh khi container backend khởi động lại.
- **Tiêu cực / Đánh đổi**: Phụ thuộc vào dịch vụ bên thứ ba (third-party dependency) và cần bảo vệ cẩn mật `CLOUDINARY_API_SECRET`.
