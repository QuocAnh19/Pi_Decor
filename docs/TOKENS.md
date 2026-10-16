# Kiểm kê & Chuẩn hóa Design Tokens (`docs/TOKENS.md`)

Tài liệu này ghi lại kết quả đối chiếu 3 file token hiện có trong `client/src/styles/`:
- `_variables.scss` (Token giao diện khách hàng & hệ thống Figma)
- `_tokens.scss` (Token nền tảng chữ, khoảng cách, breakpoint và bảng màu dark-mode cũ của Admin)
- `_admin-variables.scss` (Bảng màu Admin ấm áp thiết kế lại năm 2026)

---

## 1. Bảng trùng lặp hoàn toàn (Cùng tên biến & cùng giá trị)

| Tên biến SCSS | Giá trị ở `_tokens.scss` | Giá trị ở `_variables.scss` | Quyết định chuẩn hóa |
| :--- | :--- | :--- | :--- |
| `$color-paper` | `#fbf7f1` | `#fbf7f1` | Giữ 1 nguồn `--color-paper: #fbf7f1` |
| `$color-ink` | `#271620` | `#271620` | Giữ 1 nguồn `--color-ink: #271620` |
| `$font-serif` | `"Fraunces", serif` | `"Fraunces", serif` | Giữ 1 nguồn `--font-serif: "Fraunces", serif` |
| `$font-sans` | `"Be Vietnam Pro", sans-serif` | `"Be Vietnam Pro", sans-serif` | Giữ 1 nguồn `--font-sans: "Be Vietnam Pro", sans-serif` |
| `$font-script` | `"Cormorant Garamond", serif` | `"Cormorant Garamond", serif` | Giữ 1 nguồn `--font-script: "Cormorant Garamond", serif` |

---

## 2. Bảng trùng lặp ngữ nghĩa / Alias (Khác tên biến nhưng cùng mã Hex)

| Mã Hex | Biến trong `_variables.scss` | Biến trong `_tokens.scss` | Biến trong `_admin-variables.scss` | Token CSS chuẩn (`:root`) |
| :--- | :--- | :--- | :--- | :--- |
| `#a15c2e` | `$color-accent`, `$color-wedding-accent` | `$color-accent-brand` | `$admin-accent` | `--color-accent: #a15c2e` |
| `#874c25` | `$color-accent-hover` | — | `$admin-accent-hover` | `--color-accent-hover: #874c25` |
| `#f1e4d8` | `$color-accent-subtle`, `$color-wedding-accent-dim` | — | `$admin-accent-subtle` | `--color-accent-subtle: #f1e4d8` |
| `#f4eee3` | `$color-paper-dim` | — | `$admin-bg` | `--color-paper-dim: #f4eee3` |
| `#f8e9e7` | `$color-blush` | — | `$admin-surface-raised` | `--color-blush: #f8e9e7` |
| `#e7ded0` | `$color-line` | — | `$admin-border` | `--color-line: #e7ded0` |
| `#271620` | `$color-ink` | `$color-ink` | `$admin-text` | `--color-ink: #271620` |
| `#6e6259` | `$color-ink-muted` | — | `$admin-text-muted` | `--color-ink-muted: #6e6259` |
| `#9c9186` | `$color-ink-faint` | — | `$admin-text-faint` | `--color-ink-faint: #9c9186` |

---

## 3. Bảng xung đột giá trị (Cùng ý nghĩa ngữ nghĩa nhưng khác mã Hex)

Các xung đột xảy ra giữa bảng màu Admin/Status kiểu Slate/Tailwind cũ trong `_tokens.scss` và bảng màu Admin ấm áp ("thơ mộng") trong `_admin-variables.scss`:

