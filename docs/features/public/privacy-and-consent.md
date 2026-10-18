# Chính sách Bảo mật & Quyền riêng tư (Privacy & Consent)

Tài liệu đặc tả chức năng công bố chính sách bảo vệ dữ liệu cá nhân, quản lý sự đồng ý của người dùng (Consent) và cơ chế tự động thanh lọc dữ liệu khách hàng quá hạn lưu trữ theo Nghị định 13/2023/NĐ-CP (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Đảm bảo tính minh bạch pháp lý về mục đích thu thập, xử lý và bảo vệ dữ liệu cá nhân của khách hàng; ghi nhận bằng chứng chấp thuận hợp pháp; cung cấp cơ chế thanh lọc dữ liệu định kỳ.
- **Người dùng**: Khách tham quan (Visitor), Khách hàng tiềm năng (Prospect) và Cán bộ phụ trách bảo vệ dữ liệu.

---

## 2. User Story liên quan

- Tham chiếu: **US-006** (Lưu thiết kế và gửi yêu cầu tư vấn kèm xác nhận bảo mật) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng nhấn liên kết "Chính sách bảo mật" tại chân trang (Footer) hoặc từ liên kết trong form tư vấn.
2. Ứng dụng mở trang `/chinh-sach-bao-mat` (`PrivacyPolicyPage`).
3. Trang hiển thị các điều khoản theo đúng quy định Nghị định 13/2023/NĐ-CP:
   - Loại dữ liệu thu thập (Họ tên, SĐT).
   - Mục đích sử dụng (Tư vấn, khảo sát địa điểm, lập báo giá tiệc).
   - Biện pháp bảo vệ an toàn thông tin (mã hóa đường truyền, phân quyền RBAC).
   - Thời hạn lưu trữ dữ liệu (đọc tự động từ biến `VITE_RETENTION_DAYS`).
   - Thông tin liên hệ của đơn vị bảo vệ dữ liệu (đọc từ `VITE_BUSINESS_DATA_PROTECTION_EMAIL` hoặc cấu hình doanh nghiệp trong `apps/web/src/lib/siteConfig.ts`).
4. Nếu biến `VITE_PRIVACY_POLICY_REVIEWED` chưa được gán là `true`, trang hiển thị biểu ngữ cảnh báo màu vàng: _"BẢN NHÁP — cần rà soát pháp lý"_.
5. Định kỳ hoặc theo lệnh quản trị, hệ thống thực thi script `apps/api/scripts/purge-leads.js` để xóa vĩnh viễn các lead quá hạn lưu trữ.

### 3.2. Luồng lỗi & Trường hợp biên

- **Thiếu biến cấu hình doanh nghiệp**: Ở môi trường không phải production, vị trí thiếu thông tin hiển thị nhãn `[chưa cấu hình]` thay vì in chuỗi rỗng hoặc lỗi giao diện.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/chinh-sach-bao-mat` (Công khai)
- **Tệp màn hình**: `apps/web/src/pages/PrivacyPolicyPage.tsx`
- **Cấu hình**: `apps/web/src/lib/siteConfig.ts`
- **Script thanh lọc dữ liệu**: `apps/api/scripts/purge-leads.js`

---

## 5. API Sử dụng

- `POST /api/leads`: Ghi nhận dữ liệu đồng ý kèm `consent = true`.
- Script bảo trì định kỳ `npm run purge-leads -- --older-than-days=N --confirm`: Thực thi xóa trực tiếp trên PostgreSQL các bản ghi quá hạn.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- **Bảng cơ sở dữ liệu**: `leads`
- **Các trường kiểm soát bảo mật**:
  - `consent`: Kiểu boolean, bắt buộc `true` khi người dùng gửi form.
  - `consent_at`: Mốc thời gian ghi nhận chấp thuận (Timestamp with timezone).
  - `consent_version`: Phiên bản điều khoản người dùng đã đồng ý (ví dụ: `v1.0`).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate Schema**: Zod schema `createLeadSchema` quy định `consent: z.literal(true)` (chặn ngay lập tức nếu client gửi `false` hoặc thiếu).
- **Phân quyền**: Trang chính sách mở công khai cho toàn bộ người dùng; script `purge-leads` chỉ thực thi trên máy chủ có kết nối cơ sở dữ liệu hợp lệ.

---

## 8. Dữ liệu cá nhân & Tuân thủ Pháp lý (NĐ 13/2023/NĐ-CP)

- Đảm bảo 8 quyền cơ bản của chủ thể dữ liệu (được biết, đồng ý, truy cập, chỉnh sửa, xóa dữ liệu).
- Mốc thời hạn lưu trữ dữ liệu mặc định là 180 ngày `[CẦN XÁC NHẬN: thời hạn pháp lý chính thức]`.

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Thiếu thông tin liên hệ: Hiển thị nhãn cảnh báo nội bộ để quản trị viên bổ sung biến môi trường.
- Chưa xác nhận xóa: Script `purge-leads` cảnh báo chế độ chạy thử nghiệm (dry-run) nếu thiếu cờ `--confirm`.

---

## 10. Kiểm thử liên quan

- **Integration Test API**: `apps/api/src/modules/leads/leads.test.js` (kiểm tra bắt buộc trường consent).
- **Unit Test Script**: `apps/api/tests/launchCheck.test.js` (kiểm tra điều kiện sẵn sàng triển khai chính sách bảo mật).

---

## 11. Giới hạn đã biết & Tồn đọng

- Biểu ngữ "BẢN NHÁP" sẽ được gỡ bỏ khi chuyên viên pháp lý chốt nội dung và bật `VITE_PRIVACY_POLICY_REVIEWED=true` (theo dõi tại [docs/FOLLOWUPS.md](../../FOLLOWUPS.md)).
