-- ============================================================================
-- 0002_schema_migrations.sql
-- Pi Decor — Postgres schema, migration 2/11
-- ============================================================================
-- Bookkeeping table used by database/migrate.js to know which .sql files in
-- this folder have already been applied to a given database, so re-running
-- `npm run migrate` (e.g. on every deploy) is idempotent instead of re-running
-- every file from scratch. Never edited by hand.
-- ============================================================================

create table if not exists schema_migrations (
  filename    text primary key,
  applied_at  timestamptz not null default now()
);
