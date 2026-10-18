# Bảng Kiểm Tra Nghiệm Thu Dành Cho Chủ Doanh Nghiệp (UAT_CHECKLIST.md)

Tài liệu này được viết bằng ngôn ngữ thường ngày, giúp Chủ doanh nghiệp và Quản lý thương hiệu Pi Decor trực tiếp thao tác, kiểm tra và nghiệm thu các tính năng trên website thực tế trước khi đưa vào vận hành chính thức.

---

## 1. Hướng Dẫn Thực Hiện Nghiệm Thu

1. Mở trình duyệt web (Google Chrome hoặc Safari) trên máy tính hoặc điện thoại.
2. Thực hiện lần lượt từng thao tác theo cột **"Cách bạn thao tác thử"**.
3. Quan sát màn hình xem có đúng như mô tả ở cột **"Kết quả chuẩn cần thấy"** hay không.
4. Đánh dấu `[x]` vào ô **Đạt** nếu hoạt động tốt, hoặc ô **Không đạt** kèm ghi chú nếu phát hiện điểm chưa ưng ý.

---

## 2. Danh Sách Kiểm Tra Trải Nghiệm Khách Hàng (Website Công Khai)

|  STT  | Khu vực kiểm tra               | Cách bạn thao tác thử                                                                                                 | Kết quả chuẩn cần thấy                                                                                                                  | Đạt | Không đạt | Ghi chú của bạn |
| :---: | :----------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- | :-: | :-------: | :-------------- |
| **1** | Trang chủ & Giới thiệu         | Mở trang chủ website trên máy tính và điện thoại.                                                                     | Giao diện mở nhanh, hình ảnh tiệc cưới sắc nét, không bị vỡ bố cục, hotline và logo Pi Decor hiển thị rõ.                               | [ ] |    [ ]    |                 |
| **2** | Danh mục Dịch vụ cưới          | Cuộn xuống mục "Dịch vụ của chúng tôi", bấm vào xem chi tiết một gói dịch vụ.                                         | Bảng thông tin chi tiết hiện lên rõ ràng các hạng mục trang trí, hình ảnh đẹp, có nút bấm liên hệ tiện lợi.                             | [ ] |    [ ]    |                 |
| **3** | Bộ sưu tập mẫu tiệc (Lookbook) | Bấm thử nút lọc "Phân khúc Premium" hoặc "Standard" trong thư viện ảnh.                                               | Danh sách ảnh tự động lọc đúng theo tầm giá bạn chọn; bấm vào ảnh xem được album phóng to rõ nét.                                       | [ ] |    [ ]    |                 |
| **4** | Bản đồ nhà hàng liên kết       | Vào trang Bản đồ, bấm thử vào biểu tượng một khách sạn tiệc cưới.                                                     | Xuất hiện khung nhỏ giới thiệu tên khách sạn, địa chỉ và các tiệc cưới Pi Decor đã từng trang trí tại đó.                               | [ ] |    [ ]    |                 |
| **5** | Khách gửi lời nhận xét         | Cuộn xuống phần "Cảm nhận khách hàng", điền tên, chọn 5 sao và bấm nút Gửi đánh giá.                                  | Xuất hiện lời cảm ơn nhẹ nhàng: "Đánh giá của bạn đã được ghi nhận và sẽ hiển thị sau khi duyệt". Nhận xét chưa hiện ngay ra ngoài web. | [ ] |    [ ]    |                 |
| **6** | Xưởng phối màu Studio          | Vào mục "Studio thiết kế", thử bấm đổi màu rèm nền và cổng hoa.                                                       | Màu sắc trên màn hình đổi ngay tức thì theo màu bạn chọn, hình ảnh mượt mà, bấm "Tải ảnh về" lưu được ảnh mẫu phối cảnh.                | [ ] |    [ ]    |                 |
| **7** | Gửi form nhận tư vấn           | Sau khi phối màu xong, bấm "Lưu & Nhận tư vấn", nhập tên, số điện thoại (10 số). **Thử KHÔNG tick ô Đồng ý bảo mật**. | Nút gửi bị mờ/khóa lại, thông báo nhắc khách hàng cần đồng ý điều khoản bảo mật mới được gửi thông tin.                                 | [ ] |    [ ]    |                 |
| **8** | Gửi thông tin thành công       | Tích chọn ô "Tôi đồng ý với chính sách bảo mật" rồi bấm "Gửi yêu cầu".                                                | Màn hình thông báo gửi thành công xuất hiện; thông tin khách hàng ngay lập tức được chuyển vào trang quản lý nội bộ.                    | [ ] |    [ ]    |                 |

