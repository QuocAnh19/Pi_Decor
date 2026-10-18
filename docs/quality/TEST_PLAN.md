# Kế Hoạch Kiểm Thử Toàn Diện (TEST_PLAN.md)

Tài liệu xác định chiến lược, phạm vi, môi trường, tiêu chí chất lượng và số liệu kiểm thử thực tế của nền tảng Pi Decor.

---

## 1. Mục Tiêu & Phạm Vi Kiểm Thử

- **Mục tiêu**: Đảm bảo toàn bộ luồng nghiệp vụ khách hàng (xem dịch vụ, lọc lookbook, phối cảnh Studio, gửi lead kèm đồng ý bảo mật) và quản trị viên (đăng nhập, xử lý lead, lập báo giá, quản lý nội dung) vận hành tin cậy, không phát sinh lỗi hồi quy.
- **Trong phạm vi (In-scope)**:
  - Frontend SPA (`apps/web`): Logic Studio canvas, mappers hai chiều, auth store, form liên hệ, bảng điều khiển admin.
  - Backend API (`apps/api`): Xác thực JWT rotation, phân quyền, validation Zod, giao dịch DB nguyên tử, upload ảnh Cloudinary, sanitize SVG.
  - Hợp đồng tích hợp (`packages/shared`): Đồng bộ schema, kiểu dữ liệu DTO và regex số điện thoại Việt Nam.
  - Giao diện trực quan: Visual regression snapshots trên Desktop (`1280x800`) và Mobile (`390x844`).
- **Ngoài phạm vi (Out-of-scope)**: Kiểm thử tải cực hạn (Stress/Load testing hàng vạn người dùng đồng thời) [CẦN XÁC NHẬN: thực hiện ở giai đoạn mở rộng quy mô].

---

## 2. Chiến Lược Kiểm Thử Đa Tầng (Test Strategy)

```
        ▲
       / \      Tầng 4: Visual Regression Testing (Playwright Snapshots)
      /   \     Tầng 3: End-to-End Tests (Playwright Chromium / WebServer)
     /     \    Tầng 2: API Integration Tests (Vitest + Supertest + Postgres thật)
    /_______\   Tầng 1: Unit & Component Tests (Vitest + React Testing Library)
```

1. **Tầng 1 — Unit & Component Tests (`apps/web`)**:
   - Công cụ: Vitest v8, jsdom, `@testing-library/react`.
   - Đối tượng: Logic thuần Studio (`curtainRules`, `designSnapshotSerializer`, `recolorSvg`), mappers (`studioMappers`, `leadsMappers`), hook trạng thái, form validation.
   - Số lượng: 23 bài kiểm thử đơn vị.
2. **Tầng 2 — API Integration Tests (`apps/api`)**:
   - Công cụ: Vitest, Supertest, kết nối PostgreSQL thật (không dùng mock DB).
   - Đối tượng: Toàn bộ 9 module REST API (`auth`, `leads`, `quotations`, `projects`, `venues`, `materials`, `services`, `testimonials`, `studio`), kiểm tra ràng buộc khóa ngoại, SQL transactions, sanitize DOMPurify và token rotation.
   - Số lượng: 90 bài kiểm thử tích hợp.
3. **Tầng 3 — End-to-End Tests (`e2e/`)**:
   - Công cụ: Playwright Test Runner.
   - Cơ chế: `webServer` tự động build web preview và khởi động API server; `globalSetup` chạy migration và nạp seed DB kiểm thử độc lập.
   - Kịch bản: 17 kịch bản end-to-end bao phủ luồng khách gửi lead, admin tạo báo giá `BG-YYYY-XXXX`, phê duyệt đánh giá, và session resilience.
4. **Tầng 4 — Visual Regression Testing**:
   - So sánh ảnh chụp màn hình (`toHaveScreenshot`) với ngưỡng sai lệch pixel cho phép, tự động mask các vùng nội dung động (thời gian, avatar) trên 6 màn hình chính.

---

## 3. Môi Trường & Dữ Liệu Kiểm Thử

- **Môi trường cục bộ (Local)**:
  - Node.js 20 theo `.nvmrc`.
  - Cơ sở dữ liệu: PostgreSQL 16 chạy qua Docker Compose (`docker compose up -d`).
- **Môi trường tích hợp liên tục (CI)**:
  - GitHub Actions Runner `ubuntu-latest`.
  - Service container `postgres:16-alpine` với cấu hình mạng nội bộ kiểm thử.
- **Dữ liệu kiểm thử (Test Seed Data)**:
  - Khởi tạo qua script `apps/api/src/utils/seed.js` và `e2e/global-setup.ts`.
  - Tài khoản Admin thử nghiệm cố định: `admin@pidecor.vn` / mật khẩu kiểm thử (tuyệt đối không dùng thông tin thực).
  - Mock tiles OpenStreetMap: Trả về ảnh SVG trống để bài test bản đồ không phụ thuộc mạng internet ngoài.

---

## 4. Tiêu Chí Vào / Ra (Entry & Exit Criteria)

- **Tiêu chí bắt đầu (Entry Criteria)**:
  - Mã nguồn biên dịch sạch (`npm run build:shared` thành công).
  - Không có lỗi cú pháp hoặc vi phạm linter (`npm run lint`, `npm run check:syntax`).
  - Toàn bộ migrations cơ sở dữ liệu được áp dụng thành công.
- **Tiêu chí nghiệm thu (Exit Criteria)**:
  - 100% bài kiểm thử tự động (113 Vitest + 17 Playwright E2E) vượt qua với mã trạng thái 0.
  - Vượt qua kiểm tra toàn diện `npm run verify` từ thư mục gốc.
  - Độ bao phủ code (Coverage) không được thấp hơn ngưỡng sàn quy định.
  - Quét an ninh npm audit không còn lỗ hổng mức `CRITICAL` hoặc `HIGH`.

---

## 5. Số Liệu Độ Bao Phủ Code Thực Tế (Coverage)

Ghi nhận thực tế từ công cụ `@vitest/coverage-v8`:

| Khu vực                   | Statements / Lines | Branches   | Functions  | Ngưỡng chặn tụt quy định                             |
| :------------------------ | :----------------- | :--------- | :--------- | :--------------------------------------------------- |
| **`apps/web` (Frontend)** | **14.59%**         | **46.52%** | **31.94%** | `statements: 9%`, `branches: 40%`, `functions: 26%`  |
| **`apps/api` (Backend)**  | **59.20%**         | **48.53%** | **66.25%** | `statements: 54%`, `branches: 43%`, `functions: 61%` |

---

## 6. Rủi Ro Chưa Bao Phủ & Giải Pháp Khắc Phục

1. **Khoảng trống E2E ở một số màn hình quản trị nội bộ**:
   - _Hiện trạng_: US-012 (Kiểm duyệt đánh giá), US-013 & US-014 (Quản lý tài khoản Admin) đã có 100% API integration test nhưng chưa có kịch bản E2E UI Playwright riêng.
   - _Biện pháp_: Áp dụng quy trình nghiệm thu thủ công theo [UAT_CHECKLIST.md](UAT_CHECKLIST.md).
2. **Biến động mạng khi tải tài nguyên Cloudinary**:
   - _Biện pháp_: Trong test E2E, Playwright thiết lập timeout hợp lý và intercept các request ảnh nếu mạng chậm.
