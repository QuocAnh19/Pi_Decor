# Cấu hình Quản trị & Bảo mật Kho lưu trữ GitHub (GITHUB_SETTINGS.md)

Tài liệu này hướng dẫn chủ sở hữu repository (`@QuocAnh19`) thiết lập các quy tắc bảo vệ nhánh, kích hoạt tính năng an toàn mã nguồn và cấu hình chữ ký số commit trên giao diện quản trị GitHub mà không thể thiết lập trực tiếp bằng tệp mã nguồn.

---

## 1. Bảo vệ nhánh chính `main` (Branch Protection Rules)

Vào **Settings** → **Branches** → Chọn **Add branch protection rule** (hoặc chỉnh sửa rule cho `main`):

- **Branch name pattern**: `main`

### Các tùy chọn bắt buộc kích hoạt:

1. **Require a pull request before merging**:
   - Tích chọn: _Require approvals_ (Tối thiểu 1 phê duyệt).
   - Tích chọn: _Dismiss stale pull request approvals when new commits are pushed_.
   - Tích chọn: _Require review from Code Owners_ (kết hợp với [`.github/CODEOWNERS`](../.github/CODEOWNERS)).
2. **Require status checks to pass before merging**:
   - Tích chọn: _Require branches to be up to date before merging_.
   - Tìm kiếm và tích chọn các status checks bắt buộc:
     - `Web Checks (apps/web)`
     - `API Checks (apps/api)`
     - `Playwright E2E Tests`
     - `Audit & Licenses`
     - `Secret Scan (Gitleaks)`
     - `Docker Smoke & Trivy Scan`
     - `CodeQL`
3. **Require signed commits**:
   - Tích chọn: Mọi commit đẩy vào `main` bắt buộc phải có chữ ký số GPG hoặc SSH hợp lệ (Verified badge).
4. **Require linear history**:
   - Tích chọn: Ngăn ngừa tạo merge commit, đảm bảo lịch sử Git hoàn toàn tuyến tính.
5. **Chặn thao tác nguy hiểm**:
   - Tích chọn: _Do not allow bypass the above settings_.
   - Đảm bảo **KHÔNG** chọn _Allow force pushes_ (Chặn `git push --force`).
   - Đảm bảo **KHÔNG** chọn _Allow deletions_ (Chặn xóa nhánh `main`).

---

## 2. Kích hoạt Tính năng An toàn Mã nguồn (Security & Analysis)

Vào **Settings** → **Code security and analysis**:

1. **Dependabot**:
   - **Dependabot alerts**: Chuyển sang **Enabled**.
   - **Dependabot security updates**: Chuyển sang **Enabled** (tự động tạo PR cập nhật các bản vá bảo mật).
2. **Secret scanning**:
   - **Secret scanning**: Chuyển sang **Enabled**.
   - **Push protection**: Chuyển sang **Enabled** (chặn ngay lập tức các commit chứa API key, token hoặc chuỗi nhạy cảm).
3. **Private vulnerability reporting**:
   - Chuyển sang **Enabled** (kết hợp với [SECURITY.md](../SECURITY.md) để nhà nghiên cứu có thể gửi báo cáo bảo mật an toàn).

---

## 3. Cấu hình Hợp nhất Pull Request (Merge Options)

Vào **Settings** → **General** → Mục **Pull Requests**:

- **Allow squash merging**: Tích chọn (Khuyến nghị: _Default to pull request title and description_).
- **Allow rebase merging**: Tích chọn (tùy chọn).
- **Allow merge commits**: **BỎ TÍCH** (để giữ lịch sử commit luôn sạch sẽ và tuyến tính).
- **Automatically delete head branches**: **TÍCH CHỌN** (tự động xóa nhánh tính năng sau khi merge).

---

## 4. Hướng dẫn Lập trình viên Cấu hình Ký Commit (Commit Signing)

Chủ repository và các lập trình viên cần cấu hình chữ ký số trên máy trạm cá nhân:

### Cách 1: Ký bằng SSH Key (Đơn giản & Khuyến nghị)

Nếu bạn đã có SSH key để push code:

```bash
# 1. Cấu hình Git sử dụng SSH format để ký
git config --global gpg.format ssh

# 2. Chỉ định đường dẫn tệp Public Key (thay đổi theo user của bạn)
# Trên Windows:
git config --global user.signingkey "C:/Users/<Username>/.ssh/id_ed25519.pub"
# Trên macOS / Linux:
# git config --global user.signingkey ~/.ssh/id_ed25519.pub

# 3. Tự động ký tất cả các commit và thẻ tag
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

_Lưu ý_: Mở **GitHub** → **Settings** → **SSH and GPG keys** → Thêm key mới → Mục **Key type** chọn **Signing Key**.

### Cách 2: Ký bằng GPG Key

```bash
# Liệt kê danh sách khóa GPG sẵn có
gpg --list-secret-keys --keyid-format=long

# Cấu hình khóa GPG cho Git
git config --global user.signingkey <GPG_KEY_ID>
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```
