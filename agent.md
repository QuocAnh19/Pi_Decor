# SYSTEM RULES & INSTRUCTIONS FOR AI CODEX — PI DECOR ARCHITECTURE

> **Tài liệu hướng dẫn phát triển và quy chuẩn kiến trúc cho toàn bộ hệ thống Pi Decor (Website Dịch Vụ Cưới & Sự Kiện Cao Cấp, Interactive Studio & Admin Management Platform).**

---

## 1. TỔNG QUAN DỰ ÁN & VAI TRÒ (Project Overview & Role)

- **Mục tiêu dự án:** Xây dựng nền tảng số toàn diện cho thương hiệu **Pi Decor** (Đà Nẵng & Miền Trung) bao gồm:
  1. **Public Showcase:** Trang chủ, Portfolio / Lookbook tiệc cưới thực tế, dịch vụ (PiWedding, PiKids, PiEvent), phản hồi khách hàng và form tư vấn/báo giá.
  2. **Interactive Studio (Phòng Thiết Kế 2D):** Ứng dụng phối cảnh phông nền cưới trực quan kéo thả (SVG canvas, drape, hoa, đèn, bảng tên monogram, lighting), hệ thống tọa độ chuẩn hóa $[0, 1]$, và engine kiểm tra luật phối màu/vật liệu (Rule Engine).
  3. **Wedding Venue Map:** Bản đồ tương tác các địa điểm cưới tại Đà Nẵng/Miền Trung liên kết trực tiếp với các dự án đã triển khai.
  4. **Admin Management Platform:** Quản lý Leads & Timeline chăm sóc khách hàng, Dự án/Lookbook, Địa điểm cưới, Vật liệu/Assets Studio, Báo giá & Chiết khấu, Phân quyền Admin.
- **Vai trò AI:** Senior Fullstack Architect & Lead Developer — duy trì tính nhất quán của code, bảo đảm hiệu năng tối đa, bảo mật tuyệt đối, và tuân thủ chặt chẽ Design System của dự án.

---

## 2. TECH STACK & KIẾN TRÚC (Technology Stack)

### 2.1. Frontend (`client/`)
- **Core:** React 18 (Functional Components, Hooks), TypeScript (Strict Mode), Vite 5.
- **Styling:** 
  - SCSS Modules (`*.module.scss`) với hệ thống Design Tokens tập trung tại `client/src/styles/_tokens.scss` và `_variables.scss`.
  - CSS Custom Properties (Theme admin `#0f172a` / `#1e293b` & Theme client Paper `#fbf7f1` / Ink `#271620`).
  - TailwindCSS (tiện ích bổ trợ layout nhanh, typography).
- **Interactive Studio Engine:** `@dnd-kit/core` (Drag & Drop), SVG DOM Manipulation, Coordinate Normalization Utilities.
- **Map Engine:** MapLibre GL / OpenStreetMap với custom marker pins.
- **Icons & Motion:** Lucide React, Heroicons, CSS Transforms/Keyframe Animations (`Reveal`, `MediaSlot`).
- **Routing & State:** `react-router-dom` v6, React Context API (`AuthContext`), Custom Domain Hooks (`useProjects`, `useVenues`, `useSlotDnD`, `useRules`).
- **Resilience:** React `ErrorBoundary` bọc toàn bộ ứng dụng tại `main.tsx`.

### 2.2. Backend (`server/`)
- **Runtime:** Node.js (ES Modules `"type": "module"`), Express.js.
- **Database & Data Layer:**
  - **Primary (Production/Dev):** PostgreSQL trên Neon Serverless thông qua `pg.Pool` (`DATABASE_URL`).
  - **Fallback (Offline Dev):** Dual-mode In-Memory JSON database (`src/data/db.json`) tự động kích hoạt khi không có `DATABASE_URL`.
  - **Database Migration:** Quản lý tuần tự không trùng lặp `0001_...sql` $\rightarrow$ `0023_...sql` thông qua `server/database/migrate.js` và bảng `schema_migrations`.
- **Validation:** Zod Schemas (`src/schemas/*.schema.js`) kết hợp middleware `validate.js`.
- **Security & Rate Limiting:** JWT Access Tokens (15m), Refresh Tokens (7d, SHA-256 hashed trong DB), `bcryptjs`, Helmet, CORS Whitelisting, `express-rate-limit` (leadsLimiter, loginLimiter).
- **Media & File Storage:** Cloudinary Storage (`CLOUDINARY_URL`) với cơ chế tự động fallback về Local Disk (`uploads/`) thông qua `src/utils/uploadImage.js`.
- **Lifecycle & Health:** Graceful Shutdown bắt `SIGINT`/`SIGTERM` đóng connection pool sạch sẽ; Endpoint `/api/health` kiểm tra `SELECT 1` thực tế trên DB.

