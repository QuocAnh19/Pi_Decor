-- ============================================================================
-- 0019_studio_templates_default_config.sql
-- Pi Decor — Postgres schema, migration 19
-- ============================================================================
-- Adds default_config jsonb column to studio_templates table for storing
-- published slot configs (materials, assigned images, filter modes, colors).
-- ============================================================================

alter table studio_templates add column if not exists default_config jsonb not null default '{}';
