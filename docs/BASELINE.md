# Báo cáo Baseline Kiểm tra (BASELINE.md)

Thời điểm thực hiện: 2026-10-12

Báo cáo ghi nhận trạng thái kiểm tra chất lượng mã nguồn ban đầu của repository Pi Decor trước khi tiến hành các bước hardening tiếp theo. Theo đúng yêu cầu P00, không sửa bất kỳ lỗi baseline nào tại bước này.

---

## 1. Client (`client/`)

| Lệnh kiểm tra | Kết quả | Chi tiết |
| :--- | :--- | :--- |
| `npm ci` | **PASS** | Hoàn tất cài đặt sạch dependencies (289 packages). |
| `npx tsc --noEmit` | **PASS** | Không có lỗi biên dịch TypeScript (0 errors). |
| `npm run lint` | **PASS (Có warnings)** | **0 lỗi (0 errors)**, **61 cảnh báo (61 warnings)**. |
| `npm run build` | **PASS** | Bản build Vite + TypeScript thành công (`dist/` bundle hoàn chỉnh). |

### Thống kê cảnh báo ESLint trên Client (61 warnings):
- **`max-lines` (File quá 300 dòng)**: 18 warnings (tại các file admin page, studio components, forms).
- **`@typescript-eslint/no-explicit-any`**: 39 warnings (sử dụng kiểu `any` chưa tường minh).
- **`react-hooks/exhaustive-deps`**: 4 warnings (thiếu dependency trong `useEffect` hook).

---

## 2. Server (`server/`)

| Lệnh kiểm tra | Kết quả | Chi tiết |
| :--- | :--- | :--- |
| `npm ci` | **FAIL** | Lỗi xung đột peer dependency (`ERESOLVE`). Gói `multer-storage-cloudinary@4.0.0` yêu cầu `peer cloudinary@^1.21.0`, trong khi project cài đặt `cloudinary@^2.5.0`. |
| `node --check` (toàn bộ file `server/src/`) | **PASS** | 28/28 file JavaScript ESM vượt qua kiểm tra cú pháp (0 lỗi). |

### Danh sách 28 file `server/src` đã kiểm tra cú pháp (`node --check`):
1. `server/src/app.js` — PASS
2. `server/src/config/auth.js` — PASS
3. `server/src/config/database.js` — PASS
4. `server/src/config/database.pg.js` — PASS
5. `server/src/config/env.js` — PASS
6. `server/src/middlewares/rateLimiters.js` — PASS
7. `server/src/middlewares/validate.js` — PASS
8. `server/src/middlewares/verifyToken.js` — PASS
9. `server/src/routes/admin/index.js` — PASS
10. `server/src/routes/auth/index.js` — PASS
11. `server/src/routes/designs/index.js` — PASS
12. `server/src/routes/leads/index.js` — PASS
13. `server/src/routes/materials/index.js` — PASS
14. `server/src/routes/projects/index.js` — PASS
15. `server/src/routes/quotations/index.js` — PASS
16. `server/src/routes/services/index.js` — PASS
17. `server/src/routes/studio/index.js` — PASS
18. `server/src/routes/testimonials/index.js` — PASS
19. `server/src/routes/venues/index.js` — PASS
20. `server/src/schemas/auth.schema.js` — PASS
21. `server/src/schemas/leads.schema.js` — PASS
22. `server/src/schemas/materials.schema.js` — PASS
23. `server/src/schemas/venues.schema.js` — PASS
24. `server/src/server.js` — PASS
25. `server/src/utils/crudRouterFactory.js` — PASS
26. `server/src/utils/sanitizeSvg.js` — PASS
27. `server/src/utils/seed.js` — PASS
28. `server/src/utils/uploadImage.js` — PASS
