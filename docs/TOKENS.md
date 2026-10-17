# Kiểm kê & Chuẩn hóa Design Tokens (`docs/TOKENS.md`)

Tài liệu này ghi lại kết quả đối chiếu 3 file token hiện có trong `client/src/styles/`:

- `_variables.scss` (Token giao diện khách hàng & hệ thống Figma)
- `_tokens.scss` (Token nền tảng chữ, khoảng cách, breakpoint và bảng màu dark-mode cũ của Admin)
- `_admin-variables.scss` (Bảng màu Admin ấm áp thiết kế lại năm 2026)

---

## 1. Bảng trùng lặp hoàn toàn (Cùng tên biến & cùng giá trị)

| Tên biến SCSS  | Giá trị ở `_tokens.scss`       | Giá trị ở `_variables.scss`    | Quyết định chuẩn hóa                                     |
| :------------- | :----------------------------- | :----------------------------- | :------------------------------------------------------- |
| `$color-paper` | `#fbf7f1`                      | `#fbf7f1`                      | Giữ 1 nguồn `--color-paper: #fbf7f1`                     |
| `$color-ink`   | `#271620`                      | `#271620`                      | Giữ 1 nguồn `--color-ink: #271620`                       |
| `$font-serif`  | `"Fraunces", serif`            | `"Fraunces", serif`            | Giữ 1 nguồn `--font-serif: "Fraunces", serif`            |
| `$font-sans`   | `"Be Vietnam Pro", sans-serif` | `"Be Vietnam Pro", sans-serif` | Giữ 1 nguồn `--font-sans: "Be Vietnam Pro", sans-serif`  |
| `$font-script` | `"Cormorant Garamond", serif`  | `"Cormorant Garamond", serif`  | Giữ 1 nguồn `--font-script: "Cormorant Garamond", serif` |

---

## 2. Bảng trùng lặp ngữ nghĩa / Alias (Khác tên biến nhưng cùng mã Hex)

| Mã Hex    | Biến trong `_variables.scss`                        | Biến trong `_tokens.scss` | Biến trong `_admin-variables.scss` | Token CSS chuẩn (`:root`)        |
| :-------- | :-------------------------------------------------- | :------------------------ | :--------------------------------- | :------------------------------- |
| `#a15c2e` | `$color-accent`, `$color-wedding-accent`            | `$color-accent-brand`     | `$admin-accent`                    | `--color-accent: #a15c2e`        |
| `#874c25` | `$color-accent-hover`                               | —                         | `$admin-accent-hover`              | `--color-accent-hover: #874c25`  |
| `#f1e4d8` | `$color-accent-subtle`, `$color-wedding-accent-dim` | —                         | `$admin-accent-subtle`             | `--color-accent-subtle: #f1e4d8` |
| `#f4eee3` | `$color-paper-dim`                                  | —                         | `$admin-bg`                        | `--color-paper-dim: #f4eee3`     |
| `#f8e9e7` | `$color-blush`                                      | —                         | `$admin-surface-raised`            | `--color-blush: #f8e9e7`         |
| `#e7ded0` | `$color-line`                                       | —                         | `$admin-border`                    | `--color-line: #e7ded0`          |
| `#271620` | `$color-ink`                                        | `$color-ink`              | `$admin-text`                      | `--color-ink: #271620`           |
| `#6e6259` | `$color-ink-muted`                                  | —                         | `$admin-text-muted`                | `--color-ink-muted: #6e6259`     |
| `#9c9186` | `$color-ink-faint`                                  | —                         | `$admin-text-faint`                | `--color-ink-faint: #9c9186`     |

---

## 3. Bảng xung đột giá trị (Cùng ý nghĩa ngữ nghĩa nhưng khác mã Hex)

Các xung đột xảy ra giữa bảng màu Admin/Status kiểu Slate/Tailwind cũ trong `_tokens.scss` và bảng màu Admin ấm áp ("thơ mộng") trong `_admin-variables.scss`:

