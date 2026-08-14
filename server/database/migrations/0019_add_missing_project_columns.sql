-- ============================================================================
-- 0019_add_missing_project_columns.sql
-- Add missing project fields for Admin Projects Form (location, description, budget, status, category_id, tag)
-- ============================================================================

alter table projects add column if not exists location text;
alter table projects add column if not exists description text;
alter table projects add column if not exists budget text;
alter table projects add column if not exists status text default 'active';
alter table projects add column if not exists category_id text;
alter table projects add column if not exists tag text;
