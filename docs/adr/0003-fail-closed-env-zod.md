# ADR 0003: Xác Thực Biến Môi Trường Theo Cơ Chế Đóng Chặt (Fail-Closed) Bằng Zod

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-12

## Commit liên quan

[ea0f524](https://github.com/QuocAnh19/Pi_Decor/commit/ea0f524) — `fix(server): fail-closed env validation, trust proxy, body limits, safe error responses`

---

## 1. Bối cảnh (Context)

Các sự cố vận hành phần mềm thường xuất phát từ việc thiếu biến môi trường hoặc cấu hình sai định dạng (ví dụ thiếu `JWT_SECRET`, thiếu `DATABASE_URL`, hoặc chuỗi bí mật quá ngắn):

- Nếu server vẫn khởi động và chỉ báo lỗi khi có request đầu tiên gọi tới, ứng dụng có thể gặp lỗi crash bất ngờ giữa chừng hoặc tạo ra các lỗ hổng bảo mật nghiêm trọng (như dùng JWT secret mặc định).

## 2. Quyết định (Decision)

- Xây dựng module cấu hình tập trung `src/config/env.js` sử dụng Zod schema để kiểm tra và ép kiểu toàn bộ biến môi trường của `apps/api`.
- Áp dụng nguyên tắc đóng chặt (Fail-Closed / Fail-Fast): Khi khởi động server, nếu bất kỳ biến môi trường bắt buộc nào bị thiếu hoặc không thỏa mãn định dạng (ví dụ `JWT_SECRET` phải dài từ 32 ký tự trở lên), ứng dụng lập tức in thông báo lỗi chi tiết và thoát (`process.exit(1)`).
- Chặn sử dụng các giá trị bí mật mặc định không an toàn trên môi trường production.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Zod schema xác thực tập trung ngay tại thời điểm import `env.js`.
- **Phương án 2**: Kiểm tra thủ công bằng câu lệnh `if (!process.env.XXX)` phân tán tại từng file service. Bị bác bỏ do dễ bỏ sót và khó bảo trì.
- [CẦN XÁC NHẬN: chủ dự án bổ sung quy định về biến môi trường tùy chỉnh].

## 4. Hệ quả (Consequences)

- **Tích cực**: Ngăn chặn 100% tình trạng ứng dụng chạy trong trạng thái thiếu cấu hình an toàn; phát hiện lỗi cấu hình ngay từ bước kiểm tra CI và trước khi deploy.
- **Tiêu cực / Đánh đổi**: Khi thêm biến môi trường mới vào hệ thống, bắt buộc phải khai báo và cập nhật schema tại `src/config/env.js` và `.env.example`.