| Ý nghĩa ngữ nghĩa                   | `_tokens.scss` (Cũ - Dark Slate)                                                  | `_admin-variables.scss` (Mới - Warm Paper)                                                                     | Quyết định & Lý do                                                                                                                        |
| :---------------------------------- | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Nền chính Admin**                 | `$color-admin-bg: #0f172a` (0 nơi dùng)                                           | `$admin-bg: #f4eee3` (50 nơi dùng)                                                                             | Chọn `#f4eee3` (`--color-paper-dim`), bỏ bảng màu dark-mode cũ không còn dùng.                                                            |
| **Nền bề mặt thẻ (Surface)**        | `$color-admin-surface: #1e293b` (0 nơi dùng)                                      | `$admin-surface: #ffffff` (28 nơi dùng + 132 chỗ viết cứng `#ffffff`)                                          | Chọn `#ffffff` (`--color-surface`).                                                                                                       |
| **Nền tối khung ảnh/media**         | `$color-admin-surface-darkest: #0b1120` (1 nơi dùng ở `Lookbook.module.scss`)     | —                                                                                                              | Giữ `--color-surface-dark: #0b1120` cho khung nền tối của media/canvas; ánh xạ `$color-admin-surface-darkest: var(--color-surface-dark)`. |
| **Viền Admin**                      | `$color-admin-border: #334155`, `$color-admin-border-light: #475569` (0 nơi dùng) | `$admin-border: #e7ded0` (121 nơi dùng)                                                                        | Chọn `#e7ded0` (`--color-line`).                                                                                                          |
| **Màu nhấn Admin**                  | `$color-admin-accent: #38bdf8` (0 nơi dùng biến)                                  | `$admin-accent: #a15c2e` (104 nơi dùng)                                                                        | Chọn `#a15c2e` (`--color-accent`).                                                                                                        |
| **Màu nhấn Admin (Hover)**          | `$color-admin-accent-hover: #0284c7` (0 nơi dùng biến)                            | `$admin-accent-hover: #874c25` (29 nơi dùng)                                                                   | Chọn `#874c25` (`--color-accent-hover`).                                                                                                  |
| **Chữ phụ Admin**                   | `$color-admin-text-muted: #94a3b8` (0 nơi dùng biến)                              | `$admin-text-muted: #6e6259` (51 nơi dùng)                                                                     | Chọn `#6e6259` (`--color-ink-muted`).                                                                                                     |
| **Chữ mờ Admin**                    | `$color-admin-text-light: #cbd5e1` (0 nơi dùng biến)                              | `$admin-text-faint: #9c9186` (47 nơi dùng)                                                                     | Chọn `#9c9186` (`--color-ink-faint`).                                                                                                     |
| **Trạng thái lỗi (Danger)**         | `$color-danger: #e11d48` (chỉ dùng ở `LeadForm.module.scss`)                      | `$admin-danger: #b4586b` (37 nơi dùng biến + 14 nơi viết cứng `#b4586b` ở cả UI chung như `Input.module.scss`) | Chọn `#b4586b` (`--color-danger`) kèm nền nhạt `--color-danger-subtle: #f7e4e6` để đồng nhất sắc thái ấm áp toàn hệ thống.                |
| **Trạng thái thành công (Success)** | `$color-success: #10b981` (0 nơi dùng biến)                                       | `$admin-success: #6e8f5c` (10 nơi dùng biến)                                                                   | Chọn `#6e8f5c` (`--color-success`) kèm nền nhạt `--color-success-subtle: #e7eee1`.                                                        |
| **Trạng thái cảnh báo (Warning)**   | `$color-warning: #f59e0b` (0 nơi dùng biến)                                       | `$admin-warning: #b98a3e` (8 nơi dùng biến)                                                                    | Chọn `#b98a3e` (`--color-warning`) kèm nền nhạt `--color-warning-subtle: #f5ead6`.                                                        |

---

## 4. Bộ Token chuẩn duy nhất trong `:root`

