# Sơ Đồ Thực Thể Quan Hệ Pi Decor (ERD)

> Sơ đồ được sinh tự động từ các ràng buộc khóa ngoại (Foreign Keys) trong cơ sở dữ liệu PostgreSQL.

## 1. Sơ Đồ Tổng Thể Hệ Thống

```mermaid
erDiagram
    admins ||--o{ lead_activities : "FK (SET NULL)"
    leads ||--o{ lead_activities : "FK (CASCADE)"
    leads ||--o{ projects : "FK (SET NULL)"
    venues ||--o{ projects : "FK (CASCADE)"
    admins ||--o{ quotations : "FK (SET NULL)"
    leads ||--o{ quotations : "FK (CASCADE)"
    admins ||--o{ refresh_tokens : "FK (CASCADE)"
    studio_templates ||--o{ studio_slot_definitions : "FK (CASCADE)"
    studio_templates ||--o{ studio_slot_rules : "FK (CASCADE)"
    leads ||--o{ testimonials : "FK (SET NULL)"
```

---

## 2. Phân Hệ CRM Khách Hàng & Báo Giá

```mermaid
erDiagram
    leads {
        uuid id PK
        text name
        text phone
        text email
        date wedding_date
        text message
        jsonb design_snapshot
        text status
        timestamp_with_time_zone created_at
        timestamp_with_time_zone consent_at
        text consent_version
    }
    lead_activities {
        uuid id PK
        uuid lead_id FK
        uuid admin_id FK
        text activity_type
        text body
        jsonb metadata
        timestamp_with_time_zone created_at
    }
    quotations {
        uuid id PK
        uuid lead_id FK
        uuid admin_id FK
        text quotation_number
        jsonb items
        integer subtotal
        integer discount
        integer total
        text status
        date valid_until
        text notes
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
    }
    quotation_counters {
        integer year PK
        integer last_seq
    }
    testimonials {
        uuid id PK
        uuid lead_id FK
        text author
        text role
        text quote
        integer rating
        jsonb photos
        text status
        text source
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
        timestamp_with_time_zone consent_at
        text consent_version
    }
    leads ||--o{ lead_activities : "FK (CASCADE)"
    leads ||--o{ quotations : "FK (CASCADE)"
    leads ||--o{ testimonials : "FK (SET NULL)"
```

---

## 3. Phân Hệ Quản Lý Nội Dung & Dự Án

```mermaid
erDiagram
    projects {
        uuid id PK
        uuid venue_id FK
        text title
        date wedding_date
        text_array style_tags
        text cover_image
        jsonb gallery
        uuid lead_id FK
        boolean published
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
        text location
        text description
        text budget
        text status
        text category_id
        text tag
        text price_tier
    }
    venues {
        uuid id PK
        text name
        text type
        text address
        text city
        double_precision lat
        double_precision lng
        text cover_image
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
    }
    services {
        uuid id PK
        text title
        text description
        text image_url
        integer order
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
        text brand
        text tagline
        text icon
        text accent
        jsonb items
        text href
        text cta_label
        boolean featured
        text cover
    }
    materials {
        uuid id PK
        text name
        text category
        text color_hex
        text image_url
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
    }
    venues ||--o{ projects : "FK (CASCADE)"
```

---

## 4. Phân Hệ Studio Thiết Kế Không Gian

```mermaid
erDiagram
    studio_templates {
        uuid id PK
        text name
        text thumbnail
        text svg_base
        text category
        boolean is_active
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
        jsonb default_config
    }
    studio_slot_definitions {
        uuid id PK
        uuid template_id FK
        text slot_key
        text label
        text slot_type
        numeric norm_x
        numeric norm_y
        numeric norm_width
        numeric norm_height
        boolean allow_scale
        boolean allow_rotate
        boolean mirror_x
        integer z_index
        integer sort_order
        boolean required
    }
    studio_assets {
        uuid id PK
        text asset_type
        text name
        text thumbnail
        text svg_data
        text color_hex
        text font_family
        jsonb tags
        boolean is_active
        jsonb dominant_colors
        timestamp_with_time_zone created_at
        timestamp_with_time_zone updated_at
    }
    studio_slot_rules {
        uuid id PK
        uuid template_id FK
        text rule_name
        text condition_slot
        jsonb condition_value
        text target_slot
        text action
        jsonb action_value
        integer priority
    }
    studio_templates ||--o{ studio_slot_definitions : "FK (CASCADE)"
    studio_templates ||--o{ studio_slot_rules : "FK (CASCADE)"
```

---

## 5. Phân Hệ Xác Thực & Quản Trị Viên

```mermaid
erDiagram
    admins {
        uuid id PK
        text email
        text password_hash
        timestamp_with_time_zone created_at
        text role
    }
    refresh_tokens {
        uuid id PK
        uuid admin_id FK
        text token_hash
        timestamp_with_time_zone expires_at
        timestamp_with_time_zone revoked_at
        timestamp_with_time_zone created_at
        uuid family_id
        text replaced_by
    }
    admins ||--o{ refresh_tokens : "FK (CASCADE)"
```

---
