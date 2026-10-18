# Chiến Lược Giám Sát & Cảnh Báo Hệ Thống (MONITORING.md)

Tài liệu quy định các chỉ số đo lường hiệu năng, sự kiện an ninh, ngưỡng cảnh báo tự động và danh mục công cụ giám sát vận hành cho nền tảng Pi Decor.

---

## 1. Danh Mục Tín Hiệu & Chỉ Số Giám Sát Cốt Lõi

| Chỉ số giám sát               | Mô tả & Cách đo lường                                                        | Công cụ gợi ý (Chi phí thấp / Miễn phí)             | Ngưỡng kích hoạt cảnh báo (Alert Threshold)        |  Mức độ ưu tiên   |
| :---------------------------- | :--------------------------------------------------------------------------- | :-------------------------------------------------- | :------------------------------------------------- | :---------------: |
| **Uptime API Server**         | Kiểm tra nhịp tim (Heartbeat) qua endpoint `/api/health` mỗi 60 giây         | Uptime Kuma (Tự host) / Better Uptime (Free)        | Không phản hồi HTTP 200 trong 2 lần liên tiếp      | **P1 - Khẩn cấp** |
| **Tỉ lệ lỗi 5xx**             | Tỷ lệ phản hồi HTTP 500, 502, 503 trên tổng số request trong 5 phút          | Reverse Proxy (Nginx/Cloudflare) / Log metrics      | Tỉ lệ lỗi 5xx > 1% tổng lưu lượng `[CẦN XÁC NHẬN]` | **P1 - Khẩn cấp** |
| **Độ trễ API (Latency)**      | Thời gian phản hồi trung bình và phân vị 95th (p95) của các endpoint chính   | Sentry Performance / Prometheus                     | p95 > 1.500ms trong 10 phút `[CẦN XÁC NHẬN]`       |   **P2 - Cao**    |
| **Ngoại lệ Sentry Mới**       | Phát hiện lỗi JavaScript frontend hoặc lỗi crash backend chưa từng xuất hiện | Sentry (Gói Developer Free)                         | Ngay khi có lỗi mới (`New Issue Alert`)            |   **P2 - Cao**    |
| **Dung lượng Cơ sở Dữ liệu**  | Tỷ lệ sử dụng lưu trữ ổ đĩa của PostgreSQL (Neon Storage)                    | Neon Cloud Built-in Metrics                         | Dung lượng sử dụng > 80% hạn mức `[CẦN XÁC NHẬN]`  |   **P2 - Cao**    |
| **Hết hạn Chứng chỉ SSL**     | Số ngày còn lại trước khi chứng chỉ HTTPS Let's Encrypt hết hạn              | Uptime Kuma / SSL Certificate Monitor               | Thời hạn còn lại < 14 ngày                         |   **P2 - Cao**    |
| **Tấn công Đăng nhập sai**    | Tần suất đăng nhập thất bại tăng bất thường từ một IP hoặc dải IP            | Structured Log: `auth_login_rate_limit_exceeded`    | > 20 lần thử sai trong 15 phút từ cùng một IP      |   **P2 - Cao**    |
| **Tái sử dụng Refresh Token** | Kẻ tấn công cố tình gửi token cũ đã bị thu hồi (Reuse Detection)             | Structured Log: `auth_refresh_token_reuse_detected` | Kích hoạt ngay khi có 1 sự kiện xuất hiện          | **P1 - Khẩn cấp** |

---

## 2. Hệ Thống Nhật Ký Sự Kiện An Ninh Có Cấu Trúc (Security Audit Logging)

Ứng dụng backend sử dụng module [apps/api/src/shared/securityLogger.js](file:///D:/WANDA/Project/apps/api/src/shared/securityLogger.js) để ghi nhận nhật ký cấu trúc JSON bằng `pino`:

```json
{
  "level": 40,
  "time": 1792341200000,
  "security_audit": true,
  "event": "auth_refresh_token_reuse_detected",
  "admin_id": "8b9e67a1-...",
  "family_id": "3c4a12f0-...",
  "msg": "[SECURITY_AUDIT] Phát hiện refresh token bị sử dụng lại, đã thu hồi toàn bộ phiên"
}
```

### Danh sách sự kiện bảo mật được ghi nhận tự động:

1. `auth_login_failed`: Đăng nhập thất bại (kèm email, không ghi mật khẩu).
2. `auth_login_rate_limit_exceeded`: Vượt quá số lần thử đăng nhập tối đa (kèm IP).
3. `auth_refresh_token_reuse_detected`: Phát hiện tái sử dụng refresh token cũ.
4. `auth_admin_created`: Quản trị viên mới được tạo (kèm admin_id, email).
5. `auth_admin_deleted`: Tài khoản quản trị viên bị xóa (kèm deleted_id, performed_by).
6. `auth_password_changed`: Quản trị viên đổi mật khẩu thành công.
7. `privacy_lead_data_erased`: Xóa dữ liệu khách hàng theo yêu cầu bảo vệ quyền riêng tư.

---

## 3. Kênh Tiếp Nhận & Phân Phối Cảnh Báo

- **Kênh tức thì (Real-time)**: Telegram Bot hoặc Discord Webhook tích hợp với Sentry và Uptime Kuma gửi thông báo tức thì đến nhóm kỹ thuật trực vận hành.
- **Kênh dự phòng**: Email tự động gửi đến địa chỉ quản trị viên chính khi có sự cố cấp P1.
- **Kế hoạch xử lý khi nhận cảnh báo**: Tham chiếu quy trình từng bước tại [INCIDENT_RESPONSE.md](../security/INCIDENT_RESPONSE.md).
