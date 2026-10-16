-- ============================================================================
-- 0027_query_performance_indexes.sql
-- Pi Decor — Postgres schema, migration 27
-- ============================================================================
-- Bổ sung index cho các truy vấn lọc thường dùng và tìm kiếm văn bản:
-- 1. Trigram GIN indexes cho leads (name, phone, email) để tối ưu tìm kiếm ILIKE %term%
-- 2. Index cho projects (published, created_at desc) phục vụ API công khai và lọc trạng thái
-- 3. Index cho studio_templates & studio_assets phục vụ lọc is_active
-- 4. Index cho materials phục vụ lọc category
-- ============================================================================

-- Leads: Tối ưu tìm kiếm substring (LIKE / ILIKE) bằng GIN trigram
create index if not exists idx_leads_name_trgm on leads using gin (name gin_trgm_ops);
create index if not exists idx_leads_phone_trgm on leads using gin (phone gin_trgm_ops);
create index if not exists idx_leads_email_trgm on leads using gin (email gin_trgm_ops);

-- Projects: Tối ưu lọc dự án công khai (published = true) và sắp xếp mới nhất
create index if not exists idx_projects_published_created_at on projects (published, created_at desc);
create index if not exists idx_projects_status on projects (status);
create index if not exists idx_projects_category_id on projects (category_id);

-- Studio Templates: Tối ưu lọc template đang kích hoạt
create index if not exists idx_studio_templates_active_created_at on studio_templates (is_active, created_at desc);

-- Studio Assets: Tối ưu lọc asset đang kích hoạt
create index if not exists idx_studio_assets_active_created_at on studio_assets (is_active, created_at desc);

-- Materials: Tối ưu lọc theo category và sắp xếp thời gian tạo
create index if not exists idx_materials_category_created_at on materials (category, created_at asc);