---

## 3. Danh Sách Kiểm Tra Trang Quản Lý Nội Bộ (Dành Cho Chủ Tiệm & Nhân Viên)

|  STT   | Khu vực kiểm tra           | Cách bạn thao tác thử                                                                                | Kết quả chuẩn cần thấy                                                                                                             | Đạt | Không đạt | Ghi chú của bạn |
| :----: | :------------------------- | :--------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :-: | :-------: | :-------------- |
| **9**  | Đăng nhập quản trị         | Truy cập đường dẫn trang quản trị `/admin`, điền email và mật khẩu đúng.                             | Đăng nhập thành công vào bảng điều khiển; hiển thị tổng số khách mới, số dự án và các mục cần xử lý.                               | [ ] |    [ ]    |                 |
| **10** | Xem khách hàng mới gửi về  | Bấm vào mục "Khách hàng" (Leads).                                                                    | Thấy ngay thông tin khách vừa gửi ở bước 8 (tên, SĐT, ngày cưới dự kiến, bản phối màu khách đã chọn trong Studio).                 | [ ] |    [ ]    |                 |
| **11** | Chuyển trạng thái chăm sóc | Bấm đổi trạng thái của khách từ "Mới" sang "Đang liên hệ tư vấn".                                    | Trạng thái đổi màu sắc tương ứng; mục "Lịch sử hoạt động" tự động ghi nhận nhân viên nào vừa thực hiện lúc mấy giờ.                | [ ] |    [ ]    |                 |
| **12** | Ghi chú cuộc gọi tư vấn    | Mở hồ sơ khách, gõ ghi chú: "Cô dâu thích tông cam pastel, tổ chức tại White Palace" và bấm Lưu.     | Dòng ghi chú hiện lên ngay trong lịch sử chăm sóc, giúp các bạn nhân viên khác cùng nắm được thông tin.                            | [ ] |    [ ]    |                 |
| **13** | Lập bảng báo giá tiệc cưới | Bấm nút "Tạo báo giá" cho khách, thêm 2-3 hạng mục (backdrop, bàn gallery), nhập đơn giá và bấm Lưu. | Báo giá tự động sinh mã chuyên nghiệp (dạng `BG-2026-0001`), tính đúng tổng tiền và chiết khấu; bấm tải được file văn bản báo giá. | [ ] |    [ ]    |                 |
| **14** | Duyệt nhận xét khách hàng  | Bấm vào mục "Đánh giá", xem nhận xét gửi ở bước 5 và bấm nút "Phê duyệt".                            | Nhận xét chuyển sang trạng thái Đã duyệt; ra lại trang chủ kiểm tra thấy nhận xét đó đã xuất hiện đẹp mắt.                         | [ ] |    [ ]    |                 |
| **15** | Đổi thứ tự ưu tiên dịch vụ | Vào mục "Dịch vụ", bấm nút mũi tên di chuyển gói "Tiệc cưới Trọn gói" lên vị trí đầu tiên.           | Lưu thành công; ra lại trang chủ thấy gói dịch vụ đó đã nhảy lên vị trí đầu tiên đúng như bạn sắp xếp.                             | [ ] |    [ ]    |                 |
| **16** | Đổi mật khẩu an toàn       | Vào mục "Cài đặt cá nhân", nhập mật khẩu cũ và đổi sang mật khẩu mới.                                | Đổi thành công; thử đăng xuất rồi đăng nhập lại bằng mật khẩu mới trơn tru.                                                        | [ ] |    [ ]    |                 |

---

## 4. Biên Bản Xác Nhận Nghiệm Thu

Sau khi hoàn tất kiểm tra thực tế toàn bộ các mục nêu trên:

- **Tổng số hạng mục kiểm tra**: 16 hạng mục.
- **Số hạng mục Đạt**: ...... / 16.
- **Số hạng mục Cần chỉnh sửa thêm**: ...... / 16.

**Kết luận của Chủ doanh nghiệp**:

- [ ] **ĐỒNG Ý NGHIỆM THU**: Hệ thống đáp ứng đúng yêu cầu và sẵn sàng đưa vào vận hành đón khách.
- [ ] **YÊU CẦU ĐIỀU CHỈNH THÊM**: Cần hoàn thiện các điểm ghi chú trước khi phát hành chính thức.

_Ngày ...... tháng ...... năm 2026_

**ĐẠI DIỆN CHỦ DOANH NGHIỆP PI DECOR**
_(Ký và ghi rõ họ tên)_
<br/><br/><br/><br/>

---
