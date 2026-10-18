# Xưởng Thiết kế Trực quan Khách hàng (Customer Studio)

Tài liệu đặc tả ứng dụng Studio tương tác đồ họa trên nền web dành cho khách hàng, hỗ trợ chọn mẫu phông nền, phối màu rèm theo quy tắc thiết kế, tùy biến chữ và xuất snapshot bản vẽ (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp công cụ trực quan hóa không gian tiệc cưới/sự kiện; cho phép khách hàng tự tay trải nghiệm phối màu rèm, thay đổi kiểu dáng và lưu bản vẽ thiết kế để nhận tư vấn chính xác.
- **Người dùng**: Khách hàng tiềm năng (Prospect / Lead) và Khách tham quan (Visitor).

---

## 2. User Story liên quan

- Tham chiếu: **US-005** (Tùy biến màu sắc và rèm trên phông nền Studio) và **US-006** (Lưu thiết kế & nhận tư vấn) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng truy cập đường dẫn `/studio`.
2. Trình chỉnh sửa `CustomerEditor` nạp bản mẫu mặc định hoặc gọi `GET /api/studio/templates` để nạp danh sách phông nền khả dụng.
3. Người dùng chọn một mẫu phông nền: Canvas SVG hiển thị phông nền cơ sở cùng các vị trí slot rèm (`drape_main`, rèm phụ, hoa).
4. Người dùng chọn một lớp rèm trên canvas hoặc từ danh sách slot:
   - Đổi màu sắc qua bảng màu (`TextColorPresets` / bảng chọn màu rèm).
   - Chọn chất liệu vải thi công.
   - Trình kiểm tra `curtainRules` xác thực tương thích quy tắc thiết kế theo thời gian thực.
5. Người dùng tùy biến tên cô dâu chú rể hoặc tên sự kiện qua `TextAssetCustomizer` (hỗ trợ chọn font, kích thước, căn lề).
6. Khi hoàn tất, nhấn nút "Lưu thiết kế & Nhận tư vấn":
   - Thư viện `html-to-image` kết xuất bản vẽ canvas thành ảnh snapshot có đính kèm biểu trưng (watermark) nhận diện thương hiệu Pi Decor và số hotline.
   - Hộp thoại `SaveDesignModal` hiển thị biểu mẫu thu thập thông tin lead.
7. Người dùng có thể nhấn nút tải xuống ảnh bản vẽ hoặc xuất tài liệu báo giá dự kiến.

### 3.2. Luồng lỗi & Trường hợp biên

- **Xung đột quy tắc phối màu (Rule Violation)**: Hệ thống đưa ra cảnh báo thẩm mỹ nếu màu rèm và màu nền vi phạm quy tắc tương phản trong `apps/web/src/features/studio/rules/curtainRules.ts`.
- **Lỗi tải mẫu SVG**: Tự động fallback về bản mẫu dự phòng cục bộ `apps/web/src/features/studio/data/seed/templates.ts`.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/studio` (Giao diện chuyên biệt không gắn Footer chung)
- **Tệp màn hình**: `apps/web/src/pages/StudioPage.tsx`
- **Thành phần chính**:
  - `CustomerEditor`: `apps/web/src/features/studio/components/customer/CustomerEditor.tsx`
  - `SaveDesignModal`: `apps/web/src/features/studio/components/customer/SaveDesignModal.tsx`
  - `TextAssetCustomizer`: `apps/web/src/features/studio/components/customer/TextAssetCustomizer.tsx`
  - Quy tắc phối rèm: `apps/web/src/features/studio/rules/curtainRules.ts`
  - Hook xử lý: `apps/web/src/features/studio/hooks/useCustomerEditor.ts`

---

## 5. API Sử dụng

- `GET /api/studio/templates`: Tải danh sách bản mẫu phông nền đang kích hoạt (`is_active = true`).
  - Quyền hạn: Công khai (Public).
- `GET /api/studio/templates/:id`: Tải chi tiết một bản mẫu kèm định nghĩa slots và rules.
  - Quyền hạn: Công khai (Public).
- `GET /api/studio/customer-designs/:id`: Tải lại snapshot thiết kế đã lưu qua mã chia sẻ.
  - Quyền hạn: Công khai (Public).
- `POST /api/leads`: Gửi kèm `design_snapshot` (JSON cấu hình) khi khách hàng lưu bản vẽ.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**:
  - `studio_templates`: `id` (UUID), `name`, `svg_base`, `category`, `is_active`, `default_config` (JSONB).
  - `studio_slot_definitions`: `template_id`, `slot_key`, `label`, `slot_type`, `norm_x`, `norm_y`, `norm_width`, `norm_height`, `sort_order`.
  - `studio_slot_rules`: `template_id`, `rule_type`, `condition_data` (JSONB).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate SVG**: Toàn bộ chuỗi đồ họa SVG trước khi hiển thị đều được làm sạch qua `DOMPurify` để loại bỏ nguy cơ chèn script độc hại (XSS).
- **Phân quyền**: Công khai cho khách trải nghiệm và lưu thiết kế. Quản trị viên sử dụng `/admin/studio` để xuất bản mẫu mới (`PUT /api/studio/templates/:id/publish`).

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Trong quá trình thiết kế, người dùng không cần đăng nhập hay để lại thông tin cá nhân.
- Khi nhấn lưu thiết kế và gửi yêu cầu tư vấn, việc thu thập thông tin được kiểm soát theo quy định tại [Lead Form](lead-form.md).

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Lỗi xuất ảnh snapshot: `"Không thể xuất ảnh thiết kế. Vui lòng thử lại trên trình duyệt Chrome hoặc Safari."`
- Bản mẫu không tồn tại: Thông báo mẫu đã tạm ngừng hỗ trợ và chuyển về mẫu mặc định.

---

## 10. Kiểm thử liên quan

- **Unit Test Rules Engine**: `apps/web/src/features/studio/rules/rulesEngine.test.ts`.
- **Unit Test Snapshot**: `apps/web/src/features/studio/utils/designSnapshot.test.ts`.
- **Unit Test Màu sắc SVG**: `apps/web/src/features/studio/utils/svgColorUtils.test.ts`.
- **E2E Playwright**: `e2e/scenarios.spec.ts` (kiểm tra Studio tải và phối màu trên canvas).

---

## 11. Giới hạn đã biết & Tồn đọng

- Quản lý vòng đời ảnh thumbnail Cloudinary của `studio_assets` đang được theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
