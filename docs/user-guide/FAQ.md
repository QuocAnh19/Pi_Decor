# Các Câu Hỏi Thường Gặp Của Quản Trị Viên (FAQ.md)

Tài liệu giải đáp các thắc mắc và tình huống thường gặp trong quá trình vận hành hệ thống Pi Decor dành cho quản trị viên và chủ doanh nghiệp.

---

## 1. Tài Khoản & Bảo Mật

### Q1: Tôi quên mật khẩu đăng nhập tài khoản quản trị thì phải làm sao?

> **Trả lời**: Vì lý do an toàn tuyệt đối, mật khẩu quản trị được băm một chiều bằng thuật toán `bcrypt` và không thể giải mã ngược để xem lại. Bạn vui lòng liên hệ Bộ phận Kỹ thuật để thực hiện quy trình đặt lại mật khẩu an toàn qua công cụ dòng lệnh:
>
> ```bash
> cd apps/api && npm run seed -- --reset-password
> ```

### Q2: Tại sao hệ thống thỉnh thoảng tự động đăng xuất tài khoản?

> **Trả lời**: Hệ thống áp dụng cơ chế xác thực kép với Access Token ngắn hạn (15 phút) và Refresh Token xoay vòng (7 ngày). Nếu bạn không thao tác trên trang trong thời gian dài hoặc đổi mật khẩu trên thiết bị khác, hệ thống sẽ tự động thu hồi phiên để chống đánh cắp tài khoản. Bạn chỉ cần đăng nhập lại để tiếp tục làm việc.

### Q3: Tôi có thể đăng nhập cùng một tài khoản trên máy tính và điện thoại không?

> **Trả lời**: Có. Hệ thống hỗ trợ nhiều phiên làm việc đồng thời cho cùng một tài khoản. Tuy nhiên, nếu bạn bấm nút **"Đăng xuất khỏi tất cả thiết bị"**, mọi phiên trên các thiết bị khác sẽ bị đóng ngay lập tức.

---

## 2. Quản Lý Khách Hàng (Leads) & Báo Giá

### Q4: Khách hàng báo đã gửi đăng ký tư vấn nhưng tôi không thấy trên trang quản trị?

> **Trả lời**: Vui lòng kiểm tra các điểm sau:
>
> 1. Kiểm tra bộ lọc trạng thái tại `/admin/leads`: Mặc định bảng có thể đang lọc theo một trạng thái cụ thể, hãy chọn tab **"Tất cả"** hoặc **"Mới tiếp nhận"**.
> 2. Đảm bảo kết nối internet ổn định và bấm phím `F5` để làm mới danh sách.
> 3. Khách hàng bắt buộc phải nhập đúng định dạng số điện thoại Việt Nam (10 chữ số, đầu số hợp lệ 03, 05, 07, 08, 09) và tick chọn đồng ý chính sách bảo mật thì biểu mẫu mới được gửi thành công.

### Q5: Số báo giá `BG-YYYY-XXXX` được đánh số như thế nào? Có bị trùng lặp không?

> **Trả lời**: Số báo giá được sinh tự động và nguyên tử trong cơ sở dữ liệu qua bảng `quotation_counters`. Mỗi năm hệ thống sẽ bắt đầu từ số `0001` (ví dụ: `BG-2026-0001`, `BG-2026-0002`). Quy trình này được bảo vệ bởi khóa giao dịch nên hoàn toàn không xảy ra tình trạng trùng lặp số báo giá ngay cả khi nhiều nhân viên cùng bấm tạo báo giá tại một thời điểm.

### Q6: Nếu tôi xóa một bản ghi báo giá nháp, số báo giá tiếp theo có bị nhảy cóc không?

> **Trả lời**: Không. Cơ chế sinh mã số của Pi Decor đảm bảo tính tuần tự hoặc bảo toàn chuỗi mã kinh doanh theo quy định kế toán, không gây gián đoạn số thứ tự của các báo giá chính thức tiếp theo.

---

## 3. Quản Lý Dự Án, Địa Điểm & Hình Ảnh

