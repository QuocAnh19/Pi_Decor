# Hướng dẫn Đóng góp Mã nguồn (CONTRIBUTING.md)

Tài liệu này quy định các tiêu chuẩn kỹ thuật, quy trình làm việc và kiểm tra bắt buộc đối với tất cả thành viên khi đóng góp mã nguồn vào repository Pi Decor.

---

## 1. Báo cáo Sự cố & Đề xuất Tính năng

- **Báo cáo lỗi thông thường**: Vui lòng sử dụng [Bug Report Form](.github/ISSUE_TEMPLATE/bug_report.yml) để cung cấp đầy đủ các bước tái hiện và môi trường gặp lỗi.
- **Đề xuất tính năng mới**: Sử dụng [Feature Request Form](.github/ISSUE_TEMPLATE/feature_request.yml) để nêu rõ bối cảnh nghiệp vụ và phương án đề xuất.
- **Lỗ hổng bảo mật**: Tuyệt đối **KHÔNG** mở Issue công khai. Hãy tham khảo [SECURITY.md](SECURITY.md) và sử dụng kênh [Private Vulnerability Reporting](https://github.com/QuocAnh19/Pi_Decor/security/advisories/new).

---

## 2. Quy ước Đặt tên Nhánh & Chữ ký Commit

Mọi thay đổi phải được thực hiện trên nhánh riêng biệt tách từ `main`, tuân thủ cú pháp:

- `feat/<ten-tinh-nang>`: Thêm tính năng hoặc màn hình mới (ví dụ: `feat/lead-export-excel`).
- `fix/<mo-ta-loi>`: Sửa lỗi logic, hiển thị hoặc bảo mật (ví dụ: `fix/quotation-total-rounding`).
- `refactor/<khu-vuc>`: Tái cấu trúc mã nguồn, tối ưu hiệu năng không đổi giao diện (ví dụ: `refactor/studio-canvas`).
- `docs/<noi-dung>`: Bổ sung hoặc cập nhật tài liệu kỹ thuật (ví dụ: `docs/api-guide`).
- `chore/<tac-vu>`: Cập nhật thư viện, cấu hình CI/CD hoặc công cụ phát triển (ví dụ: `chore/bump-deps`).

> **Yêu cầu Chữ ký số Commit**: Theo quy tắc bảo vệ nhánh tại [docs/GITHUB_SETTINGS.md](docs/GITHUB_SETTINGS.md), mọi commit phải được ký số qua GPG hoặc SSH (`commit.gpgsign = true`).

---

## 3. Quy chuẩn Commit (Conventional Commits)

Dự án áp dụng chặt chẽ chuẩn **Conventional Commits**:

```
<type>(<scope>): <mô tả ngắn gọn về thay đổi>
```

- **Các kiểu commit hợp lệ**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.
- **Quy tắc 1 Nhiệm vụ = 1 Commit**: Mỗi nhiệm vụ tương ứng với đúng 1 commit độc lập, mô tả chính xác nội dung.
- **Tuân thủ đúng phạm vi (Scope)**: Tuyệt đối không làm ngoài phạm vi prompt/nhiệm vụ. Nếu phát hiện vấn đề kỹ thuật khác, ghi nhận vào [docs/FOLLOWUPS.md](docs/FOLLOWUPS.md) thay vì tự ý sửa.

---

## 4. Tiêu chuẩn Viết Code & Cấu trúc Tệp

### a. Giới hạn Kích thước File (Quy tắc 300 dòng)

- **Bắt buộc**: Không có file mã nguồn nào vượt quá **300 dòng** (luật ESLint `max-lines`).
- **Cách phân rã**: Tách component con, custom hooks (`useXxx`), helpers và constants riêng biệt.

### b. Quy chuẩn Chú thích (Comments)

- Sử dụng tiếng Việt cho các chú thích nội bộ.
- **Chỉ giải thích "vì sao" (Why)**: Nêu rõ lý do thiết kế hoặc ràng buộc kỹ thuật; không diễn giải cú pháp code.

### c. Bảo mật Tuyệt đối

- **Không commit thông tin bí mật**: Không đưa `.env`, secret keys, tokens hoặc mật khẩu vào Git. Mọi giá trị mẫu an toàn chỉ nằm trong `.env.example`.

---

## 5. Quy trình Kiểm tra Bắt buộc Trước khi Tạo PR

Trước khi gửi Pull Request, lập trình viên bắt buộc phải chạy lệnh xác thực toàn diện từ thư mục gốc:

```bash
npm run verify
```

Lệnh này sẽ tuần tự kiểm tra:

1. `packages/shared`: build ra dist và dts.
2. `apps/web`: `typecheck`, `lint`, `lint:styles`, `knip`, `test`, `build`.
3. `apps/api`: `check:db-env`, `lint`, `check:syntax`, `migrate`, `test`.

Nếu có thay đổi luồng giao diện hoặc nghiệp vụ, chạy thêm bộ kiểm thử E2E:

```bash
npm run e2e
```

Để kiểm tra giả lập môi trường CI sạch trước khi push (chạy `env -i` chỉ truyền các biến mà job CI khai báo nhằm phát hiện sớm lỗi thiếu biến môi trường):

```bash
bash scripts/ci-local.sh
```

---

## 6. Gửi Pull Request & Đánh giá Mã nguồn (Code Review)

1. **Biểu mẫu PR**: Khi mở Pull Request, điền đầy đủ các mục theo [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).
2. **Cập nhật CHANGELOG**: Bổ sung tóm tắt thay đổi vào mục `[Unreleased]` trong [CHANGELOG.md](CHANGELOG.md).
3. **Phân công Review**: Hệ thống sẽ tự động gán người đánh giá theo quy tắc tại [`.github/CODEOWNERS`](.github/CODEOWNERS). Các khu vực nhạy cảm (`auth`, `database`, `packages/shared`) yêu cầu sự phê duyệt bắt buộc từ chủ repository `@QuocAnh19`.
4. **Hợp nhất**: Nhánh `main` áp dụng Squash Merge hoặc Rebase Merge để bảo toàn lịch sử tuyến tính theo quy định tại [docs/GITHUB_SETTINGS.md](docs/GITHUB_SETTINGS.md).
5. **Quy trình Phát hành**: Khi hoàn tất chu kỳ tính năng, quy trình đóng gói và phát hành phiên bản được thực hiện theo [docs/RELEASING.md](docs/RELEASING.md).
