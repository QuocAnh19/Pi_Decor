# Quản lý Khách hàng tiềm năng & CRM (Leads CRM)

Tài liệu đặc tả chức năng quản lý khách hàng tiềm năng (Leads), tìm kiếm mờ theo trigram, phân trang danh sách, cập nhật trạng thái tư vấn, xem bản vẽ thiết kế và theo dõi dòng thời gian hoạt động chăm sóc (Activity Timeline) (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Cung cấp công cụ CRM tinh gọn cho đội ngũ tư vấn viên theo dõi toàn diện phễu khách hàng từ khi tiếp nhận nhu cầu, khảo sát, lập báo giá cho đến khi chốt hợp đồng thi công tiệc.
- **Người dùng**: Quản trị viên (Admin) và Chủ sở hữu (Owner).

---

## 2. User Story liên quan

- Tham chiếu: **US-008** (Quản lý trạng thái lead) và **US-009** (Ghi nhận lịch sử tương tác CRM Timeline) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Quản trị viên mở trang `/admin/leads` (`AdminLeadsPage`).
2. Giao diện tải danh sách lead qua `GET /api/leads` kèm các bộ lọc trạng thái (`status`: `new`, `contacted`, `converted`, `cancelled`) và ô tìm kiếm (`q`).
3. Quản trị viên tìm kiếm theo tên hoặc số điện thoại: Backend sử dụng chỉ mục trigram PostgreSQL (`pg_trgm`) để tìm kiếm mờ không phân biệt dấu tiếng Việt.
4. Nhấn vào một dòng trong bảng `LeadTable`: Ngăn trượt `LeadDetailDrawer` mở ra hiển thị hai tab:
   - **Tab "Tổng quan" (`LeadOverviewTab`)**: Thông tin liên hệ (tên, SĐT, email), ngày tổ chức, ghi chú ban đầu, thông tin đồng ý bảo mật và khu vực hiển thị bản vẽ thiết kế Studio đính kèm (`LeadDesignSnapshotSection`).
   - **Tab "Hoạt động" (`LeadActivityTimeline`)**: Dòng thời gian hiển thị lịch sử thay đổi trạng thái, tạo báo giá và các ghi chú tư vấn kèm tên/email quản trị viên thực hiện.
5. Quản trị viên có thể:
   - Đổi trạng thái xử lý: Chọn trạng thái mới trong dropdown -> Hệ thống gửi `PATCH /api/leads/:id` và tự động ghi một sự kiện tương ứng vào timeline.
   - Thêm ghi chú/cuộc gọi tư vấn: Nhập nội dung vào form timeline và bấm gửi -> Gọi `POST /api/leads/:id/activities`.
   - Mở modal lập báo giá: Nhấn "Tạo báo giá" để mở `QuotationModal`.

### 3.2. Luồng lỗi & Trường hợp biên

- **Xóa Lead**: Thao tác xóa `DELETE /api/leads/:id` hiển thị modal cảnh báo xác nhận; xóa lead sẽ dọn dẹp các activity và bản ghi liên kết theo ràng buộc toàn vẹn cơ sở dữ liệu.
- **Admin thực hiện activity đã bị xóa khỏi hệ thống**: Truy vấn activities áp dụng `LEFT JOIN admins`, giữ giá trị `null` an toàn và hiển thị nhãn "Quản trị viên cũ".

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/admin/leads`
- **Tệp màn hình**: `apps/web/src/pages/admin/AdminLeadsPage.tsx`
- **Thành phần chính**:
  - `LeadTable`: `apps/web/src/features/leads/components/LeadTable.tsx`
  - `LeadDetailDrawer`: `apps/web/src/features/leads/components/LeadDetailDrawer.tsx`
  - `LeadOverviewTab`: `apps/web/src/features/leads/components/LeadOverviewTab.tsx`
  - `LeadActivityTimeline`: `apps/web/src/features/leads/components/LeadActivityTimeline.tsx`
  - `LeadDesignSnapshotSection`: `apps/web/src/features/leads/components/LeadDesignSnapshotSection.tsx`

---

## 5. API Sử dụng

- `GET /api/leads`: Lấy danh sách lead có phân trang và tìm kiếm (`verifyToken, requireAdmin`).
- `GET /api/leads/:id`: Lấy chi tiết lead kèm dữ liệu snapshot (`verifyToken, requireAdmin`).
- `PATCH /api/leads/:id`: Cập nhật trạng thái lead (`verifyToken, requireAdmin`).
- `DELETE /api/leads/:id`: Xóa lead khỏi hệ thống (`verifyToken, requireAdmin`).
- `GET /api/leads/:id/activities`: Lấy dòng thời gian hoạt động có hỗ trợ phân trang cursor (`before`, `limit`) (`verifyToken, requireAdmin`).
- `POST /api/leads/:id/activities`: Ghi chú tư vấn mới (`verifyToken, requireAdmin`).
  - Schema Zod: `packages/shared/src/schemas/leads.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**:
  - `leads`: `id` (UUID), `name`, `phone`, `email`, `notes`, `event_date`, `status`, `design_snapshot` (JSONB), `consent`, `consent_at`, `consent_version`.
  - `lead_activities`: `id` (UUID), `lead_id` (FK cascade), `admin_id` (FK set null), `activity_type`, `content`, `metadata` (JSONB), `created_at`.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Trạng thái lead phải thuộc enum (`new`, `contacted`, `converted`, `cancelled`). Nội dung ghi chú tối đa 2000 ký tự.
- **Phân quyền**: Bắt buộc token Admin hoặc Owner (`verifyToken, requireAdmin`).
- **Rate Limit**: Áp dụng giới hạn chung cho các endpoint quản trị.

---

## 8. Dữ liệu cá nhân & Tuân thủ NĐ 13/2023/NĐ-CP

- Toàn bộ dữ liệu SĐT và họ tên khách hàng chỉ phục vụ công tác chăm sóc đơn tiệc.
- Dữ liệu quá hạn lưu trữ sẽ được thanh lọc định kỳ qua script `npm run purge-leads`.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Cập nhật thất bại: `"Không thể cập nhật trạng thái lead. Vui lòng thử lại."`
- Không tìm thấy hồ sơ (404): `"Khách hàng tiềm năng không tồn tại hoặc đã bị xóa."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/leads/leads.test.js` (kiểm tra phân trang, join admin đã xóa, thêm activity timeline).
- **Unit Test Web**: `apps/web/src/features/leads/components/LeadDetailDrawer.test.tsx` (kiểm tra render timeline và form thêm ghi chú).
- **E2E Playwright**: `e2e/scenarios.spec.ts` (kiểm tra luồng Admin duyệt danh sách lead và cập nhật trạng thái).

---

## 11. Giới hạn đã biết & Tồn đọng

- Tính năng xuất danh sách lead ra file Excel/CSV đang được theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
