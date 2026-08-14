-- ============================================================================
-- 0020_update_services_schema.sql
-- Update services table schema to match real Pi Decor brand lines (PiWedding, PiKids, PiEvent)
-- ============================================================================

alter table services add column if not exists brand text;
alter table services add column if not exists tagline text;
alter table services add column if not exists icon text;
alter table services add column if not exists accent text;
alter table services add column if not exists items jsonb not null default '[]';
alter table services add column if not exists href text;
alter table services add column if not exists cta_label text;
alter table services add column if not exists featured boolean not null default false;
alter table services add column if not exists cover text;
