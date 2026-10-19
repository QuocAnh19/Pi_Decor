# Quy tắc làm việc cho Agent (AGENTS.md)

Tài liệu này quy định các tiêu chuẩn và nguyên tắc bắt buộc khi làm việc trong repository Pi Decor (Monorepo: `apps/web` React 18 + Vite + TypeScript, `apps/api` Express 5 + Postgres ESM, `packages/shared` Zod + DTO TypeScript). Node.js theo [.nvmrc](.nvmrc) (`20`).

---

## 1. Cấu trúc Monorepo & Phạm vi tệp

- **Cấu trúc chuẩn**: Mã nguồn được phân chia thành npm workspaces:
  - `apps/web`: Frontend React 18, Vite, SCSS Modules, TanStack Query.
  - `apps/api`: Backend Express 5 ESM, PostgreSQL pool, modular architecture (`src/modules/*`).
  - `packages/shared`: Nguồn duy nhất chứa Zod schemas, DTO types, regex SĐT VN dùng chung.
- **Không tái tạo thư mục cũ**: Tuyệt đối **KHÔNG** tạo lại thư mục `client/` hay `server/`.
- **Quản lý Schema & DTO**: Mọi schema Zod và kiểu dữ liệu dùng chung giữa client và server chỉ được khai báo và sửa đổi trong `packages/shared`. Không viết trùng lặp ở `apps/web` hoặc `apps/api`.

---

## 2. Quy tắc Commit & Phạm vi công việc

- **1 Nhiệm vụ = 1 Commit**: Mỗi nhiệm vụ tương ứng với đúng 1 commit tuân thủ Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`), mô tả ngắn gọn, rõ ràng.
- **Tuân thủ đúng phạm vi (Scope)**: Tuyệt đối không làm ngoài phạm vi prompt. Nếu phát hiện vấn đề kỹ thuật khác, ghi nhận vào [docs/FOLLOWUPS.md](docs/FOLLOWUPS.md) thay vì tự ý sửa.

---

## 3. API & Tương thích ngược

- **Bảo toàn giao diện API**: Không đổi tên route, không đổi cấu trúc/hình dạng response của API, trừ khi prompt yêu cầu rõ ràng.
- **Kiểm tra tham chiếu trước khi xóa**: Trước khi xóa file hoặc hàm, phải grep toàn bộ repository và chạy typecheck để đảm bảo không còn bất kỳ tham chiếu nào.

---

## 4. Tiêu chuẩn viết Code & Ghi chú

- **Quy chuẩn Comment**: Viết comment bằng tiếng Việt, chỉ giải thích "vì sao" (lý do thiết kế/ràng buộc kỹ thuật), không mô tả lại cú pháp code.
- **Giới hạn kích thước file**: Mọi file mới tuyệt đối không vượt quá 300 dòng (theo luật `max-lines`).
- **Bảo mật tuyệt đối**: Không bao giờ commit file `.env` hoặc thông tin bí mật (secret keys, tokens, mật khẩu). Giá trị mẫu an toàn chỉ nằm trong `.env.example`.

---

## 5. Kiểm tra bắt buộc trước mỗi commit

Mọi prompt và trước khi commit đều bắt buộc phải chạy và vượt qua script kiểm tra toàn diện từ thư mục gốc:

```bash
npm run verify
```

Lệnh này sẽ tuần tự kiểm tra (dừng ngay ở lỗi đầu tiên):

1. `packages/shared`: build ra dist và dts.
2. `apps/web`: `typecheck` (`tsc --noEmit`), `lint` (ESLint), `lint:styles` (Stylelint), `knip` (kiểm tra dead code), `test` (Vitest), `build`.
3. `apps/api`: `check:db-env`, `lint` (ESLint), `check:syntax` (`node --check` toàn bộ file `.js` trong `src`), `migrate`, `test` (Vitest tích hợp).

Có thể chạy riêng lẻ từng phần khi đang phát triển:

- Web: `npm run verify:web`
- API: `npm run verify:api`

- **Tính trung thực trong báo cáo trạng thái**: Tuyệt đối **KHÔNG** ghi trạng thái "ĐẠT" cho CI, e2e hay drill nếu chưa xem kết quả thực tế của chính lần chạy đó; chỉ ghi "chưa xác minh".

---

## 6. Hướng dẫn chạy cục bộ từ máy trống

1. **Khởi động cơ sở dữ liệu PostgreSQL**:
   ```bash
   docker compose up -d
   ```
2. **Cấu hình biến môi trường**:
   - Copy `apps/api/.env.example` thành `apps/api/.env` và điền cấu hình thử nghiệm.
   - Copy `apps/web/.env.example` thành `apps/web/.env`.
3. **Cài đặt dependencies**:
   ```bash
   npm install
   ```
4. **Khởi tạo dữ liệu backend**:
   ```bash
   cd apps/api && npm run migrate && npm run seed && cd ../..
   ```
5. **Chạy ứng dụng chế độ phát triển**:
   - Chạy cả hai từ gốc: `npm run dev:web` và `npm run dev:api`.
   - Hoặc chạy trong từng workspace tương ứng (`cd apps/web && npm run dev`, `cd apps/api && npm run dev`).
