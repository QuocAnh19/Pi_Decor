# ADR 0002: Xoay Vòng Refresh Token, Lưu Mã Băm và Phát Hiện Dùng Lại

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-12

## Commit liên quan

[cd4abf2](https://github.com/QuocAnh19/Pi_Decor/commit/cd4abf2) — `feat(auth): refresh token rotation with reuse detection and logout-all`

---

## 1. Bối cảnh (Context)

Các token xác thực phía quản trị viên cần đảm bảo an toàn tuyệt đối trước nguy cơ bị đánh cắp:

- Nếu dùng Access Token có thời hạn dài, kẻ tấn công chiếm được token sẽ toàn quyền truy cập hệ thống CRM.
- Nếu dùng Refresh Token tĩnh lưu trong cơ sở dữ liệu dạng văn bản rõ (plaintext), việc rò rỉ cơ sở dữ liệu sẽ làm lộ toàn bộ phiên làm việc của quản trị viên.

## 2. Quyết định (Decision)

- Áp dụng mô hình JWT Access Token ngắn hạn (15 phút) lưu trong bộ nhớ (RAM) của client.
- Triển khai cơ chế xoay vòng Refresh Token (Refresh Token Rotation - RTR): mỗi lần làm mới token, hệ thống sinh ra một Refresh Token mới và thu hồi token cũ.
- Chỉ lưu trữ chuỗi băm an toàn SHA-256 (`token_hash`) của Refresh Token trong bảng `refresh_tokens`, không lưu token gốc.
- Tổ chức phiên theo chuỗi `family_id`. Nếu phát hiện một Refresh Token đã bị thu hồi (`revoked_at is not null`) lại được gửi lên để làm mới, hệ thống kích hoạt cơ chế phát hiện sử dụng lại (Reuse Detection) và lập tức hủy bỏ toàn bộ chuỗi token family đó.
- Hỗ trợ endpoint `POST /api/auth/logout-all` để thu hồi tất cả phiên làm việc của admin.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: RTR với SHA-256 hash và Reuse Detection qua `family_id`.
- **Phương án 2**: Session-based cookie truyền thống. Không phù hợp với định hướng RESTful API không trạng thái và khả năng mở rộng đa miền.
- [CẦN XÁC NHẬN: chủ dự án bổ sung thêm phương án khác nếu có].

## 4. Hệ quả (Consequences)

- **Tích cực**: Ngăn chặn triệt để tấn công replay attack và thu hẹp cửa sổ rủi ro khi token bị lộ.
- **Tiêu cực / Đánh đổi**: Client cần xử lý hàng đợi yêu cầu làm mới đồng thời (single-flight refresh) để tránh race condition làm vô hiệu hóa nhầm chuỗi token hợp lệ.
