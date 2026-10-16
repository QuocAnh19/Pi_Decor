-- ============================================================================
-- 0026_studio_templates_columns.sql
-- Pi Decor — Postgres schema, migration 26
-- ============================================================================
-- Adds created_at, updated_at, and default_config columns to studio_templates
-- ============================================================================

alter table studio_templates add column if not exists created_at timestamptz not null default now();
alter table studio_templates add column if not exists updated_at timestamptz not null default now();
alter table studio_templates add column if not exists default_config jsonb not null default '{}';
