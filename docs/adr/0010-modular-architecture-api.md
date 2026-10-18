# ADR 0010: Kiến Trúc Phân Tầng Theo Module Nghiệp Vụ Cho Backend API

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-16

## Commit liên quan

[ca23afe](https://github.com/QuocAnh19/Pi_Decor/commit/ca23afe) — `refactor(api): modularize leads`

---

## 1. Bối cảnh (Context)

Cấu trúc ban đầu của `apps/api` tổ chức theo kiểu phân lớp kỹ thuật phẳng (`routes/`, `controllers/`, `services/` dùng chung một thư mục lớn):

- Mã nguồn của các tính năng bị phân mảnh khắp nơi. Khi cần chỉnh sửa một nghiệp vụ (ví dụ `leads` hoặc `quotations`), lập trình viên phải nhảy qua lại giữa nhiều thư mục cách xa nhau.
- Các file có kích thước ngày càng tăng, vi phạm giới hạn kích thước file (`max-lines: 300`) quy định tại AGENTS.md.

## 2. Quyết định (Decision)

- Tái cấu trúc backend thành kiến trúc module hóa theo miền nghiệp vụ tại thư mục `apps/api/src/modules/`:
  - `src/modules/auth/`
  - `src/modules/leads/`
  - `src/modules/quotations/`
  - `src/modules/projects/`
  - `src/modules/venues/`
  - `src/modules/materials/`
  - `src/modules/services/`
  - `src/modules/testimonials/`
  - `src/modules/studio/`
- Mỗi module tự bao gói đầy đủ các thành phần phân tầng:
  - `*.routes.js`: Định nghĩa endpoint và gán middleware xác thực / rate limit.
  - `*.controller.js`: Xử lý HTTP request/response và parse schema Zod.
  - `*.service.js`: Xử lý logic nghiệp vụ và điều phối transaction.
  - `*.test.js`: Bài kiểm thử tích hợp (integration test) chuyên biệt cho module đó.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Kiến trúc Module theo miền (Feature-based Modular Architecture).
- **Phương án 2**: Giữ nguyên kiến trúc tầng phẳng (Layer-based). Bị bác bỏ do không mở rộng tốt khi số lượng endpoint tăng lên và khó áp dụng quy tắc 300 dòng.
- [CẦN XÁC NHẬN: chủ dự án bổ sung kế hoạch phân tách repository độc lập (microservices) nếu có].

## 4. Hệ quả (Consequences)

- **Tích cực**: Tính đóng gói cao (high cohesion); dễ dàng bảo trì, tìm kiếm và viết kiểm thử độc lập cho từng tính năng; kiểm soát tốt giới hạn dòng code.
- **Tiêu cực / Đánh đổi**: Cần thiết lập cơ chế đăng ký router tự động hoặc gom router tại `src/modules/index.js`.
