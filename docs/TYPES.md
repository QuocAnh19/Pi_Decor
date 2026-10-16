# Kiểm kê Hệ thống Kiểu Dữ liệu & Ánh xạ Thực thể (`docs/TYPES.md`)

Tài liệu này thống kê ba bộ định nghĩa kiểu (types) đang tồn tại song song trong dự án Pi Decor, các vị trí chuyển đổi dữ liệu (mappers/adapters), và danh sách toàn bộ các vị trí sử dụng `any` trước khi hợp nhất ở **Nhiệm vụ P16**.

---

## 1. Bảng ánh xạ các thực thể giữa 3 bộ Type và nơi chuyển đổi

| Thực thể | Bộ 1: API / DB Contract (`client/src/lib/types.ts` — `snake_case`) | Bộ 2: Studio Internal (`client/src/features/studio/types/index.ts` — `camelCase`) | Bộ 3: Projects / Portfolio UI (`client/src/features/projects/types/index.ts` & `lib/types.ts` — `camelCase`) | Nơi chuyển đổi trước P16 | Hướng chuẩn hóa (P16) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Template** | `StudioTemplateRow` (`id`, `name`, `thumbnail`, `svg_base`, `category`, `is_active`, `default_config`, `created_at`, `updated_at`) | `Template` (`id`, `name`, `thumbnail`, `svgBase`, `category`, `isActive`) | — | `features/studio/utils/adapters.ts` (`toStudioTemplate`) | Chuyển sang `src/lib/mappers/studio.mapper.ts` (`toTemplate`, `toTemplatePublishPayload`) |
| **Slot** | `StudioSlotDefinitionRow` (`id`, `template_id`, `slot_key`, `label`, `slot_type`, `norm_x`, `norm_y`, `norm_width`, `norm_height`, `allow_scale`, `allow_rotate`, `mirror_x`, `z_index`, `sort_order`, `required`) | `SlotDefinition` (`id`, `templateId`, `slotKey`, `label`, `slotType`, `normX`, `normY`, `normWidth`, `normHeight`, `allowScale`, `allowRotate`, `mirrorX`, `zIndex`, `sortOrder`, `required`) | — | `features/studio/utils/adapters.ts` (`toStudioSlot`), Server `publishSlotItemSchema` (preprocess dual-name) | Chuyển sang `src/lib/mappers/studio.mapper.ts` (`toSlotDefinition`, `toSlotDefinitionRowPayload`). Bỏ dual-name ở server |
| **Asset** | `StudioAssetRow` (`id`, `asset_type`, `name`, `thumbnail`, `svg_data`, `color_hex`, `font_family`, `tags`, `is_active`, `dominant_colors`, `created_at`, `updated_at`) | `Asset` (`id`, `assetType`, `name`, `thumbnail`, `svgData`, `colorHex`, `fontFamily`, `tags`, `isActive`, `dominantColors`) | — | `features/studio/utils/adapters.ts` (`toStudioAsset`) | Chuyển sang `src/lib/mappers/studio.mapper.ts` (`toAsset`) |
| **Rule** | `StudioSlotRuleRow` (`id`, `template_id`, `rule_name`, `condition_slot`, `condition_value`, `target_slot`, `action`, `action_value`, `priority`) | `SlotRule` (`id`, `templateId`, `ruleName`, `conditionSlot`, `conditionValue`, `targetSlot`, `action`, `actionValue`, `priority`) | — | `features/studio/utils/adapters.ts` (`toStudioRule`), Server `publishRuleItemSchema` (preprocess dual-name) | Chuyển sang `src/lib/mappers/studio.mapper.ts` (`toSlotRule`, `toSlotRuleRowPayload`). Bỏ dual-name ở server |
| **Project** | `Project` (`id`, `venue_id`, `title`, `wedding_date`, `style_tags`, `cover_image`, `gallery`, `lead_id`, `published`, `location`, `description`, `budget`, `status`, `category_id`, `tag`, `price_tier`, `created_at`) & `ProjectPayload` | — | `ProjectItem` (`id`, `categoryId`, `tag`, `title`, `location`, `src`, `gallery`, `description`, `date`, `budget`, `status`, `priceTier`, `createdAt`, `venue_id`) & `CategoryPortfolioItem` | Rải rác tại 5 nơi:<br>1. `features/projects/types/index.ts` (`dbToProjectItem`)<br>2. `features/projects/components/ProjectForm.tsx` (ép kiểu `(project as any)` trực tiếp)<br>3. `components/sections/Lookbook.tsx`<br>4. `features/services/components/ServicesSection.tsx`<br>5. `features/map/components/VenuePopupCard.tsx` | Gom toàn bộ về `src/lib/mappers/project.mapper.ts` (`toProjectItem`, `toCategoryPortfolioItem`, `toProjectFormData`) |
| **Venue** | `Venue`, `VenueDetail`, `VenuePayload` (`id`, `name`, `type`, `address`, `city`, `lat`, `lng`, `cover_image`, `project_count`, `projects`) | — | — | Dùng trực tiếp `snake_case` từ `lib/types.ts` | Giữ `snake_case`, bổ sung helper trong `src/lib/mappers/venue.mapper.ts` |
| **Lead** | `Lead`, `LeadPayload`, `DesignSnapshot` (`id`, `name`, `phone`, `email`, `wedding_date`, `message`, `design_snapshot`, `status`, `created_at`) | — | — | Ép kiểu `lead.design_snapshot as any` trong `StudioPage.tsx`; đọc trực tiếp trong `LeadDetailDrawer.tsx` | Chuẩn hóa `DesignSnapshot` và tạo `src/lib/mappers/lead.mapper.ts` (`parseDesignSnapshot`, `buildDesignSnapshot`) |
| **Quotation** | `Quotation`, `QuotationItem`, `QuotationPayload` (`id`, `lead_id`, `admin_id`, `quotation_number`, `items`, `subtotal`, `discount`, `total`, `status`, `valid_until`, `notes`, `created_at`, `updated_at`) | — | — | Dùng trực tiếp `snake_case` trong `QuotationModal.tsx` | Giữ `snake_case`, tạo `src/lib/mappers/quotation.mapper.ts` |
| **Testimonial** | `TestimonialItem`, `TestimonialPayload` (`id`, `lead_id`, `author`, `role`, `quote`, `rating`, `photos`, `status`, `source`, `created_at`, `updated_at`) | — | — | Dùng trực tiếp `snake_case` trong `useTestimonials.ts` và `AdminTestimonialsPage.tsx` | Giữ `snake_case`, tạo `src/lib/mappers/testimonial.mapper.ts` |

