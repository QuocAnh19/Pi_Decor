# Bộ sưu tập & Dự án Thực tế (Lookbook & Projects)

Tài liệu đặc tả chức năng trưng bày các dự án trang trí tiệc cưới/sự kiện thực tế (Lookbook), hỗ trợ lọc theo phong cách thẩm mỹ và phân khúc ngân sách (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Giới thiệu các không gian tiệc thực tế mà Pi Decor đã thực hiện; giúp khách hàng tham khảo phong cách thiết kế và ước lượng mức ngân sách phù hợp.
- **Người dùng**: Khách tham quan (Visitor) và Khách hàng tiềm năng (Prospect).

---

## 2. User Story liên quan

- Tham chiếu: **US-002** (Lọc Lookbook dự án thực tế theo phân khúc giá) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng cuộn tới khối "Lookbook" trên trang chủ hoặc nhấn liên kết "Bộ sưu tập" trên thanh menu.
2. Ứng dụng gọi API `GET /api/projects` để lấy danh sách các dự án đã phát hành (`published = true`).
3. Khối lọc cung cấp các tab chuyển đổi theo phân khúc ngân sách: "Tất cả", "Tiêu chuẩn (Standard)" và "Cao cấp (Premium)", kết hợp bộ lọc theo tag phong cách (`#PiDecor_{tag}`).
4. Người dùng nhấn chọn một thẻ dự án: Modal `ProjectAlbumModal` mở ra hiển thị album ảnh chi tiết (`gallery`), thông tin địa điểm (`location`), ngày tổ chức (`event_date`) và mô tả ý tưởng trang trí.
5. Người dùng có thể duyệt qua từng ảnh trong album bằng nút chuyển ảnh trước/sau hoặc phím mũi tên.

### 3.2. Luồng lỗi & Trường hợp biên

- **Không tìm thấy dự án phù hợp với bộ lọc**: Hiển thị thông báo không có dự án trong phân khúc đã chọn.
- **Dự án đang ở trạng thái bản nháp (`published = false`)**: Tuyệt đối không xuất hiện trên API công khai này (được kiểm soát chặt chẽ ở cấp độ truy vấn SQL backend).

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Hiển thị trên `/` (Trang chủ)
- **Thành phần chính**:
  - `Lookbook`: `apps/web/src/components/sections/Lookbook.tsx`
  - `ProjectAlbumModal`: `apps/web/src/features/projects/components/ProjectAlbumModal.tsx`
  - Hook truy vấn: `apps/web/src/features/projects/hooks/projects.queries.ts`

---

## 5. API Sử dụng

- `GET /api/projects`: Lấy danh sách dự án công khai.
  - Điều kiện lọc máy chủ: Bắt buộc `WHERE published = true`.
  - Quyền hạn: Công khai (Public).
- `GET /api/projects/:id`: Lấy thông tin chi tiết một dự án và danh sách ảnh gallery.
  - Quyền hạn: Công khai (Public).

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `projects`
- **Các cột chính**: `id` (UUID), `title` (text, not null), `category` (text, not null), `event_date` (date), `location` (text), `budget` (numeric), `tag` (text), `description` (text), `image_url` (text, ảnh đại diện), `gallery` (text[], danh sách ảnh album), `featured` (boolean), `published` (boolean), `style_tags` (text[]), `price_tier` (`'standard'` | `'premium'`).
- **Quy tắc bảo mật dữ liệu**: Các trường nháp và thông tin nội bộ không được trả về cho người dùng công khai.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Dữ liệu phản hồi tuân thủ schema `apps/api/src/schemas/projects.schema.js`.
- **Phân quyền**: Truy cập đọc công khai không cần token. Thao tác tạo mới, sửa, xóa, tải ảnh Cloudinary chỉ dành cho Admin tại `/admin/projects`.
- **Rate Limit**: Áp dụng giới hạn chung cho các truy vấn GET công khai.

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Toàn bộ hình ảnh khách hàng trong album thực tế phải có sự đồng ý theo quy định pháp lý (chi tiết tại [docs/ASSETS.md](../../ASSETS.md) - trạng thái `[CẦN XÁC NHẬN]`).

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi tải danh sách: `"Không thể tải danh sách bộ sưu tập. Vui lòng thử lại sau."`
- Album ảnh rỗng: Hiển thị ảnh đại diện mặc định của dự án.

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/projects/projects.test.js` (kiểm tra dự án nháp `published=false` không bao giờ bị rò rỉ ra API công khai).
- **E2E Visual**: `e2e/visual.spec.ts` (kiểm tra hiển thị lưới ảnh Lookbook trên desktop và mobile).

---

## 11. Giới hạn đã biết & Tồn đọng

- Hai cột `tag` và `budget` được duy trì song song với `style_tags` và `price_tier` để phục vụ hiển thị hashtag và lọc Lookbook (ghi nhận tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md)).
