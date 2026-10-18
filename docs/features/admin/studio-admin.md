# Quản trị Bản mẫu Studio (Studio Administration)

Tài liệu đặc tả chức năng quản trị bản mẫu phông nền trang trí (Templates), định nghĩa lớp slot, quy tắc phối cảnh và cơ chế lưu/xuất bản nguyên tử (Atomic Publishing) (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp công cụ cho chuyên viên thiết kế cập nhật mã nguồn đồ họa SVG, cấu hình tọa độ slot cắm hoa/rèm, thiết lập quy tắc ràng buộc và xuất bản bản mẫu mới cho khách hàng trải nghiệm tại Studio.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: Phân hệ quản trị đồ họa phục vụ trực tiếp cho **US-005** (Tùy biến phông nền Studio) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên truy cập `/admin/studio` (`AdminStudioPage`).
2. Giao diện tải danh sách bản mẫu qua `GET /api/studio/templates/admin`.
3. Tạo hoặc hiệu chỉnh bản mẫu phông nền:
   - Dán mã nguồn đồ họa SVG (`svg_base`) của phông nền tiệc.
   - Trình duyệt làm sạch mã qua `DOMPurify` để loại bỏ mã độc hại (XSS) trước khi render.
   - Thêm các vị trí slot cắm rèm (`drape_main`, rèm phụ, hoa): Kéo thả hoặc nhập tọa độ chuẩn hóa (`norm_x`, `norm_y`, `norm_width`, `norm_height` từ 0 đến 1) và thứ tự lớp hiển thị (`sort_order`).
   - Thiết lập các quy tắc kết hợp vật liệu (`studio_slot_rules`).
4. Nhấn nút "Xuất bản bản mẫu" (Publish Template):
   - Client gọi `PUT /api/studio/templates/:id/publish` (hỗ trợ payload lên tới 10MB).
   - Backend mở một Transaction cơ sở dữ liệu thực thi nguyên tử: cập nhật thông tin `studio_templates`, xóa và chèn lại toàn bộ `studio_slot_definitions` và `studio_slot_rules`, cập nhật ảnh thumbnail Cloudinary.
   - Toàn bộ thay đổi thành công đồng thời (hoặc rollback nếu có lỗi).
5. Sau khi xuất bản, bản mẫu ngay lập tức xuất hiện trên giao diện công khai `/studio`.

### 3.2. Luồng lỗi & Trường hợp biên

- **Mã SVG chứa thẻ nguy hiểm (`<script>`, `onload=`)**: `DOMPurify` tự động bóc tách và loại bỏ hoàn toàn các thuộc tính và thẻ thực thi script trước khi lưu.
- **Lỗi giao dịch trong quá trình publish**: Rollback toàn bộ trạng thái slots và rules, đảm bảo không lưu dữ liệu nửa vời.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/studio`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminStudioPage.tsx`
- **Thành phần Studio dùng chung**: `apps/web/src/features/studio/components/`

---

## 5. API Sử dụng

- `GET /api/studio/templates/admin`: Lấy danh sách template quản trị (`verifyToken, requireAdmin`).
- `PUT /api/studio/templates/:id/publish`: Xuất bản nguyên tử template + slots + rules (`verifyToken, requireAdmin`).
  - Giới hạn payload riêng: `express.json({ limit: "10mb" })`.
- `GET /api/studio/assets/admin`: Tải danh sách tài nguyên đồ họa (`verifyToken, requireAdmin`).
  - Schema: `apps/api/src/schemas/studio.schema.js`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**:
  - `studio_templates`: `id` (UUID), `name`, `thumbnail`, `svg_base`, `category`, `is_active`, `default_config` (JSONB).
  - `studio_slot_definitions`: `template_id` (FK), `slot_key`, `label`, `slot_type`, `norm_x`, `norm_y`, `norm_width`, `norm_height`, `sort_order`.
  - `studio_slot_rules`: `template_id` (FK), `rule_type`, `condition_data` (JSONB).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Cấu hình tọa độ `norm_*` bắt buộc nằm trong khoảng `[0.0, 1.0]`.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & An toàn thông tin

- Không lưu trữ thông tin cá nhân.
- Bảo vệ tuyệt đối tính an toàn đồ họa vector chống tấn công Stored XSS qua DOMPurify.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi xuất bản: `"Không thể xuất bản bản mẫu Studio. Giao dịch cơ sở dữ liệu đã hoàn tác."`
- Cấu trúc SVG lỗi: `"Mã SVG không đúng định dạng XML/SVG hợp lệ."`

---

## 10. Kiểm thử liên quan

- **Unit Test Màu sắc SVG**: `apps/web/src/features/studio/utils/svgColorUtils.test.ts`.
- **Unit Test Rules Engine**: `apps/web/src/features/studio/rules/rulesEngine.test.ts`.

---

## 11. Giới hạn đã biết & Tồn đọng

- Quản lý vòng đời ảnh Cloudinary cho bảng `studio_assets` đang được theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
