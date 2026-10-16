-- ============================================================================
-- 0012_media_assets.sql
-- Pi Decor — Postgres schema, migration 12
-- ============================================================================
-- Backs: media assets tracking for uploads across the platform
--   (materials, testimonials, studio_assets, studio_templates, projects, venues).
--   Prompt 19 will wire up Cloudinary upload routes to write to this table.
--   Currently no active route uses this table yet — added ahead of Cloudinary migration.
-- ============================================================================

create table if not exists media_assets (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in
                ('materials','testimonials','studio_assets',
                 'studio_templates','projects','venues')),
  entity_id   uuid,              -- nullable: cho phép upload-trước-rồi-gán-sau
  url         text not null,
  provider    text not null default 'local' check (provider in ('local','cloudinary')),
  public_id   text,              -- id Cloudinary, dùng để xoá sau này
  width       int,
  height      int,
  format      text,
  bytes       int,
  created_at  timestamptz not null default now()
);

comment on table media_assets is
  'Tracks uploaded images/assets across materials, testimonials, studio, projects, and venues for Cloudinary management.';

create index if not exists idx_media_assets_entity on media_assets (entity_type, entity_id);
