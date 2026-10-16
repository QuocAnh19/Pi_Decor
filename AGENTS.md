# Quy tắc làm việc cho Agent (AGENTS.md)

Tài liệu này quy định các tiêu chuẩn và nguyên tắc bắt buộc khi làm việc trong repository Pi Decor (Monorepo: `apps/web` React 18 + Vite + TypeScript, `apps/api` Express 5 + Postgres ESM, `packages/*`).

## 1. Quy tắc Commit & Phạm vi công việc

- **1 Nhiệm vụ = 1 Commit**: Mỗi nhiệm vụ tương ứng với 1 commit tuân thủ quy chuẩn Conventional Commits (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`), mô tả ngắn gọn, rõ ràng.
- **Tuân thủ đúng phạm vi (Scope)**: Không làm ngoài phạm vi prompt. Nếu phát hiện vấn đề khác, ghi vào `docs/FOLLOWUPS.md` (tạo nếu chưa có) thay vì tự sửa.

## 2. API & Tương thích ngược

- **Bảo toàn giao diện API**: Không đổi tên route, không đổi hình dạng response của API, trừ khi prompt yêu cầu rõ.
- **Kiểm tra tham chiếu trước khi xóa**: Trước khi xóa file/hàm: grep toàn repo và chạy tsc để chắc chắn không còn tham chiếu.

## 3. Tiêu chuẩn viết Code & Ghi chú

- **Quy chuẩn Comment**: Comment bằng tiếng Việt, chỉ giải thích "vì sao", không mô tả lại code.
- **Giới hạn kích thước file**: File mới không vượt 300 dòng.
- **Bảo mật tuyệt đối**: Không bao giờ commit `.env` hoặc secret. Giá trị mẫu chỉ nằm trong `.env.example`.

## 4. Kiểm tra bắt buộc trước mỗi commit

Không commit khi còn lỗi kiểm tra. Sửa đến khi pass:

- **Web (`apps/web`)**:
  ```bash
  cd apps/web && npx tsc --noEmit && npm run lint && npm run build
  ```
- **API (`apps/api`)**:
  - `node --check` cho mọi file trong `apps/api/src`.
  - Chạy được server với Postgres cục bộ.

## 5. Hướng dẫn chạy cục bộ

- Khởi động database:
  ```bash
  docker compose -f apps/api/docker-compose.yml up -d
  # hoặc dùng docker-compose.yml ở thư mục gốc: docker compose up -d
  ```
- Cấu hình và chạy server API:
  - Copy `apps/api/.env.example` thành `apps/api/.env` với giá trị thử nghiệm (không commit).
  - Chạy lệnh:
    ```bash
    cd apps/api && npm run migrate && npm run seed && npm run dev
    ```
- Chạy web client:
  ```bash
  cd apps/web && npm run dev
  ```
