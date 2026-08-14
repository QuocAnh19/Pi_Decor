-- ============================================================================
-- 0018_make_venue_id_nullable_in_projects.sql
-- Pi Decor — Postgres schema, migration 18
-- ============================================================================
-- Makes venue_id nullable in projects table so projects (e.g. Gia Tiên tại gia,
-- private home events, Lookbook items) can be saved into Postgres without requiring a venue.
-- ============================================================================

alter table projects alter column venue_id drop not null;
