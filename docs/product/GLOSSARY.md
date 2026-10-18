# Bảng Thuật ngữ Nghiệp vụ (GLOSSARY.md)

Tài liệu này giải thích các khái niệm, thuật ngữ miền nghiệp vụ (Domain Terminology) được sử dụng thống nhất xuyên suốt sản phẩm Pi Decor, kèm vị trí xuất hiện tương ứng trong mã nguồn (_suy ra từ code_).

---

## 1. Khách hàng & Tiếp nhận Nhu cầu (CRM)

### Lead (Khách hàng tiềm năng)

- **Định nghĩa**: Bản ghi thông tin khách hàng có nhu cầu tư vấn trang trí tiệc do người dùng tự gửi từ website hoặc do quản trị viên nhập liệu thủ công. Chứa tên, số điện thoại, ngày dự kiến tổ chức, ghi chú, trạng thái xử lý (`new`, `contacted`, `converted`, `cancelled`) và liên kết bản vẽ thiết kế (nếu có).
- **Vị trí trong mã nguồn**:
  - Schemas: `packages/shared/src/schemas/leads.ts`
  - Backend: `apps/api/src/modules/leads/`
  - Frontend: `apps/web/src/features/leads/`

### Consent (Đồng ý xử lý dữ liệu cá nhân)

- **Định nghĩa**: Thao tác xác nhận của người dùng (bắt buộc tích chọn hộp kiểm) đồng ý cho phép Pi Decor thu thập và xử lý họ tên, số điện thoại theo quy định tại Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Vị trí trong mã nguồn**:
  - Schemas: `packages/shared/src/schemas/leads.ts` (`consent: z.literal(true)`)
  - Frontend: `apps/web/src/features/studio/components/customer/SaveDesignModal.tsx`
  - Chính sách: `apps/web/src/pages/PrivacyPolicyPage.tsx`

### Activity (Hoạt động chăm sóc khách hàng / Timeline)

- **Định nghĩa**: Sự kiện nhật ký gắn liền với một Lead, ghi nhận lịch sử tương tác như: đổi trạng thái lead, tạo báo giá, cuộc gọi tư vấn hoặc ghi chú nội bộ. Lưu kèm thông tin người thực hiện (`admin_id`, tên, email) và thời gian thực.
- **Vị trí trong mã nguồn**:
  - Schemas: `packages/shared/src/schemas/leads.ts` (truy vấn activities)
  - Backend: `apps/api/src/services/activity.service.js`
  - Frontend: `apps/web/src/features/leads/components/LeadActivityTimeline.tsx`

### Quotation (Báo giá dịch vụ)

- **Định nghĩa**: Văn bản chào giá dịch vụ chính thức do chuyên viên tư vấn lập cho khách hàng. Hệ thống tự động sinh số hiệu báo giá nguyên tử dạng `BG-YYYY-XXXX` (trong đó `YYYY` là năm và `XXXX` là số thứ tự tăng dần chống trùng lặp), chứa danh sách chi phí từng hạng mục và hỗ trợ xuất file PDF.
- **Vị trí trong mã nguồn**:
  - Schemas: `packages/shared/src/schemas/quotations.ts`
  - Backend: `apps/api/src/modules/quotations/`
  - Frontend: `apps/web/src/features/leads/components/QuotationModal.tsx`

---

## 2. Xưởng Thiết kế Trực quan (Pi Decor Studio)

### Template (Bản mẫu phông nền)

- **Định nghĩa**: Khung thiết kế đồ họa phông tiệc gốc (Backdrop Canvas). Chứa chuỗi mã nguồn SVG cơ sở (`svg_base`), danh mục (`category`), trạng thái kích hoạt (`is_active`) và các cấu hình màu sắc/chủ đề mặc định (`default_config`).
- **Vị trí trong mã nguồn**:
  - Backend: `apps/api/src/modules/studio/studio.repository.js`, `apps/api/src/utils/seed/templates.seed.js`
  - Frontend: `apps/web/src/features/studio/types/index.ts`, `apps/web/src/features/studio/data/seed/templates.ts`

### Slot (Vị trí gắn thành phần đồ họa)

