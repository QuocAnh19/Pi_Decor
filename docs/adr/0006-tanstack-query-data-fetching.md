# ADR 0006: Đồng Bộ Dữ Liệu Máy Chủ Bằng TanStack Query Phía Client

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-15

## Commit liên quan

[de2638d](https://github.com/QuocAnh19/Pi_Decor/commit/de2638d) — `refactor(client): migrate data hooks to TanStack Query`

---

## 1. Bối cảnh (Context)

Ứng dụng frontend React trước đây quản lý việc gọi API bằng các hook tùy biến thủ công (`useState` + `useEffect`):

- Trùng lặp mã nguồn xử lý trạng thái tải (`loading`, `error`, `data`) ở từng màn hình.
- Thiếu cơ chế bộ nhớ đệm (caching), dẫn đến việc gửi lại các yêu cầu mạng lặp đi lặp lại khi người dùng chuyển qua lại giữa các tab hoặc màn hình.
- Việc cập nhật lạc quan (optimistic updates) và đồng bộ lại dữ liệu sau khi sửa đổi (cache invalidation) rất phức tạp và dễ phát sinh lỗi hiển thị dữ liệu cũ.

## 2. Quyết định (Decision)

- Di chuyển toàn bộ các hook truy vấn dữ liệu sang thư viện `@tanstack/react-query` (TanStack Query v5).
- Chuẩn hóa các query key theo mảng phân cấp (ví dụ `["leads"]`, `["leads", id]`, `["materials", category]`).
- Cấu hình thời gian dữ liệu tươi (`staleTime: 5 * 60 * 1000` — 5 phút) cho các danh mục ít biến động (materials, services, venues).
- Sử dụng `useMutation` kèm `queryClient.invalidateQueries()` để tự động làm mới giao diện sau khi tạo/sửa/xóa thành công.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: TanStack Query v5. Chuẩn công nghiệp cho server-state management trong React, hỗ trợ garbage collection, auto-refetch khi focus, và mutation hooks mạnh mẽ.
- **Phương án 2**: Redux Toolkit (RTK Query) hoặc Zustand tự quản lý cache. Bị bác bỏ do boilerplate cồng kềnh, không cần thiết cho dự án.
- [CẦN XÁC NHẬN: chủ dự án bổ sung chiến lược revalidation nâng cao nếu có].

## 4. Hệ quả (Consequences)

- **Tích cực**: Trải nghiệm người dùng mượt mà, tốc độ phản hồi tức thì nhờ cache; giảm thiểu số lượng request không cần thiết tới API server.
- **Tiêu cực / Đánh đổi**: Các lập trình viên mới cần nắm vững cơ chế quản lý lifecycle và query key của TanStack Query.
