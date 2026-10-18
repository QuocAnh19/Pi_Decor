# Danh sách Câu chuyện Người dùng (USER_STORIES.md)

Tài liệu này định nghĩa các User Story theo từng nhóm vai trò trong hệ thống Pi Decor, đi kèm tiêu chí chấp nhận chuẩn hóa theo định dạng **Given / When / Then** để phục vụ việc phát triển tính năng và viết bài kiểm thử tự động (Unit / Integration / E2E).

---

## 1. Nhóm Khách tham quan (Visitor)

### US-001: Khám phá danh mục dịch vụ trang trí tiệc

- **Là** một khách tham quan website,
- **Tôi muốn** xem danh sách các gói dịch vụ (tiệc cưới, thôi nôi, sự kiện) cùng các hạng mục chi tiết,
- **Để** lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của mình.
- **Tiêu chí chấp nhận**:
  - **Given** Khách truy cập vào trang chủ `/`,
  - **When** Cuộn xuống khu vực "Dịch vụ của chúng tôi",
  - **Then** Hệ thống hiển thị các thẻ dịch vụ tải từ `GET /api/services` kèm hình ảnh cover, tagline và danh sách hạng mục.

### US-002: Lọc Lookbook dự án thực tế theo phân khúc giá

- **Là** một khách tham quan,
- **Tôi muốn** lọc danh mục dự án theo mức ngân sách Standard hoặc Premium,
- **Để** tham khảo các phong cách thiết kế thực tế tương ứng với mức chi trả.
- **Tiêu chí chấp nhận**:
  - **Given** Khách đang ở khu vực Lookbook trên trang chủ,
  - **When** Nhấn chọn tab lọc "Premium",
  - **Then** Danh sách chỉ hiển thị các dự án có thuộc tính `price_tier = 'premium'` và nhãn huy hiệu tương ứng.

### US-003: Xem địa điểm tổ chức trên bản đồ tương tác

- **Là** một khách tham quan,
- **Tôi muốn** xem các nhà hàng và địa điểm tổ chức liên kết trên bản đồ,
- **Để** tìm kiếm các mẫu trang trí đã từng thi công tại địa điểm tôi dự định đặt tiệc.
- **Tiêu chí chấp nhận**:
  - **Given** Người dùng điều hướng tới trang `/ban-do`,
  - **When** Bản đồ Leaflet tải hoàn tất với dữ liệu từ `GET /api/venues`,
  - **Then** Các điểm đánh dấu (marker) xuất hiện trên bản đồ; khi nhấn vào marker sẽ mở popup thông tin và liên kết tới các dự án liên quan.

### US-004: Gửi đánh giá trải nghiệm dịch vụ

- **Là** một khách hàng đã từng sử dụng dịch vụ của Pi Decor,
- **Tôi muốn** gửi đánh giá xếp hạng và lời nhận xét,
- **Để** đóng góp ý kiến phản hồi cho thương hiệu.
- **Tiêu chí chấp nhận**:
  - **Given** Biểu mẫu gửi đánh giá tại trang chủ,
  - **When** Nhập tên, xếp hạng sao (1-5), nội dung và nhấn gửi (`POST /api/testimonials`),
  - **Then** Hệ thống ghi nhận với trạng thái `pending` và hiển thị thông báo "Cảm ơn bạn! Đánh giá sẽ được hiển thị sau khi duyệt". Đánh giá chưa xuất hiện công khai ngay lập tức.

---

## 2. Nhóm Khách hàng tiềm năng (Prospect / Lead)

### US-005: Tùy biến màu sắc và rèm trên phông nền Studio

- **Là** một khách hàng tiềm năng,
- **Tôi muốn** chọn vật liệu vải và đổi màu rèm trên canvas Studio,
- **Để** hình dung thực tế sự kết hợp màu sắc cho ngày cưới.
- **Tiêu chí chấp nhận**:
  - **Given** Khách đang mở trang `/studio` với mẫu phông nền mặc định,
  - **When** Chọn một vị trí rèm và chọn màu từ bảng màu (hoặc chọn chất liệu vải),
  - **Then** Khối rèm trên canvas SVG đổi màu lập tức theo thời gian thực mà không làm vỡ bố cục tổng thể.

### US-006: Lưu thiết kế và gửi yêu cầu tư vấn kèm xác nhận bảo mật

- **Là** một khách hàng đã hoàn thiện bản phối trong Studio,
- **Tôi muốn** lưu thiết kế và gửi thông tin liên hệ kèm thỏa thuận bảo mật dữ liệu,
- **Để** đội ngũ Pi Decor liên hệ tư vấn và khảo sát thực tế.
- **Tiêu chí chấp nhận**:
  - **Given** Khách nhấn nút "Lưu thiết kế & Nhận tư vấn",
  - **When** Điền đầy đủ họ tên, số điện thoại hợp lệ, tích chọn "Tôi đồng ý với Chính sách bảo mật" và bấm "Gửi yêu cầu",
  - **Then** Hệ thống tạo bản ghi lead mới tại `POST /api/leads` kèm `design_snapshot`, và chuyển hướng người dùng tới màn hình xác nhận thành công.
  - **And** Nếu không tích chọn đồng ý xử lý dữ liệu, nút gửi bị vô hiệu hóa.

---

## 3. Nhóm Quản trị viên (Admin)

### US-007: Đăng nhập quản trị an toàn & Chặn tấn công lạm dụng

