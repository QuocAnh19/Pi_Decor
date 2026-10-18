> [!IMPORTANT]
> **Cần rà soát pháp lý trước khi sử dụng chính thức**: Tài liệu này là bản nháp kỹ thuật (Technical Draft) tổng hợp từ hiện trạng kiến trúc hệ thống và cơ sở dữ liệu. Doanh nghiệp cần phối hợp cùng chuyên gia pháp lý để chuẩn hóa theo quy chuẩn mẫu của cơ quan chức năng trước khi xuất bản hồ sơ tuân thủ chính thức.

# Sổ Ghi Nhận Hoạt Động Xử Lý Dữ Liệu Cá Nhân (PROCESSING_REGISTER.md)

Tài liệu thiết lập hồ sơ theo dõi các hoạt động xử lý dữ liệu cá nhân của nền tảng Pi Decor, tuân thủ nguyên tắc minh bạch và trách nhiệm giải trình theo quy định của Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.

---

## 1. Thông Tin Chung Về Đơn Vị Kiểm Soát & Xử Lý Dữ Liệu

- **Bên Kiểm soát Dữ liệu (Data Controller)**: Pi Decor Wedding & Event Decoration.
- **Đại diện pháp luật**: [CẦN XÁC NHẬN: Tên chủ sở hữu doanh nghiệp].
- **Địa chỉ liên hệ**: [CẦN XÁC NHẬN: Địa chỉ trụ sở chính].
- **Kênh tiếp nhận yêu cầu bảo vệ quyền riêng tư**: `privacy@pidecor.vn` `[CẦN XÁC NHẬN]`.

---

## 2. Bảng Danh Mục Hoạt Động Xử Lý Dữ Liệu Cá Nhân

| Bảng dữ liệu       | Các trường thông tin thu thập                                         | Phân loại dữ liệu               | Mục đích xử lý                                                              | Cơ sở pháp lý                                             | Thời gian lưu trữ                                                         | Biện pháp bảo vệ kỹ thuật                                                           |
| :----------------- | :-------------------------------------------------------------------- | :------------------------------ | :-------------------------------------------------------------------------- | :-------------------------------------------------------- | :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| **`leads`**        | Họ tên, số điện thoại, email, ngày cưới, lời nhắn, `design_snapshot`  | Dữ liệu cá nhân cơ bản          | Tiếp nhận yêu cầu tư vấn, khảo sát nhu cầu, báo giá trang trí tiệc cưới     | Sự đồng ý rõ ràng của chủ thể dữ liệu (`consent_at`)      | Tối đa **180 ngày** kể từ ngày gửi; tự động dọn dẹp bằng `purge-leads.js` | Kiểm tra regex SĐT VN, che dấu hiển thị `090****123`, phân quyền chỉ admin được xem |
| **`testimonials`** | Tên tác giả, vai trò (cô dâu/chú rể), lời nhận xét, ảnh tiệc cưới     | Dữ liệu công khai có kiểm duyệt | Giới thiệu phản hồi thực tế của khách hàng đã sử dụng dịch vụ lên trang chủ | Chấp thuận của khách hàng khi gửi biểu mẫu (`consent_at`) | Lưu trữ trong suốt thời gian hiển thị; xóa khi có yêu cầu                 | Kiểm duyệt trạng thái `pending`, **tuyệt đối không lộ `lead_id`** ra API công khai  |
| **`admins`**       | Địa chỉ email, chuỗi băm mật khẩu (`password_hash`), vai trò (`role`) | Dữ liệu định danh nội bộ        | Phân quyền và bảo mật cổng quản trị hệ thống Pi Decor                       | Lợi ích hợp pháp của tổ chức trong việc bảo vệ hệ thống   | Đến khi tài khoản bị xóa bởi Owner                                        | Băm mật khẩu bcryptjs (salt rounds 10), giới hạn đăng nhập sai `loginLimiter`       |

---

## 3. Các Bên Thứ Ba Tiếp Nhận & Xử Lý Dữ Liệu (Third-Party Processors)

| Đơn vị thứ ba                          | Vai trò trong hệ thống                                   | Loại dữ liệu tiếp nhận                                | Khu vực máy chủ lưu trữ                                      | Biện pháp an toàn & Chuyển giao dữ liệu                                               |
| :------------------------------------- | :------------------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Neon Inc. (PostgreSQL Cloud)**       | Bên Xử lý Dữ liệu (Data Processor) lưu trữ cơ sở dữ liệu | Toàn bộ dữ liệu bảng `leads`, `quotations`, `admins`  | **AWS Region Singapore (`ap-southeast-1`)** `[CẦN XÁC NHẬN]` | Kết nối mã hóa SSL bắt buộc (`verify-full`), mã hóa dữ liệu tĩnh (Encryption at Rest) |
| **Cloudinary Ltd.**                    | Bên Xử lý Dữ liệu lưu trữ hình ảnh đám mây               | Hình ảnh album dự án, ảnh đính kèm đánh giá của khách | **Khu vực máy chủ Hoa Kỳ / Toàn cầu** `[CẦN XÁC NHẬN]`       | CDN phân phối mã hóa HTTPS, phân tách thư mục theo tiền tố `pidecor/`                 |
| **Functional Software, Inc. (Sentry)** | Giám sát lỗi và hiệu năng ứng dụng                       | Ngữ cảnh lỗi ngoại lệ, URL trình duyệt (nếu có lỗi)   | **Khu vực Hoa Kỳ / EU** `[CẦN XÁC NHẬN]`                     | Tự động loại bỏ dữ liệu nhạy cảm (Data Scrubbing), không gửi mật khẩu                 |

---

## 4. Quy Trình Đáp Ứng Quyền Của Chủ Thể Dữ Liệu (Data Subject Rights)

Khách hàng có quyền yêu cầu xem, trích xuất hoặc xóa bỏ dữ liệu cá nhân của mình. Đội ngũ kỹ thuật thực hiện yêu cầu thông qua các công cụ an toàn:

### 4.1. Quyền Tiếp Cận & Xuất Dữ Liệu (Right of Access & Portability)

Khi khách hàng gửi yêu cầu xuất dữ liệu:

```bash
# Trích xuất toàn bộ thông tin lead, lịch sử hoạt động và báo giá thành định dạng JSON
node apps/api/scripts/export-lead.js --phone=0901234567

# Hoặc trích xuất theo địa chỉ email
node apps/api/scripts/export-lead.js --email=khachhang@gmail.com
```

### 4.2. Quyền Yêu Cầu Xóa Dữ Liệu (Right to Erasure / Right to be Forgotten)

Khi khách hàng rút lại sự đồng ý hoặc yêu cầu xóa dữ liệu cá nhân vĩnh viễn:

```bash
# Bước 1: Xem trước (Dry-run) số lượng hồ sơ sẽ bị xóa (an toàn, chưa thay đổi DB)
node apps/api/scripts/delete-lead.js --phone=0901234567

# Bước 2: Xác nhận xóa vĩnh viễn khỏi cơ sở dữ liệu (BẮT BUỘC cờ --confirm)
node apps/api/scripts/delete-lead.js --phone=0901234567 --confirm
```

_Lưu ý: Thao tác xóa sẽ được tự động ghi nhận vào Security Audit Log (`privacy_lead_data_erased`)._
