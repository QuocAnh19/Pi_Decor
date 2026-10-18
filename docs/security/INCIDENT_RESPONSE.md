# Kế Hoạch Ứng Phó Sự Cố An Ninh Thông Tin (INCIDENT_RESPONSE.md)

Tài liệu quy định quy trình chuẩn (SOP) để phát hiện, phân loại, ngăn chặn, khắc phục và báo cáo khi xảy ra sự cố an ninh thông tin hoặc rò rỉ dữ liệu trong hệ thống Pi Decor.

---

## 1. Quy Trình 6 Bước Xử Lý Sự Cố

```
  [1. Phát hiện] ──> [2. Đánh giá] ──> [3. Khoanh vùng]
                                             │
  [6. Hậu kiểm]  <── [5. Thông báo] <── [4. Khắc phục]
```

### Bước 1: Phát Hiện Sự Cố (Detection)

- **Nguồn cảnh báo**: Cảnh báo lỗi đột biến từ Sentry, thông báo bất thường từ Cloudinary, phát hiện quét cổng hoặc tấn công từ chối dịch vụ, phản hồi từ khách hàng hoặc người dùng.
- **Hành động ban đầu**: Kích hoạt kênh liên lạc khẩn cấp giữa Trưởng nhóm kỹ thuật và Chủ sở hữu hệ thống (Owner).

### Bước 2: Đánh Giá & Phân Loại Mức Độ (Triage & Severity)

- **Mức độ 1 (Khẩn cấp / Critical)**: Rò rỉ cơ sở dữ liệu khách hàng (PII), lộ mã khóa `JWT_SECRET` hoặc `CLOUDINARY_API_SECRET`, hệ thống bị chiếm quyền kiểm soát admin.
- **Mức độ 2 (Nghiêm trọng / High)**: Dịch vụ ngừng hoạt động (Downtime) kéo dài, tấn công brute-force mật khẩu đang diễn ra diện rộng.
- **Mức độ 3 (Trung bình / Medium)**: Một số ảnh trên Cloudinary bị lỗi, phát hiện lỗ hổng thư viện dependencies mức cao chưa bị khai thác.

### Bước 3: Khoanh Vùng & Cô Lập (Containment)

- Tạm thời khóa cổng API hoặc bật chế độ bảo trì (Maintenance Mode) nếu sự cố có nguy cơ lan rộng.
- Chặn dải địa chỉ IP của kẻ tấn công tại tầng Cloudflare / Reverse Proxy.
- Cô lập phiên làm việc bị nghi ngờ.

### Bước 4: Thu Hồi Khóa Bí Mật & Khắc Phục (Eradication & Recovery)

Thực hiện các thao tác kỹ thuật theo hướng dẫn chi tiết tại [RUNBOOK.md](../RUNBOOK.md):

1. **Xoay vòng khóa bí mật JWT (Rotate JWT_SECRET)**:
   - Tạo chuỗi bí mật mới (tối thiểu 32 ký tự ngẫu nhiên an toàn):
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Cập nhật biến môi trường `JWT_SECRET` trên máy chủ và khởi động lại API server. Toàn bộ Access Token cũ lập tức bị vô hiệu hóa.
2. **Thu hồi toàn bộ phiên đăng nhập (Logout All Admins)**:
   - Gọi endpoint hoặc chạy truy vấn trực tiếp vào PostgreSQL:
     ```sql
     UPDATE refresh_tokens SET revoked_at = NOW() WHERE revoked_at IS NULL;
     ```
3. **Đổi mã khóa dịch vụ Cloudinary**:
   - Truy cập trang quản trị Cloudinary Dashboard, sinh `API Secret` mới và cập nhật biến `CLOUDINARY_API_SECRET` trên máy chủ.
4. **Khôi phục dữ liệu từ bản sao lưu (Restore from Backup)**:
   - Nếu dữ liệu bị phá hoại hoặc xóa trái phép, tiến hành khôi phục bản snapshot PostgreSQL gần nhất (Neon Point-in-time Restore hoặc file dump pg_dump).

### Bước 5: Thông Báo Sự Cố (Notification)

- **Thông báo nội bộ**: Cập nhật tiến độ xử lý cho Chủ doanh nghiệp Pi Decor mỗi 30 phút trong thời gian ứng cứu.
- **Thông báo khách hàng & Cơ quan quản lý**:
  - Đối với các sự cố rò rỉ dữ liệu cá nhân (PII), việc gửi thông báo đến các khách hàng bị ảnh hưởng và cơ quan có thẩm quyền phải tuân thủ nghiêm ngặt theo quy định của Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
  - > [!IMPORTANT]
  - > **Nội dung thông báo, thời hạn trình báo và quy trình pháp lý**: [CẦN XÁC NHẬN với người có chuyên môn pháp lý của doanh nghiệp trước khi phát đi thông cáo chính thức].

### Bước 6: Rút Kinh Nghiệm & Hậu Kiểm (Post-Mortem)

- Tổ chức cuộc họp đánh giá sau sự cố (trong vòng 48 giờ sau khi khắc phục xong).
- Xác định nguyên nhân gốc rễ (Root Cause Analysis - RCA).
- Lập tài liệu Post-Mortem và bổ sung các ca kiểm thử tự động để ngăn chặn sự cố tương tự lặp lại.

---

## 2. Biểu Mẫu Báo Cáo Hậu Sự Cố (Incident Post-Mortem Template)

```markdown
# Báo Cáo Sự Cố An Ninh [MÃ SỰ CỐ: INC-YYYYMMDD-XX]

- **Thời gian bắt đầu**: YYYY-MM-DD HH:MM
- **Thời gian phát hiện**: YYYY-MM-DD HH:MM
- **Thời gian khắc phục xong**: YYYY-MM-DD HH:MM
- **Tổng thời gian gián đoạn**: ... phút
- **Người phụ trách ứng cứu**: [Tên kỹ sư / Quản trị viên]
- **Mức độ nghiêm trọng**: [Critical / High / Medium]

### 1. Tóm tắt diễn biến sự cố

[Mô tả ngắn gọn điều gì đã xảy ra, triệu chứng phát hiện ban đầu]

### 2. Nguyên nhân gốc rễ (Root Cause)

[Nguyên nhân kỹ thuật hoặc quy trình dẫn đến sự cố]

### 3. Mức độ ảnh hưởng

- Số lượng khách hàng bị ảnh hưởng: ...
- Dữ liệu bị rò rỉ hoặc sai lệch (nếu có): ...
- Thiệt hại về mặt kinh doanh / vận hành: ...

### 4. Các bước đã xử lý để khắc phục

1. ...
2. ...

### 5. Hành động phòng ngừa trong tương lai (Action Items)

| Hành động                               | Người phụ trách | Hạn chót   | Trạng thái |
| :-------------------------------------- | :-------------- | :--------- | :--------- |
| Bổ sung kiểm tra tự động / Chặn lỗ hổng | ...             | YYYY-MM-DD | Đang làm   |
| Cập nhật tài liệu Runbook / Quy trình   | ...             | YYYY-MM-DD | Đang làm   |
```