---

## 2. Danh sách chi tiết mọi vị trí dùng `any` trong `client/src` (30 vị trí)

| STT | File | Dòng | Nội dung sử dụng `any` | Nguyên nhân & Cách khắc phục |
| :---: | :--- | :---: | :--- | :--- |
| 1 | `client/src/lib/types.ts` | 270 | `default_config?: Record<string, any> \| null;` | Đổi thành `SlotConfig \| Record<string, unknown> \| null` |
| 2 | `client/src/pages/StudioPage.tsx` | 25 | `const snapshot = lead.design_snapshot as any;` | Dùng hàm `parseDesignSnapshot(lead.design_snapshot)` từ `lead.mapper.ts` |
| 3 | `client/src/pages/StudioPage.tsx` | 68 | `const snapshot = editingLead?.design_snapshot as any;` | Dùng hàm `parseDesignSnapshot(editingLead?.design_snapshot)` |
| 4 | `client/src/features/studio/data/seed/templates.ts` | 281 | `export const seedPublishedSlotConfig: Record<string, any>` | Đổi thành kiểu `SlotConfig` |
| 5 | `client/src/features/studio/components/customer/SaveDesignModal.tsx` | 19 | `slots?: any[];` | Đổi thành `slots?: SlotDefinition[];` |
| 6 | `client/src/features/studio/components/customer/CustomerEditor.tsx` | 27 | `overrideRules?: any[];` | Đổi thành `overrideRules?: SlotRule[];` |
| 7 | `client/src/features/studio/components/admin/EditorHeader.tsx` | 25 | `editingLead?: any;` | Đổi thành `editingLead?: Lead \| null;` |
| 8 | `client/src/features/studio/components/admin/RuleEditor.tsx` | 176 | `onChange={(e) => setAction(e.target.value as any)}` | Đổi thành `SlotRule["action"]` |
| 9 | `client/src/features/projects/components/ProjectForm.tsx` | 29 | `project: any;` (nhánh `venueName: string`) | Đổi thành `project: Project \| ProjectItem \| null;` và chuẩn hóa qua `toProjectItem` |
| 10 | `client/src/features/projects/components/ProjectForm.tsx` | 62 | `(project as any)?.price_tier` | Xóa ép kiểu nhờ chuẩn hóa đầu vào bằng `toProjectItem` |
| 11 | `client/src/features/projects/components/ProjectForm.tsx` | 68 | `(project.gallery as any[])` | Định nghĩa kiểu rõ ràng `(string \| GalleryItemObject)[]` |
| 12 | `client/src/features/projects/components/ProjectForm.tsx` | 70 | `.map((item: any) => ...)` | Dùng hàm helper có kiểu `GalleryItemObject \| string` |
| 13 | `client/src/features/projects/components/ProjectForm.tsx` | 77 | `(project.gallery as any[]).slice(0, 10).forEach((item: any, idx: number) => ...)` | Xử lý qua helper chuẩn hóa gallery |
| 14 | `client/src/features/projects/components/ProjectForm.tsx` | 90 | `Array.isArray((project as any).style_tags) ? (project as any).style_tags[0]` (x2) | Chuẩn hóa bằng `toProjectItem` |
| 15 | `client/src/features/projects/components/ProjectForm.tsx` | 91 | `Array.isArray((project as any).style_tags) ? (project as any).style_tags[1] \|\| (project as any).style_tags[0]` (x3) | Chuẩn hóa bằng `toProjectItem` |
| 16 | `client/src/features/projects/components/ProjectForm.tsx` | 93 | `(project as any).cover_image` | Chuẩn hóa bằng `toProjectItem` |
| 17 | `client/src/features/projects/components/ProjectForm.tsx` | 96 | `(project as any).wedding_date` | Chuẩn hóa bằng `toProjectItem` |
| 18 | `client/src/features/projects/components/ProjectForm.tsx` | 98 | `(project as any).published === false` | Chuẩn hóa bằng `toProjectItem` |
| 19 | `client/src/features/projects/components/ProjectForm.tsx` | 99 | `(project as any).price_tier` | Chuẩn hóa bằng `toProjectItem` |
| 20 | `client/src/features/projects/components/ProjectForm.tsx` | 103 | `(project.gallery as any[])` | Chuẩn hóa bằng helper |
| 21 | `client/src/features/projects/components/ProjectForm.tsx` | 105 | `.map((item: any) => ...)` | Chuẩn hóa bằng helper |
| 22 | `client/src/features/projects/components/ProjectForm.tsx` | 110 | `(project.gallery as any[]).slice(0, 10).forEach((item: any, idx: number) => ...)` | Chuẩn hóa bằng helper |
| 23 | `client/src/features/projects/components/ProjectForm.tsx` | 255 | `gallery: (formData.gallery as any[]) \|\| []` | Chuẩn hóa kiểu `string[]` cho `ProjectPayload.gallery` |
| 24 | `client/src/features/projects/components/ProjectForm.tsx` | 372 | `setFormData({ ...formData, status: e.target.value as any })` | Ép kiểu sang `ProjectItem["status"]` |
| 25 | `client/src/features/projects/components/ProjectForm.tsx` | 381 | `setFormData({ ...formData, priceTier: e.target.value as any })` | Ép kiểu sang `ProjectItem["priceTier"]` |
