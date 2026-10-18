# ADR 0013: Kiểm Thử Toàn Diện Đầu Cuối (End-to-End) Bằng Playwright

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-17

## Commit liên quan

[59414c2](https://github.com/QuocAnh19/Pi_Decor/commit/59414c2) — `test: coverage reporting, studio logic tests, Playwright e2e and visual baselines`

---

## 1. Bối cảnh (Context)

Dù hệ thống đã có hơn 80 bài kiểm thử tích hợp API (Supertest) và unit test frontend (Vitest), các luồng nghiệp vụ tương tác phức tạp vẫn có nguy cơ gãy vỡ:

- Khách trải nghiệm Studio canvas, chọn vật liệu, gửi form kèm consent và tạo lead trong CRM.
- Admin đăng nhập, duyệt lead, mở modal tạo báo giá và quan sát timeline cập nhật theo thời gian thực.
- Kiểm tra hồi quy giao diện trực quan (Visual Regression) khi chỉnh sửa CSS/Design Tokens.

## 2. Quyết định (Decision)

- Áp dụng `@playwright/test` làm khung kiểm thử End-to-End (E2E) chính thức của dự án tại thư mục `e2e/`.
- Cấu hình tự động khởi động hệ thống (`webServer`): Tự động build web preview (`npm run build:web`) và khởi động API server trong môi trường cô lập.
- Sử dụng cơ chế `globalSetup` để tự động chạy migration và nạp dữ liệu mẫu (seed) vào cơ sở dữ liệu kiểm thử với tài khoản admin cố định dành riêng cho test.
- Tích hợp ảnh chụp trực quan đối chiếu (Visual Regression snapshots) đa nền tảng (hỗ trợ baseline riêng cho Linux CI).
- Tích hợp luồng chạy `npm run e2e` vào quy trình CI GitHub Actions.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Playwright. Tốc độ thực thi vượt trội, kiến trúc hiện đại, hỗ trợ native headless Chromium/Firefox/WebKit, API async/await tự động chờ (auto-wait), và tích hợp visual comparisons mạnh mẽ.
- **Phương án 2**: Cypress. Bị bác bỏ do chạy chậm hơn trong môi trường CI và gặp nhiều hạn chế khi test nhiều tab hoặc tích hợp visual regression phức tạp.
- [CẦN XÁC NHẬN: chủ dự án bổ sung danh sách trình duyệt mục tiêu trên mobile].

## 4. Hệ quả (Consequences)

- **Tích cực**: Bảo đảm độ tin cậy tuyệt đối cho các luồng nghiệp vụ quan trọng trước khi release; phát hiện ngay lập tức các lỗi hồi quy giao diện.
- **Tiêu cực / Đánh đổi**: Thời gian chạy CI tăng thêm khoảng 1-2 phút; cần bảo trì bộ ảnh chụp baseline khi có thay đổi cố ý về mặt thiết kế UI.
