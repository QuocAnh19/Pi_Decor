# Bản đồ Địa điểm Sự kiện (Venue Map)

Tài liệu đặc tả chức năng bản đồ tương tác hiển thị danh sách các nhà hàng, trung tâm hội nghị tiệc cưới đối tác của Pi Decor trên nền tảng thư viện bản đồ Leaflet (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Hỗ trợ khách hàng tra cứu các địa điểm tổ chức sự kiện theo vị trí địa lý thực tế; khám phá các dự án trang trí mẫu đã từng thi công tại từng địa điểm cụ thể.
- **Người dùng**: Khách tham quan (Visitor) và Khách hàng tiềm năng (Prospect).

---

## 2. User Story liên quan

- Tham chiếu: **US-003** (Xem địa điểm tổ chức trên bản đồ tương tác) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng nhấn liên kết "Bản đồ" trên thanh điều hướng hoặc nhấn nút "Khám phá trên bản đồ" từ khối `MapTeaser` ở trang chủ.
2. Ứng dụng điều hướng tới trang `/ban-do` (`MapPage`).
3. Khối bản đồ `ProjectMap` (sử dụng thư viện Leaflet) tải dữ liệu địa điểm thông qua hook `useMap` gọi API `GET /api/venues`.
4. Bản đồ định vị trung tâm và hiển thị các điểm đánh dấu (Marker) tương ứng với tọa độ `latitude`, `longitude` của từng nhà hàng / khách sạn.
5. Người dùng nhấn vào một Marker trên bản đồ: Hộp thông tin `VenuePopupCard` xuất hiện hiển thị tên địa điểm, địa chỉ, sức chứa và ảnh đại diện.
6. Khi nhấn "Xem dự án tại đây", ứng dụng gọi `GET /api/venues/:id/projects` để hiển thị danh sách các album ảnh dự án tiệc đã hoàn thành tại địa điểm đó.

### 3.2. Luồng lỗi & Trường hợp biên

- **Địa điểm thiếu tọa độ GPS**: Địa điểm bị ẩn khỏi lớp hiển thị bản đồ để tránh lỗi render điểm không hợp lệ (NaN).
- **Mất kết nối nạp bản đồ**: Leaflet hiển thị các ô bản đồ dự phòng hoặc giữ giao diện danh sách địa điểm dạng bảng phẳng.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/ban-do` (Công khai)
- **Tệp màn hình**: `apps/web/src/pages/MapPage.tsx`
- **Thành phần chính**:
  - `MapExplorer`: `apps/web/src/features/map/components/MapExplorer.tsx`
  - `ProjectMap`: `apps/web/src/features/map/components/ProjectMap.tsx`
  - `VenuePopupCard`: `apps/web/src/features/map/components/VenuePopupCard.tsx`
  - `MapTeaser`: `apps/web/src/features/map/components/MapTeaser.tsx`
  - Hook truy vấn: `apps/web/src/features/map/hooks/useMap.ts`

---

## 5. API Sử dụng

- `GET /api/venues`: Lấy danh sách địa điểm công khai.
  - Quyền hạn: Công khai (Public).
  - Schema Zod: `apps/api/src/schemas/venues.schema.js`.
- `GET /api/venues/:id`: Lấy chi tiết thông tin một địa điểm.
  - Quyền hạn: Công khai (Public).
- `GET /api/venues/:id/projects`: Lấy các dự án tiệc liên kết với địa điểm này.
  - Quyền hạn: Công khai (Public).

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `venues`
- **Các cột chính**: `id` (UUID), `name` (text, not null), `address` (text, not null), `latitude` (numeric, not null), `longitude` (numeric, not null), `capacity` (int), `image_url` (text), `created_at`, `updated_at`.
- **Ràng buộc toàn vẹn**: Khi xóa địa điểm, các dự án liên kết được cập nhật `venue_id = null` (SET NULL) để không làm mất dữ liệu dự án.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Tọa độ `latitude` (-90 đến 90) và `longitude` (-180 đến 180) được kiểm tra chặt chẽ.
- **Phân quyền**: Truy cập đọc công khai không yêu cầu token. Thao tác thêm mới, sửa đổi hoặc xóa địa điểm yêu cầu quyền Admin tại `/admin/venues`.
- **Rate Limit**: Áp dụng giới hạn chung cho các yêu cầu đọc dữ liệu công khai.

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Tính năng chỉ đọc dữ liệu địa điểm công khai, không thu thập dữ liệu người dùng.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi nạp dữ liệu: `"Không thể tải bản đồ địa điểm. Vui lòng kiểm tra lại kết nối mạng."`
- Không có dự án: `"Chưa có dự án mẫu được cập nhật tại địa điểm này."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/venues/venues.test.js` (kiểm tra lấy danh sách địa điểm và dự án liên kết).
- **Visual Regression**: `e2e/visual.spec.ts` (kiểm tra hiển thị bản đồ trên Desktop và Mobile).

---

## 11. Giới hạn đã biết & Tồn đọng

- Quản lý địa điểm và tọa độ được thực hiện tại `/admin/venues`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
