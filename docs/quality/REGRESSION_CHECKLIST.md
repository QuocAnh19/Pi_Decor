# Danh Sách Kiểm Tra Hồi Quy Nhanh Trước Phát Hành (REGRESSION_CHECKLIST.md)

Bảng kiểm tra nhanh (Sanity / Smoke Test) thực hiện trong **10–15 phút** trước mỗi lần deploy bản phát hành mới lên môi trường Production nhằm ngăn ngừa các lỗi hồi quy nghiêm trọng.

---

## 1. Chuẩn Bị & Kiểm Tra Tự Động (2 phút)

Trước khi thực hiện kiểm tra bằng tay, bắt buộc đảm bảo các lệnh kiểm tra tự động đã vượt qua:

```bash
# 1. Kiểm tra toàn bộ mã nguồn, kiểm thử unit/api và build
npm run verify

# 2. Kiểm tra bộ kiểm thử End-to-End
npm run e2e

# 3. Kiểm tra tính sẵn sàng trước phát hành
npm run launch:check
```

---

## 2. Bảng Kiểm Tra Hồi Quy Giao Diện & Nghiệp Vụ Chính (10 phút)

|  STT   | Phân hệ kiểm tra                 | Thao tác thực hiện                                 | Tiêu chí đạt (Pass Criteria)                                                                           | Trạng thái |
| :----: | :------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | :--------: |
| **1**  | **Khởi động & Trang chủ**        | Truy cập `https://pidecor.vn/`                     | Trang tải dưới 1.5s, không có lỗi đỏ trong Console (`F12`), hero image và logo hiển thị đúng.          |    [ ]     |
| **2**  | **Dữ liệu Dịch vụ**              | Xem khối "Dịch vụ của chúng tôi"                   | Các gói dịch vụ hiển thị đầy đủ từ API, bấm "Xem chi tiết" mở modal mượt mà.                           |    [ ]     |
| **3**  | **Lookbook & Bộ lọc**            | Chọn tab "Premium" rồi quay lại "Tất cả"           | Danh sách dự án lọc mượt mà, bấm xem album ảnh phóng to hoạt động tốt.                                 |    [ ]     |
| **4**  | **Bản đồ Địa điểm**              | Mở trang `/ban-do`                                 | Bản đồ tải marker bình thường, bấm vào địa điểm xem được popup.                                        |    [ ]     |
| **5**  | **Xưởng Studio Canvas**          | Mở `/studio`, thử đổi màu rèm                      | Canvas SVG đổi màu lập tức, các slot hoa và rèm không bị biến dạng hoặc tràn khung.                    |    [ ]     |
| **6**  | **Gửi Lead & Ràng buộc Consent** | Điền họ tên, SĐT `0901234567`, không tick consent  | Nút "Gửi" bị vô hiệu hóa; sau khi tick chọn thì gửi thành công và hiện thông báo xác nhận.             |    [ ]     |
| **7**  | **Đăng nhập Quản trị**           | Vào `/admin/login`, đăng nhập tài khoản admin      | Đăng nhập thành công, token được lưu an toàn, chuyển hướng vào `/admin` không bị giật lag.             |    [ ]     |
| **8**  | **Xem Lead Mới Trong CRM**       | Mở `/admin/leads`                                  | Lead vừa gửi ở bước 6 xuất hiện ngay trên đầu danh sách kèm snapshot thiết kế Studio.                  |    [ ]     |
| **9**  | **Đổi trạng thái & Timeline**    | Đổi trạng thái lead sang "contacted", gõ 1 ghi chú | Trạng thái cập nhật tức thì, dòng thời gian ghi nhận đúng nội dung và người thực hiện.                 |    [ ]     |
| **10** | **Tạo Báo Giá Nhanh**            | Bấm Tạo báo giá, nhập 1 hạng mục, bấm Lưu          | Sinh đúng mã số nguyên tử định dạng `BG-YYYY-XXXX`, tính đúng tổng tiền.                               |    [ ]     |
| **11** | **Điều Hướng & Refresh**         | Đang ở `/admin/leads`, bấm F5 (Reload)             | Trang tải lại nguyên vẹn tại màn hình hiện tại, **không bị lỗi 404** hay văng ra trang login.          |    [ ]     |
| **12** | **Đăng Xuất An Toàn**            | Bấm nút Đăng xuất tại góc trên trang Admin         | Đăng xuất thành công, Refresh Token bị thu hồi; thử bấm nút "Back" trên trình duyệt không thể vào lại. |    [ ]     |

---

## 3. Quyết Định Phát Hành (Release Gate)

- [ ] **PASS**: Toàn bộ 12 mục trên đều đạt tiêu chuẩn. Được phép tiến hành deploy sản phẩm.
- [ ] **BLOCK**: Có ít nhất 1 mục bị lỗi. Hủy bỏ đợt phát hành, mở issue khẩn cấp và khắc phục ngay.