### 4.1. Màu sắc (`--color-*`)

| CSS Custom Property          | Giá trị chuẩn (Hex) | Biến SCSS ánh xạ (`var(...)`)                                                    | Mô tả                                             |
| :--------------------------- | :------------------ | :------------------------------------------------------------------------------- | :------------------------------------------------ |
| `--color-surface`            | `#ffffff`           | `$color-surface`, `$admin-surface`                                               | Nền trắng tinh cho thẻ nổi, modal, input, sidebar |
| `--color-surface-dark`       | `#0b1120`           | `$color-surface-dark`, `$color-admin-surface-darkest`                            | Nền tối cho khung media/canvas                    |
| `--color-paper`              | `#fbf7f1`           | `$color-paper`                                                                   | Nền giấy ấm chính toàn trang                      |
| `--color-paper-dim`          | `#f4eee3`           | `$color-paper-dim`, `$admin-bg`                                                  | Nền giấy phụ xen kẽ / nền tổng thể Admin          |
| `--color-ink`                | `#271620`           | `$color-ink`, `$admin-text`                                                      | Màu chữ chính                                     |
| `--color-ink-muted`          | `#6e6259`           | `$color-ink-muted`, `$admin-text-muted`                                          | Màu chữ phụ / mô tả                               |
| `--color-ink-faint`          | `#9c9186`           | `$color-ink-faint`, `$admin-text-faint`                                          | Màu chữ mờ / placeholder / metadata               |
| `--color-line`               | `#e7ded0`           | `$color-line`, `$admin-border`                                                   | Đường kẻ viền mỏng phân cách                      |
| `--color-accent`             | `#a15c2e`           | `$color-accent`, `$color-accent-brand`, `$color-wedding-accent`, `$admin-accent` | Màu nhấn thương hiệu chính (Nâu cam đất)          |
| `--color-accent-hover`       | `#874c25`           | `$color-accent-hover`, `$admin-accent-hover`                                     | Màu nhấn khi hover                                |
| `--color-accent-subtle`      | `#f1e4d8`           | `$color-accent-subtle`, `$color-wedding-accent-dim`, `$admin-accent-subtle`      | Nền nhấn nhạt cho badge/tag                       |
| `--color-blush`              | `#f8e9e7`           | `$color-blush`, `$admin-surface-raised`                                          | Hồng phấn dịu nhẹ                                 |
| `--color-blush-dim`          | `#f1dedb`           | `$color-blush-dim`                                                               | Hồng phấn chuyển tiếp / viền                      |
| `--color-plum`               | `#3b141f`           | `$color-plum`                                                                    | Màu mận chín đậm                                  |
| `--color-plum-light`         | `#5c2433`           | `$color-plum-light`                                                              | Màu mận sáng bổ trợ                               |
| `--color-material-rose`      | `#e7b6bb`           | `$color-material-rose`                                                           | Màu swatch vải Rose                               |
| `--color-material-sage`      | `#afc49c`           | `$color-material-sage`                                                           | Màu swatch vải Sage                               |
| `--color-material-sand`      | `#c99f6f`           | `$color-material-sand`                                                           | Màu swatch vải Sand                               |
| `--color-material-lavender`  | `#b98ac9`           | `$color-material-lavender`                                                       | Màu swatch vải Lavender                           |
| `--color-material-champagne` | `#e7be79`           | `$color-material-champagne`                                                      | Màu swatch vải Champagne                          |
| `--color-material-smoke`     | `#8a9bae`           | `$color-material-smoke`                                                          | Màu swatch vải Smoke                              |
| `--color-kids-accent`        | `#e59a6b`           | `$color-kids-accent`                                                             | Màu nhận diện dòng PiKids                         |
| `--color-kids-accent-dim`    | `#f6ddc6`           | `$color-kids-accent-dim`                                                         | Nền nhạt dòng PiKids                              |
| `--color-event-accent`       | `#4f6b63`           | `$color-event-accent`                                                            | Màu nhận diện dòng PiEvent                        |
| `--color-event-accent-dim`   | `#dbe6e0`           | `$color-event-accent-dim`                                                        | Nền nhạt dòng PiEvent                             |
| `--color-danger`             | `#b4586b`           | `$color-danger`, `$admin-danger`                                                 | Màu cảnh báo lỗi / xóa (Muted Rose)               |
| `--color-danger-subtle`      | `#f7e4e6`           | `$color-danger-subtle`, `$admin-danger-subtle`                                   | Nền nhạt cảnh báo lỗi                             |
| `--color-success`            | `#6e8f5c`           | `$color-success`, `$admin-success`                                               | Màu trạng thái thành công (Muted Sage)            |
| `--color-success-subtle`     | `#e7eee1`           | `$color-success-subtle`, `$admin-success-subtle`                                 | Nền nhạt trạng thái thành công                    |
| `--color-warning`            | `#b98a3e`           | `$color-warning`, `$admin-warning`                                               | Màu trạng thái chờ / lưu ý (Muted Champagne)      |
| `--color-warning-subtle`     | `#f5ead6`           | `$color-warning-subtle`, `$admin-warning-subtle`                                 | Nền nhạt trạng thái chờ / lưu ý                   |

