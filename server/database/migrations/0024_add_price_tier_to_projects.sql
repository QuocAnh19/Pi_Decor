-- ============================================================================
-- 0024_add_price_tier_to_projects.sql
-- Add price_tier column to projects table ("standard" vs "premium")
-- ============================================================================

alter table projects add column if not exists price_tier text not null default 'standard';

alter table projects drop constraint if exists check_projects_price_tier;
alter table projects add constraint check_projects_price_tier check (price_tier in ('standard', 'premium'));

create index if not exists idx_projects_price_tier on projects (price_tier);
