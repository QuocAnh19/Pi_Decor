# Kiểm kê nguồn dữ liệu giao diện (DATA_SOURCES.md)

Tài liệu này ghi nhận hiện trạng và quyết định chuyển đổi toàn bộ dữ liệu giao diện từ dữ liệu cứng tĩnh (`client/src/lib/content.ts`) sang cơ sở dữ liệu và REST API tương ứng (Nhiệm vụ P12).

---

## 1. Bảng kiểm kê các export của `client/src/lib/content.ts`

| Export trong `lib/content.ts` | File/Component đang dùng | Endpoint API tương ứng | Quyết định xử lý | Lý do & Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| `heroMedia` | `client/src/components/sections/Hero.tsx` | Không có (tài nguyên tĩnh) | **Giữ làm nội dung tĩnh** | Ảnh bìa hero trang chủ (landscape), đặt tại `public/images/hero.jpg`. |
| `heroCollageMedia` | `client/src/components/sections/Hero.tsx` | Không có (tài nguyên tĩnh) | **Giữ làm nội dung tĩnh** | Cặp ảnh polaroid trang trí lớp trên hero, cố định theo thiết kế layout Swan Agency. |
| `serviceCategories` | `client/src/features/services/components/ServicesSection.tsx` | `GET /api/services` | **Chuyển sang API** | Đã có CRUD và seed trên server (`servicesRouter`). Admin cập nhật dịch vụ thì trang chủ phải phản ánh theo. Xóa khỏi `content.ts`. |
| `categoryPortfolio` | `client/src/features/services/components/ServicesSection.tsx`<br>`client/src/components/sections/Lookbook.tsx`<br>`client/src/features/map/components/VenuePopupCard.tsx`<br>`client/src/features/projects/hooks/useProjects.ts` | `GET /api/projects` | **Chuyển sang API** & seed DB | Chuyển toàn bộ 19 dự án portfolio mẫu vào `server/src/utils/seed.js` dưới dạng seed idempotent. Mọi component chuyển sang nạp từ `GET /api/projects`. Xóa khỏi `content.ts`. |
| `testimonials` | Không có component nào dùng (`useTestimonials.ts` đã gọi API) | `GET /api/testimonials` | **Xóa hoàn toàn** | Dữ liệu mock tĩnh thừa từ trước khi có API `GET /api/testimonials`. Trang chủ đã nạp 100% từ DB qua `useTestimonials`. |

---

## 2. Kế hoạch triển khai kỹ thuật (Nhiệm vụ P12)

1. **Seed Idempotent tại Server (`server/src/utils/seed.js`)**:
   - Chuyển 19 dự án mẫu từ `categoryPortfolio` (8 PiWedding, 6 PiKids, 5 PiEvent) vào nguồn seed DB.
   - Kiểm tra `title` trước khi `insert` để đảm bảo idempotent khi chạy `npm run seed` nhiều lần không sinh trùng dữ liệu.

2. **Dịch vụ (`features/services`)**:
   - Khôi phục hàm `api.getServices()` với kiểu trả về chặt chẽ `Promise<ServiceCategory[]>`.
   - `ServicesSection` nạp `services` từ `api.getServices()` và danh mục portfolio từ `api.getProjects()`.
   - Bổ sung Skeleton loading, thông báo lỗi có nút thử lại ("Thử lại"), và Empty state thân thiện.

3. **Lookbook & Portfolio (`components/sections/Lookbook.tsx`, `VenuePopupCard.tsx`, `useProjects.ts`)**:
   - Sử dụng trực tiếp danh sách từ `api.getProjects()` (chỉ trả dự án đã publish).
   - Xóa bỏ hoàn toàn cơ chế fallback về `categoryPortfolio`.
   - Xóa `categoryPortfolio` và `testimonials` khỏi `client/src/lib/content.ts`.
