# Ghi Chú & Quy Ước Cơ Sở Dữ Liệu (DATA_NOTES.md)

Tài liệu này ghi nhận các quy ước thiết kế, cấu trúc tài liệu JSONB, chính sách bảo vệ dữ liệu cá nhân (PII) và danh mục các trường dữ liệu cần xác nhận hoặc loại bỏ.

---

## 1. Quy Ước Thiết Kế Cơ Sở Dữ Liệu

- **Khóa chính (Primary Key)**:
  - 14/15 bảng nghiệp vụ sử dụng `uuid` v4 tự sinh thông qua hàm `gen_random_uuid()` của PostgreSQL (tiện ích mở rộng `pgcrypto`).
  - Riêng bảng `quotation_counters` sử dụng `integer` (cột `year`) làm khóa chính để thực hiện đếm chuỗi nguyên tử theo năm (`BG-YYYY-XXXX`).
- **Thời gian & Múi giờ (Timestamps)**:
  - Tất cả các trường thời gian (`created_at`, `updated_at`, `expires_at`, `revoked_at`, `consent_at`) bắt buộc dùng kiểu `timestamp with time zone` (`timestamptz`) với giá trị mặc định `now()`. Tuyệt đối không dùng `timestamp` không múi giờ để tránh sai lệch thời gian giữa máy chủ và người dùng.
  - Tự động cập nhật `updated_at` thông qua hàm kích hoạt `set_updated_at()` trên trigger `BEFORE UPDATE`.
- **Ràng buộc miền giá trị (Domain Constraints)**:
  - Chuỗi văn bản trạng thái và phân loại sử dụng kiểu `text` kết hợp `CHECK constraint` (ví dụ `status in ('new', 'contacted', 'closed')`) thay vì PostgreSQL `enum` để đảm bảo khả năng mở rộng và áp dụng migration mượt mà, không khóa bảng.

---

## 2. Quy Ước & Cấu Trúc Các Trường JSONB

PostgreSQL `jsonb` được sử dụng cho dữ liệu linh hoạt, bán cấu trúc:

### 2.1. `quotations.items`

Mảng các hạng mục dịch vụ/vật tư chi tiết trong bảng báo giá gửi cô dâu chú rể:

```json
[
  {
    "id": "uuid",
    "name": "Trang trí backdrop hoa lụa và lụa dập ly",
    "quantity": 1,
    "unit_price": 18000000,
    "total": 18000000,
    "note": "Tone màu cam pastel, kích thước 3.5m x 5m"
  }
]
```

### 2.2. `projects.gallery`

Danh sách hình ảnh chi tiết của album dự án tiệc cưới Lookbook:

```json
[
  {
    "url": "https://res.cloudinary.com/pidecor/image/upload/.../gallery_01.webp",
    "caption": "Bàn đón khách gallery phong cách Rustic",
    "order": 1
  }
]
```

### 2.3. `testimonials.photos`

Danh sách hình ảnh thực tế đính kèm đánh giá của các cặp đôi:

```json
[
  {
    "url": "https://res.cloudinary.com/pidecor/image/upload/.../wedding_01.webp",
    "width": 1200,
    "height": 800
  }
]
```

### 2.4. `leads.design_snapshot`

Lưu trạng thái phối cảnh không gian xuất từ Interactive Studio tại thời điểm gửi biểu mẫu liên hệ:

```json
{
  "templateId": "uuid",
  "templateName": "Backdrop Rustic Khung Vòm",
  "slots": {
    "arch_main": { "assetId": "uuid", "assetName": "Cổng vòm hoa", "color": "#F8F9FA" },
    "drape_base": { "assetId": "uuid", "assetName": "Rèm lụa trắng", "color": "#FFFFFF" }
  },
  "previewUrl": "data:image/svg+xml;base64,..."
}
```

### 2.5. `studio_templates.default_config`

Cấu hình thiết lập mặc định của các slot khi khởi tạo một mẫu thiết kế không gian:

```json
{
  "slots": {
    "drape_base": { "defaultAssetId": "uuid", "defaultColor": "#FAF7F2" },
    "flower_top": { "defaultAssetId": "uuid" }
  }
}
```

### 2.6. `services.items`

Mảng danh sách các quyền lợi hoặc hạng mục chi tiết hiển thị trong thẻ Bento dịch vụ.