---

## 3. CẤU TRÚC THƯ MỤC CHUẨN (Directory Structure)

```text
Pi_Decor/
├── client/                              # Frontend React + TypeScript App
│   ├── src/
│   │   ├── components/                  # UI Primitives & Global Components
│   │   │   ├── ui/                      # Button, Input, Select, Textarea, SearchInput, Modal, Drawer, Toast, MediaSlot, Reveal, Layout
│   │   │   ├── sections/                # Hero, Services, Lookbook, Testimonials, ContactForm, Footer
│   │   │   └── ErrorBoundary.tsx        # Global React Error Boundary
│   │   ├── features/                    # Feature-based Domain Modules
│   │   │   ├── admin/                   # Admin pages & management panels
│   │   │   ├── map/                     # MapLibre GL map & venue explorer
│   │   │   ├── projects/                # Project list, gallery viewer, project hooks & types
│   │   │   ├── services/                # Service catalog & detail modals
│   │   │   └── studio/                  # Interactive 2D Studio (Canvas, DnD, Rules, Adapters, Seed)
│   │   ├── lib/                         # Core Client Libraries
│   │   │   ├── api.ts                   # Type-safe API Client (authRequest, auto-refresh 401 retry)
│   │   │   ├── authContext.tsx          # JWT Authentication Context
│   │   │   ├── content.ts               # Static fallback data & business content
│   │   │   └── types.ts                 # Central TypeScript interfaces & domain models
│   │   ├── styles/                      # Global Styles & Design System
│   │   │   ├── _tokens.scss             # Typography scale, spacing scale, color palette variables
│   │   │   ├── _variables.scss          # SCSS forwarded variables & mixins
│   │   │   └── main.scss                # Global base styles & reset
│   │   ├── App.tsx                      # App Routing Configuration
│   │   └── main.tsx                     # React DOM Entry with ErrorBoundary & AuthProvider
│   ├── package.json
│   └── vite.config.ts
│
├── server/                              # Backend Node.js Express API
│   ├── database/                        # Database Management
│   │   ├── migrations/                  # Sequential SQL files (0001_... to 0023_...)
│   │   ├── migrate.js                   # Migration runner script
│   │   └── README.md                    # Database documentation & migration logs
│   ├── src/
│   │   ├── config/                      # Infrastructure & Database Adapters
│   │   │   ├── database.js              # Environment-aware DB gateway (Postgres vs JSON)
│   │   │   └── database.pg.js           # Parameterized SQL Postgres Adapter with pg pool
│   │   ├── middlewares/                 # Express Middlewares
│   │   │   ├── verifyToken.js           # JWT verification & requireAdmin guard
│   │   │   ├── validate.js              # Zod payload validation middleware
│   │   │   └── rateLimiters.js          # IP-based rate limiting configurations
│   │   ├── routes/                      # Domain-driven API Route Handlers
│   │   │   ├── admin/                   # Dashboard summary counts & admin analytics
│   │   │   ├── auth/                    # Login, Refresh, Logout, Admin Profile
│   │   │   ├── leads/                   # Public submission & Admin Leads CRM / Activities
│   │   │   ├── materials/               # Studio Fabric/Detail materials catalog
│   │   │   ├── projects/                # Lookbook & venue past weddings
│   │   │   ├── quotations/              # Cost estimation & proposal drafts
│   │   │   ├── services/                # Business services catalog
│   │   │   ├── studio/                  # Studio templates, slot definitions, rules & assets
│   │   │   ├── testimonials/            # Reviews management & public approval
│   │   │   └── venues/                  # Map venues & coordinates
│   │   ├── schemas/                     # Zod Validation Schemas
│   │   │   ├── auth.schema.js
│   │   │   ├── leads.schema.js          # VN phone regex & email normalization
│   │   │   ├── materials.schema.js
│   │   │   └── venues.schema.js
│   │   ├── utils/                       # Server Utilities
│   │   │   ├── uploadImage.js           # Cloudinary / Multer image upload & file cleanup
│   │   │   └── token.js                 # SHA-256 token hashing
│   │   ├── app.js                       # Express Application Setup, Middleware & /api/health
│   │   └── server.js                    # Server Bootstrapper & Graceful Shutdown Handler
│   ├── package.json
│   └── .env                             # Environment Variables (DATABASE_URL, JWT_SECRET, etc.)
│
└── agent.md                             # AI Operating Guide & Architecture Blueprint
```