| Ý nghĩa ngữ nghĩa | `_tokens.scss` (Cũ - Dark Slate) | `_admin-variables.scss` (Mới - Warm Paper) | Quyết định & Lý do |
| :--- | :--- | :--- | :--- |
| **Nền chính Admin** | `$color-admin-bg: #0f172a` (0 nơi dùng) | `$admin-bg: #f4eee3` (50 nơi dùng) | Chọn `#f4eee3` (`--color-paper-dim`), bỏ bảng màu dark-mode cũ không còn dùng. |
| **Nền bề mặt thẻ (Surface)** | `$color-admin-surface: #1e293b` (0 nơi dùng) | `$admin-surface: #ffffff` (28 nơi dùng + 132 chỗ viết cứng `#ffffff`) | Chọn `#ffffff` (`--color-surface`). |
| **Nền tối khung ảnh/media** | `$color-admin-surface-darkest: #0b1120` (1 nơi dùng ở `Lookbook.module.scss`) | — | Giữ `--color-surface-dark: #0b1120` cho khung nền tối của media/canvas; ánh xạ `$color-admin-surface-darkest: var(--color-surface-dark)`. |
| **Viền Admin** | `$color-admin-border: #334155`, `$color-admin-border-light: #475569` (0 nơi dùng) | `$admin-border: #e7ded0` (121 nơi dùng) | Chọn `#e7ded0` (`--color-line`). |
| **Màu nhấn Admin** | `$color-admin-accent: #38bdf8` (0 nơi dùng biến) | `$admin-accent: #a15c2e` (104 nơi dùng) | Chọn `#a15c2e` (`--color-accent`). |
| **Màu nhấn Admin (Hover)** | `$color-admin-accent-hover: #0284c7` (0 nơi dùng biến) | `$admin-accent-hover: #874c25` (29 nơi dùng) | Chọn `#874c25` (`--color-accent-hover`). |
| **Chữ phụ Admin** | `$color-admin-text-muted: #94a3b8` (0 nơi dùng biến) | `$admin-text-muted: #6e6259` (51 nơi dùng) | Chọn `#6e6259` (`--color-ink-muted`). |
| **Chữ mờ Admin** | `$color-admin-text-light: #cbd5e1` (0 nơi dùng biến) | `$admin-text-faint: #9c9186` (47 nơi dùng) | Chọn `#9c9186` (`--color-ink-faint`). |
| **Trạng thái lỗi (Danger)** | `$color-danger: #e11d48` (chỉ dùng ở `LeadForm.module.scss`) | `$admin-danger: #b4586b` (37 nơi dùng biến + 14 nơi viết cứng `#b4586b` ở cả UI chung như `Input.module.scss`) | Chọn `#b4586b` (`--color-danger`) kèm nền nhạt `--color-danger-subtle: #f7e4e6` để đồng nhất sắc thái ấm áp toàn hệ thống. |
| **Trạng thái thành công (Success)** | `$color-success: #10b981` (0 nơi dùng biến) | `$admin-success: #6e8f5c` (10 nơi dùng biến) | Chọn `#6e8f5c` (`--color-success`) kèm nền nhạt `--color-success-subtle: #e7eee1`. |
| **Trạng thái cảnh báo (Warning)** | `$color-warning: #f59e0b` (0 nơi dùng biến) | `$admin-warning: #b98a3e` (8 nơi dùng biến) | Chọn `#b98a3e` (`--color-warning`) kèm nền nhạt `--color-warning-subtle: #f5ead6`. |

---

## 4. Bộ Token chuẩn duy nhất trong `:root`

### 4.1. Màu sắc (`--color-*`)

