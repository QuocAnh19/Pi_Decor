# Tối ưu hóa Công cụ Tìm kiếm & Siêu dữ liệu (SEO & Metadata)

Tài liệu đặc tả kiến trúc tối ưu hóa công cụ tìm kiếm (Search Engine Optimization), quản lý siêu dữ liệu Open Graph / Twitter Cards, tệp thu thập thông tin và dữ liệu có cấu trúc JSON-LD cho dự án Pi Decor (_suy ra từ code_).

---

## 1. Mục tiêu và Người dùng

- **Mục tiêu**: Tối ưu khả năng hiển thị của Pi Decor trên các công cụ tìm kiếm (Google, Bing); chuẩn hóa hình ảnh và trích dẫn khi chia sẻ liên kết trên mạng xã hội (Facebook, Zalo); cung cấp sơ đồ trang web và chỉ dẫn thu thập dữ liệu (Robots & Sitemap).
- **Người dùng**: Khách tham quan (Visitor) và Các trình thu thập thông tin tìm kiếm (Search Engine Bots).

---

## 2. User Story liên quan

- Tham chiếu: **US-001** (Khám phá dịch vụ & nhận diện thương hiệu) tại [docs/product/USER_STORIES.md](../../product/USER_STORIES.md).

---

## 3. Luồng hoạt động

### 3.1. Luồng chính (Happy Path)

1. Khi người dùng hoặc bot truy cập vào bất kỳ trang nào (ví dụ: `/`, `/ban-do`, `/chinh-sach-bao-mat`), component `SEO` nạp cấu hình thương hiệu từ `apps/web/src/lib/siteConfig.ts`.
2. Thư viện `react-helmet-async` tự động bơm các thẻ meta vào khối `<head>` của tài liệu HTML:
   - `<title>` và `<meta name="description">` chuẩn hóa theo từng trang.
   - Thẻ chuẩn tắc `<link rel="canonical">` chống trùng lặp nội dung.
   - Siêu dữ liệu chia sẻ Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`).
   - Thẻ Twitter Card định dạng `summary_large_image`.
3. Tại trang chủ `/`, component sinh thẻ dữ liệu có cấu trúc `<script type="application/ld+json">` chuẩn Schema.org `LocalBusiness` thông qua hàm `generateLocalBusinessSchema()`.
4. Bot công cụ tìm kiếm đọc tệp `apps/web/public/robots.txt` để xác định các trang được phép thu thập dữ liệu và vị trí tệp sơ đồ trang web `apps/web/public/sitemap.xml`.

### 3.2. Luồng bảo vệ & Trường hợp biên

- **Khu vực quản trị nội bộ (`/admin/*`)**: Được gắn thẻ `noindex = true` (`<meta name="robots" content="noindex, nofollow" />`) để ngăn chặn bot lập chỉ mục các trang nội bộ.
- **Biến môi trường doanh nghiệp bị khuyết**: Hàm `generateLocalBusinessSchema()` tự động bỏ qua các trường trống (telephone, address, coordinates), không in chuỗi rỗng hay cú pháp lỗi vào JSON-LD.

---

## 4. Màn hình / Route & Thành phần Web

- **Route**: Toàn bộ các route công khai và nội bộ.
- **Thành phần chính**:
  - `SEO`: `apps/web/src/components/common/SEO.tsx`
  - Cấu hình doanh nghiệp & Schema: `apps/web/src/lib/siteConfig.ts`
  - Tệp chỉ dẫn Robot: `apps/web/public/robots.txt`
  - Sơ đồ trang web: `apps/web/public/sitemap.xml`

---

## 5. API Sử dụng

- Tính năng chạy hoàn toàn ở phía client/build-time thông qua cấu hình tĩnh và biến môi trường `VITE_BUSINESS_*`. Không gọi endpoint API nghiệp vụ.

---

## 6. Dữ liệu & Quy tắc cấu hình

- **Nguồn dữ liệu**: Đọc từ các biến môi trường doanh nghiệp tại `apps/web/.env.example`:
  - `VITE_BUSINESS_NAME`: Tên thương hiệu hiển thị.
  - `VITE_BUSINESS_TELEPHONE`, `VITE_BUSINESS_EMAIL`: Thông tin liên hệ.
  - `VITE_BUSINESS_STREET_ADDRESS`, `VITE_BUSINESS_LOCALITY`: Địa chỉ trụ sở.
  - `VITE_BUSINESS_LATITUDE`, `VITE_BUSINESS_LONGITUDE`: Tọa độ địa lý cho LocalBusiness.

---

## 7. Quy tắc Validate, Phân quyền & Rate Limit

- **Validate**: Kiểm tra tính hợp lệ của cấu trúc JSON-LD thông qua bộ test unit `apps/web/src/lib/siteConfig.test.ts`.
- **Phân quyền**: Công khai cho toàn bộ trang web.
- **Rate Limit**: Không áp dụng.

---

## 8. Dữ liệu cá nhân & Đồng ý (Consent)

- Không thu thập hay chia sẻ bất kỳ dữ liệu cá nhân nào của khách truy cập.

---

## 9. Trạng thái lỗi & Fallback

- Khi thiếu ảnh đại diện tùy biến (`ogImage`), hệ thống tự động fallback về ảnh mặc định `siteConfig.defaultOgImage` (`/images/hero.jpg`).

---

## 10. Kiểm thử liên quan

- **Unit Test Cấu hình & Schema**: `apps/web/src/lib/siteConfig.test.ts` (kiểm tra sinh schema LocalBusiness, kiểm tra ẩn trường rỗng).
- **E2E Test**: `e2e/scenarios.spec.ts` (kiểm tra thẻ tiêu đề và meta tag trên trang chủ).

---

## 11. Giới hạn đã biết & Tồn đọng

- Thông tin doanh nghiệp chính thức đang chờ chủ dự án cập nhật trong tệp biến môi trường `[CẦN XÁC NHẬN]`.
- Danh mục theo dõi: Tham chiếu [docs/FOLLOWUPS.md](../../FOLLOWUPS.md).
