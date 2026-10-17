# Báo cáo Kiểm thử & Độ bao phủ Code (TESTING.md)

Tài liệu này theo dõi các chỉ số kiểm thử tự động, độ bao phủ mã nguồn (Code Coverage) qua Vitest v8, và cấu hình kịch bản End-to-End (E2E Playwright) cho dự án Pi Decor.

---

## 1. Số liệu Code Coverage Hiện tại (Vitest v8)

Số liệu ghi nhận thực tế tại mốc P35 (bao gồm Unit tests, Integration tests, Component tests):

| Khu vực                   | Statements / Lines | Branches   | Functions  | Ghi chú                                                                                                  |
| :------------------------ | :----------------- | :--------- | :--------- | :------------------------------------------------------------------------------------------------------- |
| **`apps/web` (Frontend)** | **14.59%**         | **46.52%** | **31.94%** | Bao phủ logic Studio, mappers, authStore, siteConfig, LeadForm, LeadDetailDrawer timeline, AdminServices |
| **`apps/api` (Backend)**  | **59.20%**         | **48.53%** | **66.25%** | Bao phủ toàn bộ các module REST API (auth, leads, quotations, services, venues, materials, studio)       |

### Ngưỡng chặn tụt độ bao phủ (Coverage Thresholds)

Đặt ngưỡng thấp hơn mốc hiện tại ~5 điểm phần trăm trong cấu hình Vitest (`vitest.config.js` / `vite.config.ts`) để bảo vệ chất lượng mã nguồn:

- **`apps/web`**: `statements: 9%`, `branches: 40%`, `functions: 26%`, `lines: 9%`
- **`apps/api`**: `statements: 54%`, `branches: 43%`, `functions: 61%`, `lines: 54%`

Lệnh chạy kiểm tra coverage:

```bash
npm run test:coverage
```

---

## 2. Kịch bản E2E Playwright

Thư mục `e2e/` bao gồm các kịch bản kiểm thử tích hợp đầu-cuối:

1. **Flow Khách hàng & Lead**: Tải trang chủ, hiển thị danh sách dịch vụ động từ API; gửi form liên hệ có tích chọn đồng ý điều khoản bảo mật; dữ liệu xuất hiện ngay trong Admin Leads.
2. **Flow Admin & Nghiệp vụ Báo giá**: Đăng nhập owner/admin; đổi trạng thái lead; tạo báo giá tự động format `BG-YYYY-XXXX`; kiểm tra timeline hoạt động ghi nhận đầy đủ log.
3. **Flow Testimonials**: Khách gửi đánh giá; admin duyệt approved; đánh giá xuất hiện công khai trên trang chủ.
4. **Flow Studio Phối cảnh**: Chọn template, đổi chữ / màu sắc trực tiếp trên canvas; bấm xuất ảnh thiết kế và kiểm tra kích hoạt sự kiện download.
5. **Flow Định tuyến & Session Resilience**: Mở trực tiếp link admin `/admin/leads` (refresh) không bị 404; tự động làm mới access token khi hết hạn thông qua refresh token cookie/header.
6. **Bản đồ Dự án**: Chặn (_mock/intercept_) các request tile bản đồ bên ngoài bằng ảnh trống để test ổn định độc lập mạng internet.
7. **Visual Baseline Screenshots**: Chụp màn hình so sánh sai lệch (`toHaveScreenshot`) ở 2 kích thước viewport (Desktop: `1280x800`, Mobile: `390x844`) cho 6 trang trọng điểm, tự động mask các vùng nội dung động.