- **Định nghĩa**: Vị trí hoặc lớp đồ họa có thể tùy biến trên bản mẫu Studio (ví dụ: `drape_main` - rèm chính, hoa trang trí, dải voan phụ). Mỗi slot có tọa độ và kích thước tương đối chuẩn hóa (`norm_x`, `norm_y`, `norm_width`, `norm_height` từ `0.0` đến `1.0`) và thứ tự sắp xếp lớp hiển thị (`sort_order`).
- **Vị trí trong mã nguồn**:
  - Database: `apps/api/database/migrations/0001_baseline.sql` (bảng `studio_slot_definitions`)
  - Backend: `apps/api/src/modules/studio/`
  - Frontend: `apps/web/src/features/studio/components/`

### Rule (Quy tắc tương thích thiết kế)

- **Định nghĩa**: Các ràng buộc logic kỹ thuật và thẩm mỹ được áp dụng trong quá trình khách hàng tùy biến rèm/vật liệu (ví dụ: loại vật liệu được phép chọn cho từng slot, màu đối kháng cần tránh).
- **Vị trí trong mã nguồn**:
  - Backend: `apps/api/src/modules/studio/` (bảng `studio_slot_rules`)
  - Frontend: `apps/web/src/features/studio/rules/curtainRules.ts`

### Design Snapshot (Bản vẽ thiết kế của khách hàng)

- **Định nghĩa**: Bản ghi trạng thái cấu hình đồ họa do khách hàng (hoặc admin) tạo ra sau khi tùy biến trong Studio, lưu trữ dạng JSON (`design_snapshot`) kèm ảnh chụp thu nhỏ (`thumbnail` có gắn hotline và watermark nhận diện Pi Decor).
- **Vị trí trong mã nguồn**:
  - Schemas: `apps/api/src/schemas/studio.schema.js`
  - Backend: `apps/api/src/modules/studio/`
  - Frontend: `apps/web/src/features/studio/hooks/useCustomerEditor.ts`

---

## 3. Nội dung Trưng bày & Quản trị Danh mục

### Lookbook (Bộ sưu tập mẫu)

- **Định nghĩa**: Không gian trưng bày trực quan các dự án trang trí tiêu biểu theo từng concept thẩm mỹ (ví dụ: Sen Hồng, Champagne Gold, Garden Party). Hỗ trợ xem ảnh phóng to và chi tiết hạng mục.
- **Vị trí trong mã nguồn**:
  - Frontend: `apps/web/src/components/sections/Lookbook.tsx`
  - Nội dung: `apps/web/src/lib/content.ts`

### Price Tier (Phân khúc ngân sách: Standard / Premium)

- **Định nghĩa**: Thuộc tính phân loại định vị chi phí của một dự án hoặc gói dịch vụ:
  - `standard`: Gói trang trí cơ bản, tối ưu ngân sách.
  - `premium`: Gói trang trí cao cấp, sử dụng hoa tươi nhập khẩu hoặc vật liệu đặc thù.
- **Vị trí trong mã nguồn**:
  - Schemas: `apps/api/src/schemas/projects.schema.js`
  - Backend: `apps/api/src/modules/projects/`
  - Frontend: `apps/web/src/features/projects/types/index.ts`

### Venue (Địa điểm tổ chức sự kiện)

- **Định nghĩa**: Nhà hàng, khách sạn hoặc trung tâm hội nghị tiệc cưới mà Pi Decor đã thiết lập hồ sơ hợp tác. Lưu thông tin tên, địa chỉ, sức chứa và tọa độ địa lý (`latitude`, `longitude`) phục vụ hiển thị trên bản đồ.
- **Vị trí trong mã nguồn**:
  - Schemas: `apps/api/src/schemas/venues.schema.js`
  - Backend: `apps/api/src/modules/venues/`
  - Frontend: `apps/web/src/features/venues/components/`, `apps/web/src/pages/MapPage.tsx`

### Material (Vật liệu trang trí)

- **Định nghĩa**: Danh mục vật tư mẫu (vải rèm, hoa lụa, phụ kiện) gồm tên, mã màu hexa tham chiếu, ảnh texture/swatch và đơn giá ước tính để phục vụ việc chọn mẫu trong Studio và lập báo giá.
- **Vị trí trong mã nguồn**:
  - Schemas: `apps/api/src/schemas/materials.schema.js`
  - Backend: `apps/api/src/modules/materials/`
  - Frontend: `apps/web/src/features/materials/`