### Q7: Tôi muốn chuẩn bị nội dung dự án trước nhưng chưa muốn khách hàng nhìn thấy thì làm thế nào?

> **Trả lời**: Khi tạo hoặc chỉnh sửa dự án tại `/admin/projects`, bạn hãy chọn trạng thái **"Bản nháp"** (Draft). Hệ thống đã được lập trình để API công khai tự động ẩn các dự án nháp. Dự án chỉ xuất hiện trên website khi bạn chuyển sang trạng thái **"Xuất bản"** (Published).

### Q8: Nếu tôi xóa một Nhà hàng / Địa điểm tiệc cưới thì các Dự án Lookbook gắn với địa điểm đó có bị xóa mất không?

> **Trả lời**: Không. Hệ thống áp dụng quy tắc an toàn khóa ngoại `ON DELETE SET NULL`. Khi bạn xóa một địa điểm, trường địa điểm của các dự án liên quan sẽ tự động chuyển về trạng thái trống mà không làm mất hình ảnh hay nội dung của dự án.

### Q9: Khi tải ảnh lên bị báo lỗi thì nguyên nhân do đâu?

> **Trả lời**: Hệ thống áp dụng các tiêu chuẩn an toàn sau:
>
> - **Dung lượng tối đa**: 10MB cho mỗi tệp ảnh. Nếu ảnh từ máy cơ có dung lượng lớn (15–20MB), vui lòng nén ảnh trước khi tải.
> - **Định dạng cho phép**: Chỉ chấp nhận các định dạng ảnh phổ biến gồm JPG, JPEG, PNG, WEBP, GIF và vector SVG.

---

## 4. Quyền Riêng Tư & Xử Lý Dữ Liệu Khách Hàng (Nghị Định 13)

### Q10: Khách hàng yêu cầu xóa toàn bộ thông tin cá nhân thì xử lý thế nào?

> **Trả lời**: Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, khách hàng có quyền yêu cầu xóa thông tin của mình. Quản trị viên cần ghi nhận yêu cầu và gửi thông tin (Email hoặc Số điện thoại của khách) cho Bộ phận Kỹ thuật để chạy công cụ xóa dữ liệu cá nhân chuyên dụng có lưu log kiểm toán:
>
> ```bash
> node apps/api/scripts/delete-lead.js --email="khach@example.com" --confirm
> ```

### Q11: Khách hàng yêu cầu cung cấp bản sao dữ liệu cá nhân đang lưu trữ thì lấy ở đâu?

> **Trả lời**: Bộ phận Kỹ thuật sẽ hỗ trợ xuất file dữ liệu cá nhân định dạng chuẩn JSON qua lệnh:
>
> ```bash
> node apps/api/scripts/export-lead.js --email="khach@example.com"
> ```
>
> File kết quả bao gồm toàn bộ lịch sử tư vấn, thiết kế và thông tin liên hệ để gửi trực tiếp cho khách hàng.

---

## 5. Đánh Giá Khách Hàng & Studio Phối Cảnh

### Q12: Khách hàng gửi đánh giá trên website nhưng sao không thấy hiển thị ngay trên trang chủ?

> **Trả lời**: Nhằm bảo vệ hình ảnh thương hiệu và tránh thư rác (spam), mọi đánh giá gửi lên đều ở trạng thái **"Chờ duyệt"** (Pending). Đánh giá chỉ xuất hiện công khai trên trang chủ sau khi quản trị viên vào mục `/admin/testimonials` và bấm nút **"Duyệt"**.

### Q13: Mẫu phông cưới tải lên Studio có cần lưu ý gì về đồ họa không?

> **Trả lời**: Mẫu phông cưới cho Studio phải ở định dạng chuẩn vector SVG, kích thước tỷ lệ 16:9 hoặc tiêu chuẩn sân khấu. Hệ thống tự động làm sạch mã độc (XSS Sanitizer) trước khi lưu trữ nên hãy đảm bảo file SVG không chứa mã nhúng JavaScript bên ngoài.
