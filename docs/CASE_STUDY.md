# Nghiên Cứu Điển Hình: Nền Tảng Dịch Vụ Cưới Pi Decor (CASE_STUDY.md)

Nghiên cứu điển hình (Case Study) tổng kết quá trình phát triển, hiện đại hóa kiến trúc và kết quả đo lường kỹ thuật của dự án **Pi Decor** — Nền tảng giới thiệu dịch vụ trang trí tiệc cưới, xưởng thiết kế trực quan Studio và hệ thống CRM quản trị báo giá.

---

## 1. Bối Cảnh & Bài Toán Nghiệp Vụ

Ngành trang trí tiệc cưới cao cấp tại Việt Nam đối mặt với những thách thức đặc thù:

- **Tư vấn thủ công, tốn thời gian**: Khách hàng khó hình dung cách phối màu và phông nền sân khấu trước ngày cưới, dẫn đến chu kỳ tư vấn kéo dài và tỷ lệ chốt hợp đồng thấp.
- **Rủi ro thất thoát dữ liệu khách hàng**: Việc ghi nhận lead và lập dự toán chi phí qua bảng tính rời rạc gây khó khăn trong việc theo dõi lịch sử chăm sóc và tuân thủ quy định bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP).
- **Yêu cầu hệ thống hiện đại**: Cần một nền tảng web trực quan kết hợp xưởng Studio 2D Canvas cho phép cô dâu chú rể tự phối màu phông cưới, xuất ảnh thiết kế và kết nối tự động với hệ thống CRM báo giá nguyên tử cho ban quản trị.

---

## 2. Vai Trò Của Chủ Dự Án

- **Định hình sản phẩm & bài toán kinh doanh**: [CẦN XÁC NHẬN: Xác định tập tính năng cốt lõi, đối tượng khách hàng mục tiêu và tiêu chuẩn nghiệm thu].
- **Định hướng mỹ thuật & trải nghiệm người dùng**: [CẦN XÁC NHẬN: Tuyển chọn bảng màu tiệc cưới, phong cách thiết kế Studio và bộ sưu tập dự án Lookbook].
- **Thẩm định vận hành & quy trình chốt báo giá**: [CẦN XÁC NHẬN: Thiết lập quy tắc định giá, hạn mức chiết khấu và quy trình tiếp nhận thông tin khách hàng].

---

## 3. Các Quyết Định Kiến Trúc Trọng Tâm (ADRs)

Hệ thống được thiết kế theo các tiêu chuẩn kỹ thuật nghiêm ngặt và đã được ghi nhận trong danh mục Quyết định Kiến trúc:

1. **Chuyển dịch sang PostgreSQL**: [ADR-0001](adr/0001-postgresql-over-json-db.md) thay thế toàn bộ cơ sở dữ liệu tệp JSON ban đầu bằng PostgreSQL, áp dụng khóa ngoại, chỉ mục trigram và tính toàn vẹn giao dịch ACID.
2. **Bảo mật xác thực đa tầng**: [ADR-0002](adr/0002-refresh-token-rotation-hash.md) triển khai cơ chế JWT Access Token 15 phút, Refresh Token xoay vòng (Rotation) và tự động thu hồi toàn bộ phiên làm việc khi phát hiện tái sử dụng token cũ (Reuse Detection).
3. **Cấu hình an toàn Fail-Closed**: [ADR-0003](adr/0003-fail-closed-env-zod.md) dùng Zod xác thực toàn bộ biến môi trường ngay lúc khởi động, từ chối chạy khi thiếu khóa bí mật hoặc cấu hình không an toàn.
4. **Phòng chống tấn công XSS đồ họa**: [ADR-0004](adr/0004-dompurify-svg-sanitization.md) tích hợp DOMPurify làm sạch triệt để mọi mã độc JavaScript trong tệp mẫu phông cưới SVG tải lên Studio.
5. **Đồng bộ trạng thái phía máy khách**: [ADR-0006](adr/0006-tanstack-query-data-fetching.md) dùng TanStack Query để quản lý Server State, cơ chế stale-while-revalidate và xóa lạc quan (Optimistic Deletion) trên giao diện admin.
6. **Kiến trúc Monorepo & DTO dùng chung**: [ADR-0007](adr/0007-npm-workspaces-monorepo-shared.md) cô lập `packages/shared` làm nguồn chân lý duy nhất cho Zod Schemas và DTOs giữa `apps/web` và `apps/api`.
7. **Sinh số báo giá nguyên tử**: [ADR-0011](adr/0011-atomic-quotation-numbering.md) bảo đảm mã số `BG-YYYY-XXXX` không bị trùng lặp hay gián đoạn qua bảng đếm chuyên dụng.
8. **Cô lập bản nháp ở tầng API**: [ADR-0012](adr/0012-filter-draft-projects-public-api.md) lọc dự án chưa xuất bản trực tiếp tại câu lệnh SQL, đảm bảo không rò rỉ dữ liệu nháp ra ngoài.

