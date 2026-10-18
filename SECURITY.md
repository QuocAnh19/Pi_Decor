# Chính sách Bảo mật (SECURITY.md)

Dự án Pi Decor cam kết bảo vệ an toàn thông tin hệ thống, dữ liệu khách hàng và người dùng. Chúng tôi đánh giá cao sự đóng góp của cộng đồng nghiên cứu bảo mật và các nhà phát triển trong việc phát hiện và khắc phục các lỗ hổng an toàn thông tin theo nguyên tắc tiết lộ có trách nhiệm (Responsible Disclosure).

---

## 1. Các phiên bản được hỗ trợ (Supported Versions)

Chúng tôi chỉ phát hành các bản vá lỗi bảo mật cho nhánh chính và phiên bản ổn định hiện tại:

| Phiên bản   | Nhánh / Thẻ       | Trạng thái hỗ trợ bảo mật                                        |
| :---------- | :---------------- | :--------------------------------------------------------------- |
| **1.x.x**   | `main`            | :white_check_mark: Được hỗ trợ đầy đủ các bản vá bảo mật         |
| **< 1.0.0** | Bản thử nghiệm cũ | :x: Không còn được hỗ trợ, khuyến nghị nâng cấp lên bản mới nhất |

---

## 2. Cách báo cáo lỗ hổng bảo mật riêng tư

**TUYỆT ĐỐI KHÔNG** tạo GitHub Issue công khai, pull request công khai hoặc chia sẻ trên các diễn đàn mạng xã hội khi phát hiện lỗ hổng tiềm ẩn.

Vui lòng sử dụng một trong hai kênh bảo mật riêng tư dưới đây:

1. **Kênh chính thức trên GitHub (Khuyến nghị)**:
   - Sử dụng tính năng **Private Vulnerability Reporting**:
     👉 **[Gửi Báo cáo Lỗ hổng Bảo mật (GitHub Advisory)](https://github.com/QuocAnh19/Pi_Decor/security/advisories/new)**
   - Nhóm quản trị sẽ nhận được thông báo tức thì trong một không gian bảo mật khép kín để cùng phối hợp xác minh và vá lỗi.

2. **Kênh thư điện tử trực tiếp**:
   - Nếu bạn không thể sử dụng giao diện GitHub, vui lòng gửi email mô tả chi tiết lỗi kèm Proof of Concept (PoC) đến địa chỉ phụ trách dữ liệu và bảo mật được quy định trong cấu hình hệ thống (`VITE_BUSINESS_DATA_PROTECTION_EMAIL` hoặc liên hệ trực tiếp chủ sở hữu repository `@QuocAnh19`).

---

## 3. Phạm vi đánh giá bảo mật (Scope)

### ✅ Trong phạm vi (In Scope):

- Các lỗ hổng bảo mật rò rỉ dữ liệu cá nhân khách hàng (theo Nghị định 13/2023/NĐ-CP).
- Lỗ hổng xác thực, phân quyền tài khoản quản trị (Broken Authentication & Authorization Bypass).
- Lỗ hổng tấn công injection: SQL Injection, Stored/Reflected XSS, Server-Side Request Forgery (SSRF).
- Lỗ hổng thực thi mã từ xa (RCE) hoặc chiếm quyền kiểm soát máy chủ/dịch vụ đám mây (Cloudinary/PostgreSQL).
- Rò rỉ chứng chỉ xác thực, secret keys, JWT secret trong mã nguồn hoặc gói build công khai.

### ❌ Ngoài phạm vi (Out of Scope):

- Tấn công từ chối dịch vụ (DoS / DDoS) làm gián đoạn hạ tầng mạng.
- Tấn công phi kỹ thuật (Social Engineering / Phishing) nhắm vào nhân sự hoặc khách hàng.
- Báo cáo lỗi được sinh hoàn toàn tự động từ các công cụ quét bảo mật thương mại mà không có PoC cụ thể minh chứng tính khả thi của cuộc tấn công.
- Các vấn đề cấu hình thiếu bảo mật trên trình duyệt của người dùng cuối (ví dụ: máy tính bị nhiễm phần mềm độc hại).

---

## 4. Quy trình xử lý & Thời gian phản hồi mục tiêu

Nhóm bảo mật áp dụng các mốc thời gian phản hồi mục tiêu như sau (`[CẦN XÁC NHẬN]` bởi ban quản trị):

- **Xác nhận tiếp nhận ban đầu**: Trong vòng **48 giờ** làm việc kể từ thời điểm nhận được báo cáo.
- **Đánh giá sơ bộ & Phân loại rủi ro**: Trong vòng **5 ngày** làm việc (đánh giá theo thang điểm CVSS v3.1).
- **Phát hành bản vá**:
  - _Mức độ Nghiêm trọng / Cao (Critical/High)_: Cố gắng phát hành bản sửa lỗi trong vòng **7–14 ngày**.
  - _Mức độ Trung bình / Thấp (Medium/Low)_: Tích hợp vào chu kỳ phát hành định kỳ trong vòng **30 ngày**.
- **Công bố thông tin (Public Disclosure)**: Chỉ được thực hiện sau khi bản vá đã được triển khai lên môi trường sản xuất và có sự thống nhất giữa hai bên.
