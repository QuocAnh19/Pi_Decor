# Biểu mẫu Nhận tư vấn & Thu thập Lead (Lead Form)

Tài liệu đặc tả chức năng tiếp nhận thông tin liên hệ từ khách hàng tiềm năng, tích hợp xác thực số điện thoại chuẩn Việt Nam, cam kết bảo vệ dữ liệu cá nhân và đính kèm bản vẽ thiết kế (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Thu thập nhu cầu tư vấn trang trí tiệc của khách hàng tiềm năng; liên kết thông tin khách hàng với bản vẽ thiết kế phối cảnh từ Studio (nếu có); đảm bảo tuân thủ đầy đủ quy định pháp lý về bảo vệ dữ liệu cá nhân.
- **Người dùng**: Khách hàng tiềm năng (Prospect / Lead).

---

## 2. User Story liên quan

- Tham chiếu: **US-006** (Lưu thiết kế và gửi yêu cầu tư vấn kèm xác nhận bảo mật) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng nhấn nút "Lưu thiết kế & Nhận tư vấn" trong Studio (hoặc gửi form liên hệ trực tiếp trên trang chủ).
2. Hộp thoại `SaveDesignModal` mở ra ở bước nhập liệu `SaveDesignFormView`.
3. Khách hàng điền thông tin:
   - Họ và tên (`name`): Bắt buộc.
   - Số điện thoại (`phone`): Bắt buộc, kiểm tra theo định dạng đầu số di động Việt Nam.
   - Email (`email`): Tùy chọn.
   - Ngày dự kiến tổ chức (`event_date`): Tùy chọn.
   - Ghi chú yêu cầu (`notes`): Tùy chọn.
   - Hộp kiểm đồng ý bảo mật (`consent`): **Bắt buộc tích chọn** ("Tôi đã đọc và đồng ý với Chính sách bảo mật dữ liệu cá nhân").
4. Hệ thống kiểm tra hợp lệ client qua Zod schema, đính kèm dữ liệu đồ họa `design_snapshot` (nếu gửi từ Studio).
5. Gửi request `POST /api/leads` (qua `leadsLimiter`, dung lượng tối đa 5MB).
6. Máy chủ xác thực dữ liệu, ghi nhận `consent_at = NOW()` và `consent_version = 'v1.0'`, tạo bản ghi lead mới với trạng thái mặc định `status = 'new'`.
7. Giao diện chuyển sang màn hình thành công `SaveDesignSuccessView`, cung cấp mã tra cứu và nút tải ảnh phối cảnh đã gắn watermark.

### 3.2. Luồng lỗi & Trường hợp biên

- **Không tích chọn đồng ý (`consent = false`)**: Nút gửi bị vô hiệu hóa; nếu cố ý gửi qua API sẽ bị Zod chặn với lỗi 400.
- **Số điện thoại sai định dạng**: Báo lỗi _"Số điện thoại không đúng định dạng di động Việt Nam (ví dụ: 0912345678)"_.
- **Vượt quá tần suất gửi**: Middleware `leadsLimiter` chặn với mã HTTP 429 nếu vượt quá 60 yêu cầu / 15 phút.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Tích hợp trên `/studio` và các khối liên hệ trên `/`.
- **Thành phần chính**:
  - `SaveDesignModal`: `apps/web/src/features/studio/components/customer/SaveDesignModal.tsx`
  - `SaveDesignFormView`: `apps/web/src/features/studio/components/customer/SaveDesignFormView.tsx`
  - `SaveDesignSuccessView`: `apps/web/src/features/studio/components/customer/SaveDesignSuccessView.tsx`

---

## 5. API Sử dụng

- `POST /api/leads`: Tiếp nhận thông tin lead.
  - Quyền hạn: Công khai (Public).
  - Parser riêng: `express.json({ limit: "5mb" })`.
  - Rate Limit: `leadsLimiter` (60 req / 15 phút).
  - Schema Zod đầu vào: `createLeadSchema` trong `packages/shared/src/schemas/leads.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `leads`
- **Các cột chính**: `id` (UUID), `name` (text, not null), `phone` (text, not null), `email` (text), `notes` (text), `event_date` (date), `status` (enum: `'new'`, `'contacted'`, `'converted'`, `'cancelled'`), `design_snapshot` (JSONB), `consent` (boolean, not null), `consent_at` (timestamptz), `consent_version` (text).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Quy chuẩn SĐT VN**: Kiểm tra qua biểu thức chính quy chuẩn quốc gia tại `packages/shared/src/constants/phone.ts` (`/(03|05|07|08|09|01[2689])[0-9]{8}\b/`).
- **Phân quyền**: Gửi công khai; quyền xem và đổi trạng thái chỉ dành cho Admin tại `/admin/leads`.
- **Rate Limit**: 60 lần / 15 phút / IP.

---

## 8. Dữ liệu cá nhân & Bảo vệ Dữ liệu (NĐ 13/2023/NĐ-CP)

- Thu thập tối thiểu (Data Minimization): Chỉ yêu cầu tên và số điện thoại phục vụ mục đích tư vấn khảo sát tiệc.
- Ghi nhận bằng chứng chấp thuận: Lưu chính xác mốc thời gian `consent_at` và phiên bản chính sách `consent_version`.
- Vòng đời dữ liệu: Dữ liệu quá hạn sẽ được thanh lọc định kỳ qua script `npm run purge-leads` (mặc định 180 ngày).

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Thiếu đồng ý bảo mật: `"Bạn cần đồng ý với Chính sách bảo mật để tiếp tục."`
- Lỗi kết nối (500): `"Hệ thống đang bận. Vui lòng liên hệ trực tiếp hotline để được hỗ trợ tức thì."`

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/leads/leads.test.js` (kiểm tra gửi lead thành công, kiểm tra validate SĐT và consent).
- **E2E Playwright**: `e2e/scenarios.spec.ts` (kịch bản điền form lead, tích consent và xác nhận lead xuất hiện trong admin).

---

## 11. Giới hạn đã biết & Tồn đọng

- Thời hạn lưu trữ `RETENTION_DAYS` đang chờ rà soát pháp lý chính thức (theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md)).