_(Ngoài ra các kênh RGB tương ứng `--color-*-rgb` cũng được khai báo trong `:root` để phục vụ cú pháp `rgba(var(--color-*-rgb), <alpha>)` trong CSS/SCSS)._

### 4.2. Typography, Layout, Radius, Motion & Shadows

- **Font chữ**: `--font-serif`, `--font-sans`, `--font-script`
- **Cỡ chữ & Độ đậm**: `--text-xs` .. `--text-5xl`, `--weight-regular` .. `--weight-bold`, `--leading-tight` .. `--leading-relaxed`, `--tracking-tight` .. `--tracking-widest`
- **Khoảng cách (Spacing)**: `--space-0-5`, `--space-1`, `--space-2`, `--space-2-5`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-12`, `--space-16`, `--space-20`, `--space-24`
- **Bo góc & Khung**: `--max-width-content`, `--radius-s`, `--radius-m`, `--radius-l`, `--radius-pill`
- **Chuyển động & Đổ bóng**: `--transition-default`, `--shadow-sm`, `--shadow-default`, `--shadow-lg`, `--admin-shadow-card`, `--admin-shadow-card-hover`, `--admin-shadow-modal`

---

## 5. Bảng quyết định chuẩn hóa mã màu Hex (P36)

Theo quy định chuẩn hóa màu sắc tại nhiệm vụ P36:

- **Nhóm (a)**: Trùng chính xác hoặc chênh mỗi kênh RGB ≤ 3 so với token có sẵn -> Thay thế bằng `var(--token)`.
- **Nhóm (b)**: Sử dụng từ 3 lần trở lên mà chưa có token -> Bổ sung token ngữ nghĩa mới vào `:root` và `$biến` SCSS trong `apps/web/src/styles/_tokens.scss`.
- **Nhóm (c)**: Sử dụng 1–2 lần mang ý nghĩa thị giác cục bộ -> Giữ nguyên kèm chú thích lý do và cờ `/* stylelint-disable-next-line color-no-hex -- ... */`.
- Quy tắc stylelint `color-no-hex` được nâng lên cấp độ `"error"` cho toàn bộ SCSS module (ngoại trừ file định nghĩa token `src/styles/_tokens.scss`, `_variables.scss`, `_admin-variables.scss`).

| Mã Hex                                        | Phân loại | Số lần | Quyết định xử lý                             | Lý do / Vai trò ngữ nghĩa                             |
| :-------------------------------------------- | :-------- | :----- | :------------------------------------------- | :---------------------------------------------------- |
| `#ffffff` / `#fff`                            | (a)       | 5      | Thay bằng `var(--color-surface)`             | Nền trắng tiêu chuẩn của bề mặt nổi                   |
| `#884c24`                                     | (a)       | 1      | Thay bằng `var(--color-accent-hover)`        | Chênh RGB 1 so với `--color-accent-hover` (`#874c25`) |
| `#b4586b`                                     | (a)       | 1      | Thay bằng `var(--color-danger)`              | Trùng khớp 100% `--color-danger`                      |
| `#faebea`                                     | (a)       | 1      | Thay bằng `var(--color-blush)`               | Chênh RGB 3 so với `--color-blush` (`#f8e9e7`)        |
| `#fdfaf3`                                     | (a)       | 1      | Thay bằng `var(--color-paper)`               | Chênh RGB 3 so với `--color-paper` (`#fbf7f1`)        |
| `#faf4ee`                                     | (a)       | 1      | Thay bằng `var(--color-paper)`               | Chênh RGB 3 so với `--color-paper` (`#fbf7f1`)        |
| `#e2e8f0`                                     | (b)       | 10     | Tạo token `var(--color-border-subtle)`       | Viền xám nhạt bảng danh sách dịch vụ và modal         |
| `#fdf7f5`                                     | (b)       | 6      | Tạo token `var(--color-surface-hover)`       | Màu nền khi hover hàng bảng admin và card popup       |
| `#b45309`                                     | (b)       | 6      | Tạo token `var(--color-badge-gold-from)`     | Màu bắt đầu chuyển sắc dải băng VIP/Luxury            |
| `#d97706`                                     | (b)       | 6      | Tạo token `var(--color-badge-gold-to)`       | Màu kết thúc chuyển sắc dải băng VIP/Luxury           |
| `#ede7df`                                     | (b)       | 6      | Tạo token `var(--color-skeleton-base)`       | Nền cơ sở khung skeleton loading shimmer              |
| `#f5efe8`                                     | (b)       | 6      | Tạo token `var(--color-skeleton-highlight)`  | Vệt sáng quét qua skeleton loading shimmer            |
| `#47663b`                                     | (b)       | 5      | Tạo token `var(--color-status-success)`      | Chữ và viền trạng thái đã duyệt / hoạt động           |
| `#f7fafc`                                     | (b)       | 5      | Tạo token `var(--color-surface-muted)`       | Nền xám bề mặt phụ phân biệt vùng thao tác            |
| `#718096`                                     | (b)       | 4      | Tạo token `var(--color-text-subtle)`         | Chữ xám trung tính cho mô tả dịch vụ admin            |
| `#f8fafc`                                     | (b)       | 4      | Tạo token `var(--color-text-inverse)`        | Chữ trắng tương phản trên nền tối                     |
| `#0f172a`                                     | (b)       | 4      | Tạo token `var(--color-surface-inverse)`     | Nền tối khung modal đánh giá / preview                |
| `#dc2626`                                     | (b)       | 3      | Tạo token `var(--color-status-danger-hover)` | Màu nút xóa khi hover / nhấn                          |
| `#fff5f5`                                     | (b)       | 3      | Tạo token `var(--color-alert-danger-bg)`     | Nền hộp thông báo lỗi tải dữ liệu                     |
| `#feb2b2`                                     | (b)       | 3      | Tạo token `var(--color-alert-danger-border)` | Viền hộp thông báo lỗi tải dữ liệu                    |
| `#eef4ea`                                     | (b)       | 3      | Tạo token `var(--color-status-success-bg)`   | Nền xanh nhạt trạng thái đã duyệt                     |
| `#fdfaf6`                                     | (b)       | 3      | Tạo token `var(--color-surface-cream)`       | Nền hàng bảng xen kẽ phong cách giấy kem              |
| `#ef4444`                                     | (b)       | 3      | Tạo token `var(--color-status-danger)`       | Màu chữ đỏ cảnh báo lỗi nhập liệu                     |
| `#4a5568`                                     | (b)       | 3      | Tạo token `var(--color-text-secondary)`      | Chữ tiêu đề phụ danh sách dịch vụ                     |
| `#2d3748`                                     | (b)       | 3      | Tạo token `var(--color-text-primary)`        | Chữ nội dung chính danh sách dịch vụ                  |
| `#334155`                                     | (b)       | 3      | Tạo token `var(--color-border-dark)`         | Viền tối khung avatar và form đánh giá                |
| `#e53e3e`                                     | (b)       | 3      | Tạo token `var(--color-action-danger)`       | Màu nút hành động xóa mục danh sách                   |
| `#94a3b8`                                     | (b)       | 3      | Tạo token `var(--color-text-muted-alt)`      | Chữ hướng dẫn mờ khung ảnh / tọa độ                   |
| `#cbbba8`                                     | (c)       | 2      | stylelint-disable                            | Màu scrollbar tùy biến trình duyệt                    |
| `#fee2e2` / `#b91c1c`                         | (c)       | 4      | stylelint-disable                            | Trạng thái nút hủy / xóa nguy hiểm trong modal        |
| `#10b981`                                     | (c)       | 2      | stylelint-disable                            | Icon checkmark thành công trong Lead/Venue            |
| `#fdf6f0` / `#f0d5c0` / `#a1421f`             | (c)       | 6      | stylelint-disable                            | Khung thẻ rỗng cảnh báo ở Lookbook & Services         |
| `#c97188`                                     | (c)       | 2      | stylelint-disable                            | Màu tag thể loại dự án đặc thù                        |
| `#fef3c7` / `#92400e` / `#f1f5f9` / `#475569` | (c)       | 6      | stylelint-disable                            | Màu badge phân loại ghi chú / gọi điện timeline lead  |
| `#cbd5e0` / `#1a202c`                         | (c)       | 4      | stylelint-disable                            | Viền và chữ tiêu đề form dịch vụ                      |
| `#fde68a`                                     | (c)       | 2      | stylelint-disable                            | Màu sao đánh giá nổi bật                              |
| `#d06624`                                     | (c)       | 2      | stylelint-disable                            | Màu thương hiệu PiKids khi hover                      |
| `#d5c8b8` / `#7a6e60`                         | (c)       | 4      | stylelint-disable                            | Khung nét đứt gợi ý dịch vụ trống                     |
| `#38bdf8` / `#0284c7`                         | (c)       | 3      | stylelint-disable                            | Màu pin định vị Leaflet trên bản đồ                   |
| `#b56c38` / `#6f5322`                         | (c)       | 2      | stylelint-disable                            | Chuyển sắc nút gửi tư vấn                             |
| `#436a32` / `#8e631d`                         | (c)       | 2      | stylelint-disable                            | Độ tương phản badge trạng thái riêng biệt             |
| `#c53030`                                     | (c)       | 1      | stylelint-disable                            | Chữ cảnh báo lỗi form dịch vụ                         |
| `#7b471f` / `#f8e3cd`                         | (c)       | 2      | stylelint-disable                            | Avatar quản trị viên                                  |
| `#c5dfbb` / `#f7dcdb`                         | (c)       | 2      | stylelint-disable                            | Viền tag và nền xóa quy tắc rèm Studio                |
| `#e0e7ff` ... `#6b21a8`                       | (c)       | 8      | stylelint-disable                            | Các badge loại hoạt động trong timeline               |
| `#f4f8f1`                                     | (c)       | 1      | stylelint-disable                            | Nền dòng lead chuyển đổi                              |
| `#edf2f7` / `#64748b`                         | (c)       | 2      | stylelint-disable                            | Nút bộ lọc danh mục                                   |
| `#c88a58` / `#e07a5f` / `#2a4365`             | (c)       | 3      | stylelint-disable                            | Swatch mẫu màu trong form dịch vụ                     |
| `#7a3540` / `#3e5a32` / `#6e4a20`             | (c)       | 3      | stylelint-disable                            | Màu trích dẫn theo từng nhóm dịch vụ                  |
