-- ============================================================================
-- 0001_extensions.sql
-- Pi Decor — Postgres schema, migration 1/11
-- ============================================================================
-- Enables the extensions every later migration depends on.
--
--   pgcrypto  -> gen_random_uuid(), used as the DEFAULT for every primary key.
--               (The app itself already generates a uuid v4 in Node with the
--               `uuid` package before INSERT, so this default mostly matters
--               as a safety net for rows inserted by hand in the SQL editor,
--               or later if a raw-SQL admin tool is added.)
--
-- Safe to run repeatedly (IF NOT EXISTS). Run this once per database
-- (per Neon project / per Supabase project), before 0002.
-- ============================================================================

create extension if not exists "pgcrypto";