| CSS Custom Property | Giá trị chuẩn (Hex) | Biến SCSS ánh xạ (`var(...)`) | Mô tả |
| :--- | :--- | :--- | :--- |
| `--color-surface` | `#ffffff` | `$color-surface`, `$admin-surface` | Nền trắng tinh cho thẻ nổi, modal, input, sidebar |
| `--color-surface-dark` | `#0b1120` | `$color-surface-dark`, `$color-admin-surface-darkest` | Nền tối cho khung media/canvas |
| `--color-paper` | `#fbf7f1` | `$color-paper` | Nền giấy ấm chính toàn trang |
| `--color-paper-dim` | `#f4eee3` | `$color-paper-dim`, `$admin-bg` | Nền giấy phụ xen kẽ / nền tổng thể Admin |
| `--color-ink` | `#271620` | `$color-ink`, `$admin-text` | Màu chữ chính |
| `--color-ink-muted` | `#6e6259` | `$color-ink-muted`, `$admin-text-muted` | Màu chữ phụ / mô tả |
| `--color-ink-faint` | `#9c9186` | `$color-ink-faint`, `$admin-text-faint` | Màu chữ mờ / placeholder / metadata |
| `--color-line` | `#e7ded0` | `$color-line`, `$admin-border` | Đường kẻ viền mỏng phân cách |
| `--color-accent` | `#a15c2e` | `$color-accent`, `$color-accent-brand`, `$color-wedding-accent`, `$admin-accent` | Màu nhấn thương hiệu chính (Nâu cam đất) |
| `--color-accent-hover` | `#874c25` | `$color-accent-hover`, `$admin-accent-hover` | Màu nhấn khi hover |
| `--color-accent-subtle` | `#f1e4d8` | `$color-accent-subtle`, `$color-wedding-accent-dim`, `$admin-accent-subtle` | Nền nhấn nhạt cho badge/tag |
| `--color-blush` | `#f8e9e7` | `$color-blush`, `$admin-surface-raised` | Hồng phấn dịu nhẹ |
| `--color-blush-dim` | `#f1dedb` | `$color-blush-dim` | Hồng phấn chuyển tiếp / viền |
| `--color-plum` | `#3b141f` | `$color-plum` | Màu mận chín đậm |
| `--color-plum-light` | `#5c2433` | `$color-plum-light` | Màu mận sáng bổ trợ |
| `--color-material-rose` | `#e7b6bb` | `$color-material-rose` | Màu swatch vải Rose |
| `--color-material-sage` | `#afc49c` | `$color-material-sage` | Màu swatch vải Sage |
| `--color-material-sand` | `#c99f6f` | `$color-material-sand` | Màu swatch vải Sand |
| `--color-material-lavender` | `#b98ac9` | `$color-material-lavender` | Màu swatch vải Lavender |
| `--color-material-champagne` | `#e7be79` | `$color-material-champagne` | Màu swatch vải Champagne |
| `--color-material-smoke` | `#8a9bae` | `$color-material-smoke` | Màu swatch vải Smoke |
| `--color-kids-accent` | `#e59a6b` | `$color-kids-accent` | Màu nhận diện dòng PiKids |
| `--color-kids-accent-dim` | `#f6ddc6` | `$color-kids-accent-dim` | Nền nhạt dòng PiKids |
| `--color-event-accent` | `#4f6b63` | `$color-event-accent` | Màu nhận diện dòng PiEvent |
| `--color-event-accent-dim` | `#dbe6e0` | `$color-event-accent-dim` | Nền nhạt dòng PiEvent |
| `--color-danger` | `#b4586b` | `$color-danger`, `$admin-danger` | Màu cảnh báo lỗi / xóa (Muted Rose) |
| `--color-danger-subtle` | `#f7e4e6` | `$color-danger-subtle`, `$admin-danger-subtle` | Nền nhạt cảnh báo lỗi |
| `--color-success` | `#6e8f5c` | `$color-success`, `$admin-success` | Màu trạng thái thành công (Muted Sage) |
| `--color-success-subtle` | `#e7eee1` | `$color-success-subtle`, `$admin-success-subtle` | Nền nhạt trạng thái thành công |
| `--color-warning` | `#b98a3e` | `$color-warning`, `$admin-warning` | Màu trạng thái chờ / lưu ý (Muted Champagne) |
| `--color-warning-subtle` | `#f5ead6` | `$color-warning-subtle`, `$admin-warning-subtle` | Nền nhạt trạng thái chờ / lưu ý |

*(Ngoài ra các kênh RGB tương ứng `--color-*-rgb` cũng được khai báo trong `:root` để phục vụ cú pháp `rgba(var(--color-*-rgb), <alpha>)` trong CSS/SCSS).*

### 4.2. Typography, Layout, Radius, Motion & Shadows

- **Font chữ**: `--font-serif`, `--font-sans`, `--font-script`
- **Cỡ chữ & Độ đậm**: `--text-xs` .. `--text-5xl`, `--weight-regular` .. `--weight-bold`, `--leading-tight` .. `--leading-relaxed`, `--tracking-tight` .. `--tracking-widest`
- **Khoảng cách (Spacing)**: `--space-0-5`, `--space-1`, `--space-2`, `--space-2-5`, `--space-3`, `--space-4`, `--space-6`, `--space-8`, `--space-12`, `--space-16`, `--space-20`, `--space-24`
- **Bo góc & Khung**: `--max-width-content`, `--radius-s`, `--radius-m`, `--radius-l`, `--radius-pill`
- **Chuyển động & Đổ bóng**: `--transition-default`, `--shadow-sm`, `--shadow-default`, `--shadow-lg`, `--admin-shadow-card`, `--admin-shadow-card-hover`, `--admin-shadow-modal`
