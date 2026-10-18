# Giới thiệu & Trưng bày Dịch vụ (Services Showcase)

Tài liệu đặc tả chức năng hiển thị danh mục các gói dịch vụ trang trí tiệc cưới, sự kiện và xem chi tiết từng gói trên giao diện công khai (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Giới thiệu trực quan các gói dịch vụ chính (Tiệc cưới, Tiệc sinh nhật / thôi nôi, Sự kiện doanh nghiệp) kèm hình ảnh đại diện, danh sách các hạng mục thi công chi tiết và nút liên hệ tư vấn.
- **Người dùng**: Khách tham quan (Visitor) và Khách hàng tiềm năng (Prospect).

---

## 2. User Story liên quan

- Tham chiếu: **US-001** (Khám phá danh mục dịch vụ trang trí tiệc) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng cuộn tới khối "Dịch vụ của chúng tôi" trên trang chủ hoặc nhấn menu "Dịch vụ" trên thanh điều hướng.
2. Ứng dụng kích hoạt hook `useServicesQuery()` gửi request `GET /api/services`.
3. Giao diện render danh sách các thẻ `ServiceCategoryCard` sắp xếp theo trường `order` tăng dần.
4. Mỗi thẻ hiển thị: Tên gói (`title`), Thương hiệu con (`brand`), Khẩu hiệu (`tagline`), Ảnh cover, Biểu tượng (`icon`), Màu nhấn (`accent`) và tóm tắt hạng mục.
5. Người dùng nhấn vào một thẻ dịch vụ: `ServiceDetailModal` mở ra hiển thị toàn bộ nội dung chi tiết, danh sách các đầu việc thi công (`items` dạng JSONB) và nút CTA "Nhận báo giá / Thiết kế ngay" dẫn sang `/studio` hoặc cuộn tới form liên hệ.
6. Người dùng đóng modal bằng nút X, bấm phím `Esc` hoặc bấm ra ngoài lớp nền overlay.

### 3.2. Luồng lỗi & Trường hợp biên

- **Lỗi mạng khi tải API**: Hiển thị component thông báo lỗi kèm nút "Thử lại".
- **Dịch vụ chưa có dữ liệu**: Hiển thị trạng thái trống thân thiện.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Hiển thị trên `/` (Trang chủ)
- **Thành phần chính**:
  - `ServicesSection`: `apps/web/src/features/services/components/ServicesSection.tsx`
  - `ServiceCategoryCard`: `apps/web/src/features/services/components/ServiceCategoryCard.tsx`
  - `ServiceDetailModal`: `apps/web/src/features/services/components/ServiceDetailModal.tsx`
  - Hook truy vấn: `apps/web/src/features/services/hooks/services.queries.ts`

---

## 5. API Sử dụng

- `GET /api/services`: Lấy danh sách dịch vụ công khai (sắp xếp theo `order ASC`).
  - Quyền: Công khai (Public).
  - Schema Zod phản hồi: `serviceListResponseSchema` trong `packages/shared/src/schemas/services.ts`.
- `GET /api/services/:id`: Lấy chi tiết một dịch vụ theo UUID.
  - Quyền: Công khai (Public).
  - Schema Zod phản hồi: `serviceResponseSchema` trong `packages/shared/src/schemas/services.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `services`
- **Các cột chính**: `id` (UUID), `title` (text, not null), `description` (text), `image_url` (text), `order` (int), `brand` (text), `tagline` (text), `icon` (text), `accent` (text), `items` (JSONB), `href` (text), `cta_label` (text), `featured` (boolean), `cover` (text).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Toàn bộ dữ liệu trả về được kiểm duyệt qua Zod schema dùng chung.
- **Phân quyền**: Truy cập công khai không yêu cầu token. Các thao tác thêm, sửa, đổi thứ tự hay xóa yêu cầu quyền Admin qua `/admin/services`.
- **Rate Limit**: Áp dụng mức giới hạn tiêu chuẩn cho các yêu cầu GET công khai.

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Tính năng chỉ đọc dữ liệu dịch vụ công khai, không thu thập dữ liệu cá nhân.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi kết nối máy chủ: `"Không thể tải danh sách dịch vụ. Vui lòng thử lại sau."`
- Dịch vụ không tồn tại (404): `"Dịch vụ yêu cầu không tồn tại."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/services/services.test.js` (kiểm tra lấy danh sách dịch vụ công khai, sắp xếp theo order).
- **Unit Test Web**: `apps/web/src/pages/admin/AdminServicesPage.test.tsx` (kiểm thử form quản trị và validate dịch vụ).
- **E2E Test**: `e2e/scenarios.spec.ts` (kiểm tra render danh mục dịch vụ trên trang chủ).

---

## 11. Giới hạn đã biết & Tồn đọng

- Quản lý danh mục dịch vụ đã được hoàn thiện tại `/admin/services` (P31).
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
