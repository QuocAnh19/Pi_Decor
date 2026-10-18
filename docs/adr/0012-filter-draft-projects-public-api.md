# ADR 0012: Lọc Dự Án Bản Nháp (Draft) Ở Tầng Truy Vấn SQL Của API Công Khai

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-12

## Commit liên quan

[fd77331](https://github.com/QuocAnh19/Pi_Decor/commit/fd77331) — `perf(server): SQL-level queries, hide draft projects from public API, drop internal fields`

---

## 1. Bối cảnh (Context)

Dự án Lookbook tiệc cưới có 2 trạng thái: đang soạn thảo (bản nháp, `published = false`) và đã xuất bản (`published = true`):

- Trước đây, API công khai `GET /api/projects` tải toàn bộ danh sách dự án từ cơ sở dữ liệu về bộ nhớ Node.js rồi mới dùng hàm `.filter(p => p.published)` để loại bỏ bản nháp.
- Cách làm này gây lãng phí băng thông DB, tốn RAM của máy chủ API, và tiềm ẩn nguy cơ vô tình rò rỉ hình ảnh/dữ liệu của các đám cưới chưa hoàn thiện hoặc chưa được sự cho phép của khách hàng.

## 2. Quyết định (Decision)

- Chuyển toàn bộ logic lọc trạng thái xuất bản xuống tầng cơ sở dữ liệu:
  - Endpoint công khai `GET /api/projects`: Luôn thực thi câu lệnh SQL có điều kiện `WHERE published = true`.
  - Endpoint quản trị `GET /api/projects/admin`: Yêu cầu quyền admin, cho phép lấy toàn bộ cả dự án đã xuất bản và bản nháp.
- Đánh chỉ mục kép (composite index) `idx_projects_published_created_at ON projects (published, created_at DESC)` để tăng tốc tối đa tốc độ truy vấn cho khách tham quan.
- Loại bỏ các trường nội bộ không cần thiết (như `lead_id`) ra khỏi dữ liệu trả về cho client công khai.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Tách biệt rõ ràng giữa route công khai và route quản trị, lọc bằng mệnh đề `WHERE` trong SQL.
- **Phương án 2**: Dùng một endpoint duy nhất và lọc trong memory. Bị bác bỏ do kém hiệu năng và rủi ro rò rỉ dữ liệu.
- [CẦN XÁC NHẬN: chủ dự án bổ sung thêm trạng thái lưu trữ (Archived) nếu cần].

## 4. Hệ quả (Consequences)

- **Tích cực**: Bảo mật dữ liệu tuyệt đối; tốc độ phản hồi API cực nhanh nhờ chỉ mục PostgreSQL; tiết kiệm tài nguyên CPU/RAM cho máy chủ.
- **Tiêu cực / Đánh đổi**: Phía frontend Admin và Public phải gọi vào hai endpoint khác nhau (`/api/projects` vs `/api/projects/admin`).
