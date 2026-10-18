# ADR 0001: Sử Dụng PostgreSQL Thay Thế Cơ Sở Dữ Liệu JSON Tệp

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-12

## Commit liên quan

[9b6d54a](https://github.com/QuocAnh19/Pi_Decor/commit/9b6d54a) — `refactor(server): remove public designs route and JSON fallback DB`

---

## 1. Bối cảnh (Context)

Ban đầu, hệ thống Pi Decor sử dụng giải pháp lưu trữ dự phòng bằng các tệp JSON cục bộ (`materials.json`, `services.json`, `leads.json`) song song với cơ sở dữ liệu. Cách tiếp cận này bộc lộ nhiều rủi ro:

- Dễ gây xung đột ghi (race conditions) khi có nhiều yêu cầu gửi lead đồng thời.
- Không đảm bảo tính toàn vẹn quan hệ (ACID transactions), không hỗ trợ khóa ngoại (Foreign Keys).
- Trạng thái dữ liệu phân tán giữa môi trường local và máy chủ thực tế.

## 2. Quyết định (Decision)

- Loại bỏ hoàn toàn cơ chế đọc/ghi tệp JSON fallback trên backend.
- Chuyển toàn bộ dữ liệu nghiệp vụ (leads, materials, services, venues, projects, quotations) sang hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL 16.
- Bắt buộc thiết lập biến môi trường `DATABASE_URL`; máy chủ dừng khởi động (fail-fast) nếu không thể kết nối tới cơ sở dữ liệu.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Sử dụng PostgreSQL thuần qua thư viện `pg` (node-postgres) với connection pool và migrations version-controlled. Đảm bảo toàn vẹn dữ liệu và hỗ trợ tốt kiểu dữ liệu `jsonb`.
- **Phương án 2**: Duy trì cơ chế JSON fallback khi mất kết nối DB. Bị bác bỏ do gây phân mảnh trạng thái và nguy cơ mất dữ liệu của khách hàng.
- [CẦN XÁC NHẬN: chủ dự án bổ sung lý do về chi phí hạ tầng Neon PostgreSQL].

## 4. Hệ quả (Consequences)

- **Tích cực**: Dữ liệu có tính nhất quán ACID tuyệt đối, hỗ trợ quan hệ cascade/set null, chỉ mục tìm kiếm văn bản trigram (`pg_trgm`) và truy vấn JSONB hiệu năng cao.
- **Tiêu cực / Đánh đổi**: Môi trường phát triển cục bộ bắt buộc phải có PostgreSQL (thông qua Docker Compose hoặc dịch vụ đám mây Neon).
