# ADR 0011: Đánh Số Hiệu Báo Giá Nguyên Tử Bằng Bảng quotation_counters

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-12

## Commit liên quan

[2acb0e5](https://github.com/QuocAnh19/Pi_Decor/commit/2acb0e5) — `fix(server): verified DB SSL, atomic quotation numbering, remove runtime ALTER`

---

## 1. Bối cảnh (Context)

Báo giá gửi cho khách hàng cần một mã số nhận diện duy nhất, dễ đọc và thể hiện năm phát hành, định dạng: `BG-YYYY-XXXX` (ví dụ: `BG-2026-0001`):

- Trước đây, hệ thống tìm mã số mới bằng cách truy vấn `SELECT max(quotation_number)` từ bảng `quotations`.
- Khi có 2 quản trị viên cùng bấm tạo báo giá tại cùng một thời điểm, giải pháp trên bị xung đột ghi (race condition), dẫn đến việc sinh ra trùng mã số và gây lỗi vi phạm ràng buộc khóa duy nhất (Unique Constraint Violation).

## 2. Quyết định (Decision)

- Tạo bảng chuyên trách `quotation_counters` với cột khóa chính là `year` (`integer`) và bộ đếm `last_seq` (`integer`).
- Sử dụng câu lệnh nguyên tử của PostgreSQL với cơ chế khóa hàng tự động:
  ```sql
  INSERT INTO quotation_counters (year, last_seq)
  VALUES ($1, 1)
  ON CONFLICT (year) DO UPDATE
  SET last_seq = quotation_counters.last_seq + 1
  RETURNING last_seq;
  ```
- Định dạng chuỗi số hiệu bằng cách đệm số 0 (zero-padded) 4 chữ số: `BG-${year}-${String(last_seq).padStart(4, '0')}`.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Bảng đếm `quotation_counters` với câu lệnh `INSERT ... ON CONFLICT DO UPDATE RETURNING`. Đảm bảo tính nguyên tử tuyệt đối mà không cần quản lý thủ công các đối tượng PostgreSQL Sequence động theo năm.
- **Phương án 2**: Tạo động PostgreSQL Sequence mới cho mỗi năm (`CREATE SEQUENCE quotation_seq_2026`). Bị bác bỏ do đòi hỏi phải thực thi câu lệnh DDL (`CREATE SEQUENCE`) trong runtime nghiệp vụ, vi phạm nguyên tắc bảo mật quyền hạn tối thiểu của DB user.
- [CẦN XÁC NHẬN: chủ dự án bổ sung quy tắc reset số thứ tự nếu sang năm mới].

## 4. Hệ quả (Consequences)

- **Tích cực**: Tuyệt đối không bao giờ bị trùng số báo giá ngay cả khi có hàng chục yêu cầu lập báo giá đồng thời; không cần quyền DDL lúc runtime.
- **Tiêu cực / Đánh đổi**: Thêm một bảng dữ liệu cần quản lý và khởi tạo trong quá trình migration.
