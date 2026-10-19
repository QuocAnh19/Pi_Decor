# Thư mục Tài nguyên Ảnh Gốc (assets-src/images)

Thư mục này lưu trữ các tệp ảnh gốc chất lượng cao (PNG, JPG) của thương hiệu Pi Decor.

## Mục đích

- Các tệp ảnh gốc không được phục vụ trực tiếp tới trình duyệt của người dùng cuối để tối ưu hóa dung lượng tải trang (bundle size) và First Contentful Paint (FCP).
- Các tệp WebP tương ứng (bao gồm ảnh responsive đa kích thước: 800w, 1600w) được sinh tự động vào `apps/web/public/images/` qua script:

```bash
node scripts/optimize-images.mjs
```

## Danh sách tệp nguồn

- `hero.jpg`: Ảnh biểu trưng chính trên trang chủ (Hero section).
- `hero-collage-1.jpg`, `hero-collage-2.jpg`: Ảnh ghép giới thiệu phong cách trang trí tiệc cưới.
- `service-pievent.png`, `service-pikids.png`, `service-piwedding.png`: Ảnh biểu trưng các gói dịch vụ tổ chức sự kiện.