---

## 3. Quy Tắc Dữ Liệu Cá Nhân (PII) & Bảo Vệ Quyền Riêng Tư

Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân:

| Bảng           | Cột PII                         | Mức độ nhạy cảm         | Biện pháp bảo vệ                                                                                                      |
| :------------- | :------------------------------ | :---------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `leads`        | `name`                          | Trung bình              | Chỉ hiển thị cho quản trị viên đăng nhập. Che dấu (mask) khi xuất báo cáo hoặc preview dọn dẹp.                       |
| `leads`        | `phone`                         | Cao                     | Số điện thoại chuẩn hóa 10 số VN. Che dấu `090****123` trong logs.                                                    |
| `leads`        | `email`                         | Cao                     | Lưu trữ bảo mật, chỉ dùng liên lạc báo giá.                                                                           |
| `leads`        | `consent_at`, `consent_version` | Pháp lý                 | Bắt buộc ghi nhận thời điểm và phiên bản điều khoản khi gửi form. Lead không có consent bị chặn từ client Zod schema. |
| `leads`        | —                               | Chính sách lưu trữ      | Tự động thanh lọc các lead quá hạn lưu trữ qua script `purge-leads.js` (mặc định 180 ngày).                           |
| `testimonials` | `author`                        | Công khai có kiểm duyệt | Hiển thị sau khi admin kiểm duyệt (`status = 'approved'`).                                                            |
| `testimonials` | `lead_id`                       | Nội bộ                  | Liên kết nguồn gốc với lead. **Tuyệt đối không lộ** ra API công khai `GET /api/testimonials`.                         |
| `admins`       | `email`                         | Nội bộ                  | Tên đăng nhập quản trị viên.                                                                                          |
| `admins`       | `password_hash`                 | Tối mật                 | Băm một chiều bằng bcryptjs (salt rounds 10). Không bao giờ trả về trong phản hồi API.                                |

---

## 4. Danh Mục Cột Nghi Thừa & Kiến Nghị Xử Lý

Qua đối chiếu giữa cơ sở dữ liệu và mã nguồn ứng dụng, các cột sau đang nghi thừa hoặc trùng lặp:

1. `projects.budget`:
   - _Hiện trạng_: Kiểu `text`, lưu khoảng ngân sách dạng văn bản tự do.
   - _Đánh giá_: Hiện tại hệ thống đã chuẩn hóa trường `price_tier` (`standard`, `premium`, `luxury`) dùng cho bộ lọc Lookbook. Trường `budget` ít được sử dụng và không có cấu trúc cố định.
   - _Kiến nghị [CẦN XÁC NHẬN]_: Đánh dấu deprecated và chuẩn bị gỡ bỏ ở đợt tối ưu hóa tiếp theo.
2. `projects.tag`:
   - _Hiện trạng_: Kiểu `text`, lưu nhãn đơn lẻ.
   - _Đánh giá_: Đã có mảng `style_tags text[]` hỗ trợ chỉ mục GIN (`idx_projects_style_tags_gin`), phục vụ tìm kiếm đa nhãn phong cách tiệc cưới.
   - _Kiến nghị [CẦN XÁC NHẬN]_: Gộp toàn bộ nhãn vào `style_tags` và drop cột `tag`.
3. `projects.location`:
   - _Hiện trạng_: Kiểu `text`, lưu vị trí địa lý dạng văn bản.
   - _Đánh giá_: Trùng lặp với thông tin `address` và `city` của bảng `venues` (liên kết qua `venue_id`).
   - _Kiến nghị [CẦN XÁC NHẬN]_: Dự án đã gắn với `venue_id` nên tái sử dụng địa chỉ từ venue. Chỉ giữ `projects.location` nếu đám cưới tổ chức tại tư gia không thuộc venue nào trong danh mục.
4. `projects.status`:
   - _Hiện trạng_: Kiểu `text` mặc định `'active'`.
   - _Đánh giá_: Trạng thái hiển thị công khai thực tế đang được điều khiển bằng cờ boolean `projects.published`. Cột `status` hiện không có luồng nghiệp vụ riêng.
   - _Kiến nghị [CẦN XÁC NHẬN]_: Hợp nhất trạng thái vào cờ `published` hoặc bổ sung luồng lưu trữ `archived`.