---

## 4. QUY CHUẨN CODE FRONTEND (Frontend Guidelines)

### 4.1. Design Tokens & Styling
- **Không hardcode mã hex hay kích thước tùy tiện**: Luôn dùng biến từ `styles/_tokens.scss` hoặc CSS variables:
  - **Colors (Admin):** `$color-admin-bg` (`#0f172a`), `$color-admin-surface` (`#1e293b`), `$color-admin-border` (`#334155`), `$color-admin-accent` (`#38bdf8`), `$color-danger` (`#e11d48`), `$color-success` (`#10b981`).
  - **Colors (Client):** `$color-paper` (`#fbf7f1`), `$color-ink` (`#271620`), `$color-accent-brand` (`#a15c2e`).
  - **Typography Scale:** `$text-xs` (12px), `$text-sm` (14px), `$text-base` (16px), `$text-lg` (18px), `$text-xl` (20px), `$text-2xl` (24px), `$text-3xl` (30px), `$text-4xl` (36px).
  - **Spacing Scale:** `$space-1` (4px), `$space-2` (8px), `$space-3` (12px), `$space-4` (16px), `$space-6` (24px), `$space-8` (32px), `$space-12` (48px), `$space-20` (80px).
  - **Breakpoints chuẩn:** `$bp-sm` (640px), `$bp-md` (768px), `$bp-lg` (1024px). Tránh xung đột breakpoint (dùng `max-width: 767px` thay vì `768px` khi viết mobile-only query).
- **Form Controls:** Dùng các UI Primitives chuẩn trong `client/src/components/ui/` (`Input`, `Select`, `Textarea`, `SearchInput`) thay vì viết thẻ HTML thô.

### 4.2. TypeScript & API Integration
- **Strict Typing:** Tuyệt đối không dùng kiểu `any` tùy tiện. Mọi đối tượng dữ liệu phải kế thừa hoặc ánh xạ đúng kiểu từ `client/src/lib/types.ts`.
- **API Client:** Mọi lệnh gọi API phải thông qua `client/src/lib/api.ts`.
  - Không khởi tạo `fetch` hoặc `axios` riêng lẻ trong component.
  - Sử dụng `authRequest` cho các endpoint yêu cầu quyền Admin để tự động kích hoạt cơ chế retry refresh token khi gặp HTTP 401.

### 4.3. Interactive Studio 2D Canvas & Coordinates
- Tọa độ các vị trí gắn vật liệu (Slots) luôn được chuẩn hóa trong khoảng $[0.0, 1.0]$ (`normX`, `normY`, `normWidth`, `normHeight`).
- Sử dụng hàm tiện ích `svgToNormalized` và `normalizedToSvg` trong `features/studio/utils/coordinates.ts` để bảo đảm giao diện canvas co giãn hoàn hảo trên mọi kích thước màn hình mà không bị lệch vật thể.
- Mọi rule ràng buộc vật liệu phải tuân theo cấu trúc `Rule` hoặc `SlotRule` và được đánh giá qua `evaluateRules()` theo thứ tự `priority` giảm dần.

---

## 5. QUY CHUẨN CODE BACKEND & DATABASE (Backend & Database Guidelines)

### 5.1. Database Adapter & Tránh Full Table Scan
- **Tuyệt đối không dùng `db.get(table)` rồi `filter()` / `slice()` trong RAM** đối với các thao tác Update, Delete, Count hoặc Paginate.
- **Sử dụng đúng các method tối ưu hóa đã được trang bị:**
  - `db.updateById(table, id, patch)`: Update trực tiếp qua `UPDATE <table> SET ... WHERE id = $1 RETURNING *`.
  - `db.removeById(table, id)`: Xóa 1 bản ghi theo ID `DELETE FROM <table> WHERE id = $1`.
  - `db.removeWhere(table, column, value)`: Xóa các bản ghi phụ thuộc theo Foreign Key.
  - `db.updateWhere(table, column, value, patch)`: Update theo cột chỉ định (ví dụ revoke token theo `token_hash`).
  - `db.query(sql, values)`: Thực thi SQL trực tiếp với phân trang (`LIMIT $x OFFSET $y`) và tìm kiếm (`LIKE $z`).
  - `db.count(table, whereClause, values)`: Đếm trực tiếp bằng `SELECT count(*)::int as n` từ DB.

