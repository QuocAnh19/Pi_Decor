# ADR 0007: Kiến Trúc Monorepo Npm Workspaces & Gói Dùng Chung @pidecor/shared

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-16

## Commit liên quan

- [7f5af4d](https://github.com/QuocAnh19/Pi_Decor/commit/7f5af4d) — `chore: convert to npm workspaces monorepo (apps/web, apps/api)`
- [18a10dc](https://github.com/QuocAnh19/Pi_Decor/commit/18a10dc) — `refactor: shared zod schemas and DTO types package`

---

## 1. Bối cảnh (Context)

Trước đây repository chia thành 2 thư mục rời rạc `client/` và `server/`:

- Dẫn đến tình trạng trùng lặp định nghĩa kiểu dữ liệu TypeScript và các schema kiểm tra tính hợp lệ (Zod) ở cả hai bên.
- Khi API thay đổi trường dữ liệu hoặc quy tắc kiểm tra (ví dụ độ dài số điện thoại), lập trình viên phải sửa đổi ở 2 nơi riêng biệt, dễ dẫn đến lệch pha (drift) giữa client và server.

## 2. Quyết định (Decision)

- Chuyển đổi repository sang cấu trúc Monorepo chuẩn bằng `npm workspaces`:
  - `apps/web`: Frontend React 18 + Vite.
  - `apps/api`: Backend Express 5 ESM.
  - `packages/shared`: Thư viện dùng chung xuất bản dạng internal package `@pidecor/shared`.
- Quy định `@pidecor/shared` là **nguồn chân lý duy nhất (Single Source of Truth)** cho toàn bộ Zod schemas, DTO types và các quy tắc kiểm tra dùng chung (như biểu thức chính quy số điện thoại Việt Nam).
- Cấm tuyệt đối việc tạo lại các thư mục cũ `client/` hay `server/`.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Npm workspaces kết hợp `tsc --build` cho `@pidecor/shared`. Đơn giản, nhẹ nhàng, không cần cài đặt thêm công cụ monorepo phức tạp.
- **Phương án 2**: Dùng Turborepo hoặc Nx. Bị bác bỏ do quy mô dự án hiện tại chưa cần đến cơ chế caching pipeline phân tán phức tạp của Turborepo.
- [CẦN XÁC NHẬN: chủ dự án bổ sung kế hoạch nâng cấp công cụ monorepo trong tương lai].

## 4. Hệ quả (Consequences)

- **Tích cực**: Đồng bộ hoàn toàn kiểu dữ liệu end-to-end; bắt lỗi lệch hợp đồng API ngay từ lúc biên dịch (`npm run build:shared`).
- **Tiêu cực / Đánh đổi**: Trước khi chạy ứng dụng hoặc kiểm thử, bắt buộc phải build gói shared (`npm run build:shared`).
