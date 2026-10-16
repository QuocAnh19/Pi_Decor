# Hướng dẫn Đóng góp Mã nguồn (CONTRIBUTING.md)

Tài liệu này quy định các tiêu chuẩn kỹ thuật, quy trình làm việc và kiểm tra bắt buộc đối với tất cả thành viên khi đóng góp mã nguồn vào repository Pi Decor.

---

## 1. Quy ước Đặt tên Nhánh (Branching Conventions)

Mọi thay đổi phải được thực hiện trên nhánh riêng biệt tách từ `main`, tuân thủ cú pháp:

- `feat/<ten-tinh-nang>`: Thêm tính năng hoặc màn hình mới (ví dụ: `feat/lead-export-excel`).
- `fix/<mo-ta-loi>`: Sửa lỗi logic, hiển thị hoặc bảo mật (ví dụ: `fix/quotation-total-rounding`).
- `refactor/<khu-vuc>`: Tái cấu trúc mã nguồn, tối ưu hiệu năng không đổi giao diện (ví dụ: `refactor/studio-canvas`).
- `docs/<noi-dung>`: Bổ sung hoặc cập nhật tài liệu kỹ thuật (ví dụ: `docs/api-guide`).
- `chore/<tac-vu>`: Cập nhật thư viện, cấu hình CI/CD hoặc công cụ phát triển (ví dụ: `chore/bump-deps`).

---

## 2. Quy chuẩn Commit (Conventional Commits)

Dự án áp dụng chặt chẽ chuẩn **Conventional Commits**:

```
<type>(<scope>): <mô tả ngắn gọn về thay đổi>
```

- **Các kiểu commit hợp lệ**:
  - `feat`: Tính năng mới cho người dùng.
  - `fix`: Sửa lỗi hệ thống hoặc giao diện.
  - `refactor`: Tái cấu trúc mã nguồn, tối ưu hóa kích thước file.
  - `docs`: Cập nhật tài liệu, README, runbook.
  - `test`: Bổ sung hoặc sửa đổi các bài kiểm thử tự động.
  - `chore`: Tác vụ bảo trì, cấu hình build, cập nhật package.
- **Quy tắc 1 Nhiệm vụ = 1 Commit**: Mỗi nhiệm vụ tương ứng với 1 commit độc lập, mô tả chính xác nội dung thay đổi.
- **Phạm vi (Scope)**: Không thực hiện các thay đổi ngoài phạm vi yêu cầu. Nếu phát hiện vấn đề kỹ thuật khác, ghi nhận vào `docs/FOLLOWUPS.md` thay vì tự ý sửa.

---

## 3. Tiêu chuẩn Viết Code & Cấu trúc Tệp

### a. Giới hạn Kích thước File (Quy tắc 300 dòng)

- **Bắt buộc**: Không có file mã nguồn nào vượt quá **300 dòng** (được kiểm tra qua luật ESLint `max-lines`).
- **Cách phân rã file lớn**:
  - Tách các khối giao diện thành component con đặt cùng thư mục (ví dụ `components/`).
  - Đưa toàn bộ state logic và hiệu ứng phụ vào custom hook riêng (`hooks/useXxx.ts`).
  - Chuyển các hàm thuần túy (pure functions, tính toán) vào `utils/`.
  - Gom các hằng số, bảng màu hoặc cấu hình cố định vào `constants.ts`.

### b. Quy chuẩn Chú thích (Comments)

- Sử dụng tiếng Việt cho các chú thích nội bộ trong mã nguồn.
- **Chỉ giải thích "vì sao" (Why)**: Nêu rõ lý do kiến trúc, quyết định kỹ thuật hoặc ngữ cảnh nghiệp vụ đặc biệt; không viết chú thích mô tả lại cú pháp hiển nhiên của dòng code (What).

### c. Bảo mật & Biến Môi trường

- **Tuyệt đối không commit bí mật**: Không bao giờ đưa `.env`, API key, token hoặc chuỗi kết nối cơ sở dữ liệu thật vào Git. Mọi giá trị mẫu phải nằm trong `.env.example`.
- Pre-commit hook (Husky + Lint-staged) sẽ tự động kiểm tra định dạng và ngăn chặn các vi phạm cơ bản.

---

## 4. Danh sách Kiểm tra Bắt buộc Trước khi Tạo PR (PR Checklist)

Trước khi commit và gửi Pull Request, lập trình viên phải đảm bảo toàn bộ các bước kiểm tra sau đây đều vượt qua mà không có lỗi:

### Phía Client (`client/`)

```bash
cd client
npx tsc --noEmit        # Kiểm tra kiểu dữ liệu TypeScript không lỗi
npm run lint           # Kiểm tra quy chuẩn ESLint (0 errors)
npm run lint:styles    # Kiểm tra SCSS module qua Stylelint
npm test               # Chạy toàn bộ test suite frontend
npm run knip           # Kiểm tra không có code/export/dependency thừa
npm run build          # Đảm bảo đóng gói Vite thành công
```

### Phía Server (`server/`)

```bash
cd server
node --check src/**/*.js   # Kiểm tra cú pháp toàn bộ file JS ESM
npm run lint              # Kiểm tra quy chuẩn ESLint cho server
npm test                  # Chạy test suite backend (Postgres test)
```

---

## 5. Quy trình Đánh giá Mã nguồn (Code Review)

1. Mọi Pull Request cần có ít nhất một phê duyệt (approve) từ thành viên cốt lõi.
2. Kiểm tra CI (GitHub Actions) phải chạy thành công cả 2 jobs: `test-client` và `test-server`.
3. Nhánh `main` được cấu hình squash merge hoặc rebase merge để giữ lịch sử commit sạch sẽ và tuyến tính.