---

## 4. Kết Quả Đo Lường Kỹ Thuật Thực Tế

Toàn bộ các chỉ số dưới đây được đo lường tự động và chính xác bằng công cụ `npm run metrics` (`scripts/collect-metrics.mjs`) vào ngày **2026-10-19**:

| Chỉ số Đo lường                       | Giá trị Đo được                | Phương pháp & Ghi chú                                       |
| :------------------------------------ | :----------------------------- | :---------------------------------------------------------- |
| **Kích thước JS ban đầu (Gzip)**      | **83.30 kB** (Raw: 383.81 kB)  | Đo trên tệp `dist/assets/index-*.js` bằng `zlib.gzipSync`   |
| **Số lượng Chunks JS**                | **31 chunks**                  | Tách mã động theo từng route và thư viện vendor qua Vite    |
| **Thời gian Build Frontend**          | **16.15 giây**                 | `tsc && vite build` trên Node.js v20                        |
| **Quy mô mã nguồn (LOC)**             | **36,743 dòng code** (408 tệp) | Đếm toàn bộ dòng code nguồn `.ts`, `.tsx`, `.js`, `.scss`   |
| **Tỷ lệ trùng lặp mã (Duplication)**  | **2.10%**                      | Kiểm tra tự động bằng `jscpd` trên toàn bộ repository       |
| **Số lượng REST API Endpoints**       | **54 endpoints**               | Các routes chuẩn RESTful trải rộng trên 8 modules nghiệp vụ |
| **Số lượng Bảng Cơ sở dữ liệu**       | **15 bảng**                    | PostgreSQL chuẩn hóa phân tách theo CRM, Studio, Nội dung   |
| **Số lượng Bài Kiểm thử (Automated)** | **138 tests** (46 web, 92 api) | 100% bài kiểm thử Unit, Integration và API vượt qua         |
| **Độ bao phủ Backend (Statements)**   | **62.71%** (Functions: 68.19%) | Đo qua Vitest v8 tích hợp cơ sở dữ liệu PostgreSQL thực     |
| **Độ bao phủ Frontend (Statements)**  | **14.61%** (Functions: 31.94%) | Bao phủ logic Studio, timeline, form lead và state mappers  |

---

## 5. Giá Trị Đạt Được & Lợi Thế Cạnh Tranh

1. **Hiệu năng vượt trội**: Bundle tĩnh chỉ **83.30 kB gzip** giúp trang chủ đạt điểm Google Lighthouse tối ưu, thời gian phản hồi API dưới 50ms nhờ kết nối trực tiếp PostgreSQL và CDN Cloudinary.
2. **Trải nghiệm khách hàng khác biệt**: Xưởng Studio phối cảnh cho phép khách hàng tương tác trực tiếp, tự sáng tạo tiệc cưới và nhận báo giá trong vòng 60 giây.
3. **An toàn dữ liệu tuyệt đối**: Mã nguồn không chứa thông tin bí mật (Gitleaks verified), đáp ứng nghiêm ngặt Nghị định 13/2023/NĐ-CP với công cụ xuất/xóa dữ liệu cá nhân chuyên dụng.
