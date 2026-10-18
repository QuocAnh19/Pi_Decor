# ADR 0008: Quản Lý Design Tokens Bằng CSS Custom Properties Thay Vì SCSS Variables

## Trạng thái

Đã chấp nhận

## Ngày

2026-10-16

## Commit liên quan

[052c414](https://github.com/QuocAnh19/Pi_Decor/commit/052c414) — `refactor(styles): single source design tokens via CSS variables`

---

## 1. Bối cảnh (Context)

Trước đây giao diện ứng dụng sử dụng biến SCSS (`$primary-color`, `$spacing-base`) rải rác:

- Biến SCSS được biên dịch tĩnh tại thời điểm build; trình duyệt không thể can thiệp hoặc thay đổi động trong thời gian chạy (runtime).
- Khó triển khai giao diện theo ngữ cảnh hoặc chế độ tối/sáng (theming) trong tương lai.
- Xuất hiện tình trạng mã màu Hex cứng (`#D4AF37`, `#FFFFFF`) bị lặp lại nhiều lần trong các file SCSS Module.

## 2. Quyết định (Decision)

- Xây dựng hệ thống Design Tokens duy nhất tại `apps/web/src/styles/_tokens.scss` sử dụng CSS Custom Properties (biến CSS native, tiền tố `--color-*`, `--font-*`, `--space-*`, `--radius-*`).
- Tham chiếu mọi giá trị màu sắc, khoảng cách, bo góc thông qua hàm `var(--token)`.
- Siết chặt quy tắc kiểm tra Stylelint `color-no-hex: "error"` để ngăn chặn việc nhập mã màu Hex trực tiếp trong SCSS.

## 3. Phương án đã cân nhắc (Considered Options)

- **Phương án 1 (Được chọn)**: CSS Custom Properties kết hợp SCSS Modules. Tận dụng sức mạnh của CSS native trên trình duyệt hiện đại đồng thời bảo toàn tính cô lập của SCSS Modules.
- **Phương án 2**: Tailwind CSS. Đã bị gỡ bỏ khỏi dự án do làm loãng cấu trúc HTML và không phù hợp với đặc thù giao diện tùy biến chi tiết cao của Studio cưới.
- [CẦN XÁC NHẬN: chủ dự án bổ sung kế hoạch bổ sung Dark Mode].

## 4. Hệ quả (Consequences)

- **Tích cực**: Dễ dàng tùy biến chủ đề động tại runtime; giảm 100% việc viết cứng mã màu; giao diện có tính đồng nhất thương hiệu cao.
- **Tiêu cực / Đánh đổi**: Không thể dùng biến CSS trực tiếp trong các hàm xử lý màu tĩnh của SCSS tiền biên dịch (như `darken()` hay `lighten()`).
