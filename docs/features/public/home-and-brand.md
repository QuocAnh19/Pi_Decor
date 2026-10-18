# Trang chủ & Nhận diện Thương hiệu (Home & Brand)

Tài liệu đặc tả chức năng trang chủ, khối Hero giới thiệu thương hiệu và hệ thống điều hướng toàn trang của Pi Decor (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Định vị thương hiệu Pi Decor là đơn vị thiết kế và trang trí tiệc cưới, sự kiện cao cấp; cung cấp điểm chạm đầu tiên dẫn dắt người dùng khám phá dịch vụ, lookbook, bản đồ và công cụ Studio.
- **Người dùng**: Khách tham quan (Visitor) và Khách hàng tiềm năng (Prospect).

---

## 2. User Story liên quan

- Tham chiếu: **US-001** (Khám phá dịch vụ), **US-002** (Xem lookbook dự án) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng người dùng

### 3.1. Luồng chính (Happy Path)

1. Người dùng truy cập đường dẫn gốc `/`.
2. Header điều hướng (`Navbar`) cố định hiển thị logo Pi Decor, menu dịch vụ, lookbook, bản đồ và nút kêu gọi hành động "Thiết kế Studio".
3. Khối Hero hiển thị thông điệp thương hiệu, hình ảnh full-bleed chất lượng cao (`hero-1600w.webp` / `hero.jpg`) và nút CTA chính dẫn tới `/studio`.
4. Người dùng cuộn trang để duyệt tuần tự các khối: Dịch vụ (`Services`), Lookbook (`Lookbook`), Bản đồ tóm tắt (`MapTeaser`), Đánh giá (`Testimonials`) và Lời kêu gọi chốt hạ (`ClosingCta`).
5. Footer hiển thị thông tin liên hệ, hotline, địa chỉ, bản quyền và liên kết tới `/chinh-sach-bao-mat`.

### 3.2. Luồng lỗi & Trường hợp biên

- **Mạng chậm / Mất kết nối**: Ảnh hero và các khối nội dung sử dụng kỹ thuật nạp trễ (lazy loading) hoặc progressive images; nếu API dịch vụ/đánh giá lỗi thì các khối tĩnh vẫn hiển thị bình thường.
- **Màn hình siêu nhỏ (< 360px)**: Navbar tự động co gọn vào menu mobile hamburger, đảm bảo không vỡ layout.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: `/` (Công khai)
- **Tệp màn hình**: `apps/web/src/pages/HomePage.tsx`
- **Thành phần chính**:
  - `Navbar`: `apps/web/src/components/layout/Navbar.tsx`
  - `Hero`: `apps/web/src/components/sections/Hero.tsx`
  - `ClosingCta`: `apps/web/src/components/sections/ClosingCta.tsx`
  - `Footer`: `apps/web/src/components/layout/Footer.tsx`
  - `SEO`: `apps/web/src/components/common/SEO.tsx`

---

## 5. API Sử dụng

- Trang chủ tổng hợp dữ liệu từ các API công khai của các khối con:
  - `GET /api/services`: Tải danh mục dịch vụ nổi bật (quyền công khai).
  - `GET /api/projects`: Tải danh sách tác phẩm Lookbook đã xuất bản (quyền công khai).
  - `GET /api/testimonials`: Tải đánh giá đã phê duyệt (quyền công khai).
- Bản thân khối Hero và Navbar dùng cấu hình tĩnh và biến môi trường doanh nghiệp qua `apps/web/src/lib/siteConfig.ts`.

---

## 6. Dữ liệu & Quy tắc ràng buộc

- Khối Hero đọc cấu hình nội dung thương hiệu từ `apps/web/src/lib/content.ts` và biến `VITE_BUSINESS_*`.
- Ảnh Hero phân phối từ `apps/web/public/images/hero-1600w.webp` (và fallback `hero.jpg`).

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Phân quyền**: Công khai hoàn toàn (Public - không yêu cầu đăng nhập).
- **Rate Limit**: Áp dụng chung mức bảo vệ reverse proxy/CDN; các API con có rate limit riêng theo quy định tại [docs/product/ROLES_PERMISSIONS.md](../../product/ROLES_PERMISSIONS.md).

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Khối này không thu thập dữ liệu cá nhân của người dùng.
- Footer cung cấp liên kết minh bạch tới Chính sách bảo mật (`/chinh-sach-bao-mat`).

---

## 9. Trạng thái lỗi & Thông báo hiển thị

- Khi các API dịch vụ hoặc lookbook gặp lỗi tải, các component con hiển thị trạng thái `EmptyState` hoặc thông báo lỗi nhẹ nhàng mà không làm sập toàn bộ trang chủ.

---

## 10. Kiểm thử liên quan

- **E2E Playwright**: `e2e/scenarios.spec.ts` (kịch bản tải trang chủ thành công, điều hướng mượt mà).
- **Visual Regression**: `e2e/visual.spec.ts` (kiểm tra giao diện trang chủ khớp baseline trên Desktop và Mobile).

---

## 11. Giới hạn đã biết & Tồn đọng

- Video nền Hero (`hero.mp4`): Đã chuẩn bị sẵn logic nạp video tự phát nhưng hiện tại đang ưu tiên hiển thị ảnh tối ưu WebP để tiết kiệm băng thông `[CẦN XÁC NHẬN]`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
