# ADR 0004: Khử Khuẩn Mã Đồ Họa SVG Bằng DOMPurify Cho Phân Hệ Studio

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-12

## Commit liên quan

[5757f85](https://github.com/QuocAnh19/Pi_Decor/commit/5757f85) — `fix(security): DOMPurify-based SVG sanitizing and stricter image upload`

---

## 1. Bối cảnh (Context)

Studio thiết kế sử dụng đồ họa vector SVG trực tiếp để render các mẫu phông nền, cổng vòm hoa và họa tiết trang trí tiệc cưới:

- Tệp SVG thực chất là tài liệu XML có khả năng chứa mã nhúng `<script>`, các thuộc tính sự kiện inline (`onload`, `onerror`), hoặc các thẻ nguy hiểm (`<iframe>`, `<object>`).
- Nếu Admin hoặc kẻ tấn công tải lên một tệp SVG có chứa mã độc XSS, khi trình duyệt của khách hàng hoặc admin khác hiển thị template đó, mã độc JavaScript sẽ được thực thi trong ngữ cảnh trang web.

## 2. Quyết định (Decision)

- Áp dụng thư viện `isomorphic-dompurify` trên backend để khử khuẩn (sanitize) toàn bộ nội dung SVG trước khi lưu trữ vào cơ sở dữ liệu (tại các trường `studio_templates.svg_base` và `studio_assets.svg_data`).
- Thiết lập allowlist nghiêm ngặt các thẻ SVG đồ họa hợp lệ (ví dụ: `svg`, `g`, `path`, `rect`, `circle`, `defs`, `linearGradient`, v.v.).
- Loại bỏ tuyệt đối các thẻ `<script>`, `<foreignObject>`, `<animate>`, cùng các thuộc tính bắt sự kiện inline.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: Sử dụng DOMPurify với cấu hình `USE_PROFILES: { svg: true }` chuyên dụng.
- **Phương án 2**: Dùng biểu thức chính quy (Regex) để lọc thẻ `<script>`. Bị bác bỏ do Regex rất dễ bị vượt qua bằng các kỹ thuật biến đổi encoding hoặc lồng thẻ XML phức tạp.
- [CẦN XÁC NHẬN: chủ dự án bổ sung thêm yêu cầu đối với phông chữ nhúng SVG].

## 4. Hệ quả (Consequences)

- **Tích cực**: Ngăn chặn 100% nguy cơ Stored XSS thông qua việc biên tập và hiển thị mẫu thiết kế Studio.
- **Tiêu cực / Đánh đổi**: Các template có hiệu ứng động phức tạp (animation) cần được chuẩn hóa lại để không bị bộ lọc loại bỏ.
