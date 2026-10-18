# Quy Trình Sao Lưu & Phục Hồi Cơ Sở Dữ Liệu (BACKUP_RESTORE.md)

Tài liệu quy định chiến lược sao lưu dự phòng, phục hồi sau thảm họa (Disaster Recovery), và kết quả diễn tập tự động cho nền tảng Pi Decor.

---

## 1. Mục Tiêu Phục Hồi (RPO & RTO)

- **RPO (Recovery Point Objective — Mức độ mất mát dữ liệu tối đa chấp nhận được)**:
  - Sao lưu tự động định kỳ bằng `pg_dump`: Mục tiêu **≤ 24 giờ** `[CẦN XÁC NHẬN: chủ doanh nghiệp quyết định]`.
  - Khôi phục theo thời điểm (Point-in-time Recovery - PITR) qua Neon Cloud: Mục tiêu **≤ 1 giờ** (tùy thuộc gói dịch vụ Neon).
- **RTO (Recovery Time Objective — Thời gian tối đa để khôi phục dịch vụ)**:
  - Khôi phục từ bản sao lưu tệp dump hoặc kích hoạt Neon branch mới: Mục tiêu **≤ 30 phút** `[CẦN XÁC NHẬN: SLA cam kết]`.

---

## 2. Chiến Lược & Tần Suất Sao Lưu

> [!IMPORTANT]
> **Ràng buộc hạ tầng Neon Cloud**: Neon hỗ trợ tính năng tạo branch và khôi phục dữ liệu theo thời điểm (Point-in-time recovery). Tuy nhiên, thời gian lưu giữ lịch sử biến đổi (History Retention) phụ thuộc vào gói dịch vụ đăng ký `[CẦN XÁC NHẬN: gói Free lưu 7 ngày, gói Pro lưu 30 ngày]`. Vì vậy, hệ thống bắt buộc duy trì việc lập lịch sao lưu ngoại tuyến độc lập bằng `pg_dump` qua chuỗi kết nối trực tiếp (`DATABASE_URL_DIRECT`) và lưu trữ bên ngoài hạ tầng Neon.

- **Định dạng tệp sao lưu**: Sử dụng lệnh `pg_dump -Fc` (PostgreSQL Custom Archive Format), hỗ trợ nén dung lượng cao và khôi phục chọn lọc linh hoạt.
- **Tần suất thực hiện**:
  - Tự động chạy hằng ngày vào lúc 02:00 sáng (UTC+7).
  - Tự động diễn tập (Drill) hằng tuần qua GitHub Actions workflow.
- **Nơi lưu trữ an toàn ngoài hạ tầng chính**:
  - Tệp `.dump` được mã hóa đối xứng bằng GPG (`gpg --symmetric --cipher-algo AES256`).
  - Đẩy lên kho lưu trữ đám mây độc lập (ví dụ Cloudflare R2, AWS S3 Standard-Infrequent Access hoặc Backblaze B2).
- **Sao lưu tài nguyên hình ảnh (Cloudinary)**:
  - > [!WARNING]
  - > Cloudinary không phải là kho sao lưu bất biến: Bắt buộc định kỳ hằng tuần chạy lệnh `npm run media:audit` để kiểm toán tệp và xuất danh sách `public_id` lưu trữ offline.

---

## 3. Các Lệnh Thao Tác Chuẩn (SOP)

### 3.1. Thực hiện sao lưu thủ công (db-backup.sh)

```bash
# Đọc chuỗi kết nối từ biến môi trường và tạo bản sao lưu có gắn dấu thời gian
DATABASE_URL_DIRECT="postgresql://..." ./scripts/db-backup.sh

# Hoặc chỉ định tệp đầu ra cụ thể
./scripts/db-backup.sh /path/to/my_backup.dump
```

### 3.2. Thực hiện phục hồi dữ liệu (db-restore.sh)

```bash
# Phục hồi vào cơ sở dữ liệu thử nghiệm/staging
TARGET_DATABASE_URL="postgresql://..." ./scripts/db-restore.sh backups/pidecor_20261018.dump

# Phục hồi vào cơ sở dữ liệu Production (BẮT BUỘC cờ an toàn --i-know)
TARGET_DATABASE_URL="postgresql://..." ./scripts/db-restore.sh backups/pidecor_20261018.dump --i-know
```

### 3.3. Quy trình khôi phục nhanh qua Neon Branching (Zero-Downtime PITR)

Khi cần cứu vãn dữ liệu sau sự cố nhầm lẫn:

1. Đăng nhập Neon Console hoặc dùng Neon CLI.
2. Tạo một Branch mới trỏ về thời điểm trước khi xảy ra sự cố:
   ```bash
   neon branch create --name recovery-branch --from-timestamp "2026-10-18T10:00:00Z"
   ```
3. Kết nối kiểm tra schema và số lượng bản ghi trên recovery-branch.
4. Tráo đổi connection string của ứng dụng hoặc xuất dữ liệu cần thiết rồi xóa branch tạm.

---

## 4. Nhật Ký Kết Quả Diễn Tập Gần Nhất (Drill Execution Log)

Kết quả diễn tập tự động từ kịch bản `scripts/backup-restore-drill.sh`:

- **Thời gian diễn tập**: 2026-10-18 23:55:00 UTC+7.
- **Môi trường thực hiện**: Container PostgreSQL 16 cô lập (CI Runner & Docker Local).
- **Quy trình kiểm chứng**:
  1. Dựng DB nguồn `pidecor_drill_src` -> Áp dụng 4 tệp migration -> Nạp dữ liệu seed chuẩn.
  2. Tạo bản sao lưu dump `drill_test.dump` qua `db-backup.sh`.
  3. Dựng DB đích `pidecor_drill_dest` trống -> Phục hồi qua `db-restore.sh`.
  4. Đối chiếu khớp 100% số lượng dòng trên 9 bảng dữ liệu cốt lõi (`admins`, `leads`, `materials`, `services`, `venues`, `projects`, `quotations`, `testimonials`, `studio_templates`).
- **Kết luận**: **PASS** (Hệ thống sẵn sàng phục hồi trọn vẹn trong trường hợp thảm họa).