- **Là** một quản trị viên,
- **Tôi muốn** đăng nhập vào trang quản trị bằng email và mật khẩu an toàn,
- **Để** truy cập các công cụ vận hành nội bộ.
- **Tiêu chí chấp nhận**:
  - **Given** Quản trị viên truy cập `/admin/login`,
  - **When** Nhập đúng email/mật khẩu và gửi,
  - **Then** Hệ thống trả về JWT Access Token và lưu trữ Refresh Token trong DB, điều hướng vào `/admin`.
  - **And** Nếu nhập sai quá 10 lần trong 15 phút, IP bị chặn với mã lỗi 429 từ `loginLimiter`.

### US-008: Quản lý trạng thái xử lý khách hàng tiềm năng

- **Là** một chuyên viên tư vấn khách hàng,
- **Tôi muốn** xem danh sách lead và cập nhật trạng thái (mới, đang liên hệ, đã chốt, đã hủy),
- **Để** theo dõi tiến độ chăm sóc khách hàng không bị trùng lặp.
- **Tiêu chí chấp nhận**:
  - **Given** Quản trị viên mở trang `/admin/leads`,
  - **When** Chuyển trạng thái một lead từ "Mới" sang "Đang tư vấn",
  - **Then** Hệ thống gửi `PATCH /api/leads/:id` cập nhật cơ sở dữ liệu và tự động ghi nhận một sự kiện vào Activity Timeline.

### US-009: Ghi nhận lịch sử tương tác (CRM Timeline)

- **Là** một chuyên viên tư vấn,
- **Tôi muốn** ghi chú tóm tắt nội dung cuộc gọi tư vấn vào hồ sơ lead,
- **Để** các đồng nghiệp khác nắm bắt được nguyện vọng của khách.
- **Tiêu chí chấp nhận**:
  - **Given** Drawer chi tiết của một lead đang mở ở tab "Hoạt động",
  - **When** Nhập ghi chú "Khách yêu cầu thêm backdrop hoa tươi tông trắng" và nhấn "Lưu ghi chú",
  - **Then** Ghi chú mới xuất hiện trên timeline kèm thời gian và tên quản trị viên thực hiện (`POST /api/leads/:id/activities`).

### US-010: Khởi tạo và xuất báo giá chuẩn hóa

- **Là** một quản trị viên,
- **Tôi muốn** lập bảng báo giá chi tiết từng hạng mục chi phí và xuất file PDF,
- **Để** gửi văn bản báo giá chính thức cho khách hàng.
- **Tiêu chí chấp nhận**:
  - **Given** Một hồ sơ lead đã được khảo sát nhu cầu,
  - **When** Quản trị viên mở modal tạo báo giá, nhập các dòng chi phí và nhấn "Lưu báo giá",
  - **Then** Hệ thống sinh mã báo giá nguyên tử định dạng `BG-YYYY-XXXX` qua `POST /api/quotations`, lưu vào DB và cho phép tải xuống file PDF tạo bởi `jspdf`.

### US-011: Quản lý và sắp xếp thứ tự hiển thị dịch vụ

- **Là** một quản trị viên nội dung,
- **Tôi muốn** thay đổi thứ tự ưu tiên hiển thị của các gói dịch vụ ngoài trang chủ,
- **Để** làm nổi bật các gói dịch vụ trọng tâm theo mùa vụ.
- **Tiêu chí chấp nhận**:
  - **Given** Quản trị viên truy cập `/admin/services`,
  - **When** Nhấn nút mũi tên di chuyển dịch vụ lên/xuống (hoặc kéo thả),
  - **Then** Hệ thống gửi `PATCH /api/services/:id` lưu lại trường `order` và giao diện trang chủ phản ánh đúng thứ tự mới.

### US-012: Kiểm duyệt đánh giá của khách hàng

- **Là** một quản trị viên thương hiệu,
- **Tôi muốn** duyệt hoặc từ chối các đánh giá do người dùng gửi lên,
- **Để** đảm bảo chỉ những nhận xét chính thống, lịch sự mới được xuất bản ra công chúng.
- **Tiêu chí chấp nhận**:
  - **Given** Quản trị viên mở trang `/admin/testimonials`,
  - **When** Nhấn "Phê duyệt" đối với một đánh giá ở trạng thái `pending`,
  - **Then** Trạng thái chuyển sang `approved` (`PATCH /api/testimonials/:id`) và đánh giá xuất hiện trên trang chủ.

---

## 4. Nhóm Chủ sở hữu Hệ thống (Owner)

### US-013: Tạo mới tài khoản quản trị viên

- **Là** chủ sở hữu hệ thống (Owner),
- **Tôi muốn** cấp tài khoản quản trị mới cho nhân viên tư vấn,
- **Để** họ có quyền truy cập vào cổng quản trị mà không cần chia sẻ mật khẩu dùng chung.
- **Tiêu chí chấp nhận**:
  - **Given** Người dùng đăng nhập với quyền `role = 'owner'` tại `/admin/settings`,
  - **When** Nhập email, tên và mật khẩu (đáp ứng chính sách bảo mật tối thiểu 8 ký tự, có chữ hoa, chữ thường và số),
  - **Then** Hệ thống tạo tài khoản qua `POST /api/auth/admins` (xác thực qua middleware `requireOwner`).

### US-014: Thu hồi tài khoản quản trị viên đã nghỉ việc

- **Là** chủ sở hữu hệ thống (Owner),
- **Tôi muốn** xóa tài khoản của quản trị viên đã rời tổ chức,
- **Để** ngăn chặn truy cập trái phép vào dữ liệu khách hàng.
- **Tiêu chí chấp nhận**:
  - **Given** Owner đang xem danh sách quản trị viên tại trang Cài đặt,
  - **When** Nhấn "Xóa tài khoản" và xác nhận trên hộp thoại cảnh báo,
  - **Then** Hệ thống thực thi `DELETE /api/auth/admins/:id`, xóa tài khoản và vô hiệu hóa toàn bộ refresh token liên quan.
