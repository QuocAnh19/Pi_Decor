# ADR 0009: DTO Chuẩn Snake_case Kết Hợp Centralized Mappers Ở Phía Web

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-16

## Commit liên quan

[4a93653](https://github.com/QuocAnh19/Pi_Decor/commit/4a93653) — `refactor: single API contract with centralized mappers; remove any`

---

## 1. Bối cảnh (Context)

PostgreSQL có quy ước đặt tên bảng và cột theo kiểu `snake_case` (ví dụ: `lead_id`, `wedding_date`, `created_at`), trong khi mã nguồn TypeScript/JavaScript ở frontend React tuân theo quy ước `camelCase` (ví dụ: `leadId`, `weddingDate`, `createdAt`):

- Nếu chuyển đổi tự động bằng middleware trung gian không kiểm soát, sẽ gây khó khăn cho việc kiểm tra kiểu dữ liệu tĩnh của TypeScript.
- Nếu để frontend dùng lẫn lộn cả `snake_case` và `camelCase`, mã nguồn UI sẽ bị phân mảnh và khó duy trì.

## 2. Quyết định (Decision)

- **Tầng Giao tiếp Mạng & DTO**: Toàn bộ DTO (Data Transfer Object) trong `@pidecor/shared` và phản hồi JSON của REST API giữ nguyên định dạng `snake_case`, tương thích 1:1 với cột dữ liệu trong PostgreSQL.
- **Tầng Client Domain**: Ứng dụng frontend React sử dụng mô hình miền nghiệp vụ chuẩn `camelCase`.
- **Tầng Chuyển đổi (Mapping Layer)**: Thiết lập các hàm chuyển đổi hai chiều tập trung (Centralized Mappers, ví dụ `studioMappers.ts`, `leadsMappers.ts`):
  - `toDomain(dto)`: Chuyển đổi dữ liệu nhận từ API thành model frontend.
  - `toPayload(domain)`: Đóng gói dữ liệu từ form UI thành DTO gửi lên API.
- Cấm sử dụng kiểu `any` trong toàn bộ quy trình ánh xạ dữ liệu.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: DTO snake_case kết hợp mapper thủ công có định kiểu rõ ràng. Kiểm soát chặt chẽ từng trường dữ liệu, xử lý được các trường hợp dữ liệu rỗng (null/undefined) và giá trị mặc định.
- **Phương án 2**: Dùng thư viện tự động chuyển đổi key toàn cục (`camelcase-keys`). Bị bác bỏ vì khó debug và dễ làm sai lệch cấu trúc dữ liệu JSONB phức tạp bên trong.
- [CẦN XÁC NHẬN: chủ dự án bổ sung quy chuẩn chuyển đổi ngày tháng].

## 4. Hệ quả (Consequences)

- **Tích cực**: Phân tách rõ ràng giữa mô hình mạng và mô hình hiển thị; code React thuần túy chuẩn camelCase; typecheck TypeScript bảo vệ 100%.
- **Tiêu cực / Đánh đổi**: Phải viết và bảo trì thêm các hàm mapper cho mỗi thực thể dữ liệu mới.