### 5.2. Database Migrations & Quy Tắc Đặt Tên
- Mọi thay đổi cấu trúc bảng, cột hoặc trigger đều phải tạo file migration mới trong `server/database/migrations/`.
- Định dạng tên file: `XXXX_<mo_ta_ngan_gon>.sql` với `XXXX` là số thứ tự 4 chữ số tăng dần liên tục (`0001`, `0002`, ..., `0023`, `0024`).
- Tuyệt đối không trùng lặp số migration. Sau khi viết migration, luôn chạy `npm run migrate` để kiểm tra.

### 5.3. Payload Validation & Bảo Mật Input
- Mọi route nhận dữ liệu `POST`, `PUT`, `PATCH` đều phải có Zod Schema tương ứng trong `server/src/schemas/`.
- Sử dụng middleware `validate(schema)` để tự động validate và sanitize dữ liệu đầu vào.
- Số điện thoại khách hàng phải validate theo định dạng Việt Nam (`/^(0|\+84)[0-9]{8,10}$/`).
- Ảnh tải lên phải được quản lý qua `uploadImage.js`. Khi cập nhật hoặc xóa bản ghi có ảnh, phải dọn dẹp file cũ trên disk/Cloudinary thông qua `deleteImageFile` hoặc `deleteMultipleImageFiles`.

---

## 6. QUY TẮC ĐẶT TÊN & FORMAT MÃ NGUỒN (Naming & Code Conventions)

- **Biến, Hàm & Thuộc tính:** `camelCase` (ví dụ: `weddingDate`, `handleSlotMove`, `formatCurrency`).
- **Tên Cột DB & JSON API Payloads:** `snake_case` (ví dụ: `created_at`, `wedding_date`, `cover_image`, `is_active`).
- **Components & TypeScript Interfaces:** `PascalCase` (ví dụ: `CustomerEditor`, `ProjectItem`, `VenueDetail`).
- **File Styles:** `[ComponentName].module.scss` (ví dụ: `Input.module.scss`, `Lookbook.module.scss`).
- **Hằng số toàn cục:** `UPPER_SNAKE_CASE` (ví dụ: `VN_PHONE_REGEX`, `CATEGORY_MAP`, `JSONB_COLUMNS`).

---

## 7. NGUYÊN TẮC LÀM VIỆC & PHẢN HỒI CỦA AI (AI Operating Workflow)

Mỗi khi nhận yêu cầu sửa đổi hoặc phát triển tính năng từ User, AI **bắt buộc tuân thủ 5 bước**:

1. **Hiểu Ngữ Cảnh & Kiến Trúc:** Đọc và phân tích các file liên quan trước khi chỉnh sửa. Không đoán mò API contract hoặc types.
2. **Kế Thừa Hệ Thống Có Sẵn:** Ưu tiên tái sử dụng các primitives trong `client/src/components/ui/`, các tokens trong `_tokens.scss`, và các database methods trong `database.pg.js`.
3. **Thực Hiện Chính Xác & Độc Lập:** 
   - Đảm bảo giữ nguyên logic nghiệp vụ sẵn có nếu không được yêu cầu thay đổi.
   - Luôn xử lý cả hai môi trường (Postgres adapter & JSON fallback mock) khi can thiệp vào tầng Database.
4. **Kiểm Tra & Xác Thực Sau Khi Sửa (Verification):**
   - Chạy `node --check src/server.js` cho backend sau khi sửa file JavaScript.
   - Chạy `npm run build` cho client sau khi sửa file TypeScript/SCSS để bảo đảm 0 lỗi Type và 0 lỗi cú pháp Vite.
5. **Báo Cáo Ngắn Gọn, Rõ Ràng:** Trình bày tóm tắt thay đổi kèm đường dẫn clickable link tới các file đã cập nhật (`file:///...`). Không giải thích lan man những điều hiển nhiên.

---

## 8. DANH SÁCH KIỂM TRA TRƯỚC KHI BÀN GIAO (Definition of Done)

- [ ] Code tuân thủ TypeScript Strict Mode (Không có lỗi compile `tsc`).
- [ ] Frontend responsive mượt mà tại các mốc `640px`, `767px`/`768px`, `1024px`.
- [ ] Không có query `SELECT *` toàn bảng chỉ để update, delete hoặc count.
- [ ] Form payloads được validate chặt chẽ bằng Zod Schemas.
- [ ] Mọi endpoint yêu cầu quyền quản trị đều được bọc `verifyToken` và `requireAdmin`.
- [ ] File migrations có số thứ tự tăng dần liên tục và chạy thành công qua `npm run migrate`.
- [ ] Server tắt sạch sẽ (Graceful Shutdown) và ping được qua `/api/health`.
