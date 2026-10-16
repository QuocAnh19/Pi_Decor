-- ============================================================================
-- 0008_venues.sql
-- Pi Decor — Postgres schema, migration 8/11
-- ============================================================================
-- Backs: server/src/routes/venues/index.js
--   GET    /api/venues                — public, map pins + homepage teaser.
--   GET    /api/venues/search?q=      — public, autocomplete.
--   GET    /api/venues/:id            — public, detail + published projects.
--   POST   /api/venues                — admin only (M1: manual lat/lng).
--   PATCH  /api/venues/:id            — admin only.
--   DELETE /api/venues/:id            — admin only.
--
-- pg_trgm powers fast ILIKE '%...%' search on name/city/address. The current
-- /search route still filters in application code after a full SELECT *
-- (fine at this data volume — a handful of venues); these indexes are ready
-- for the day that route is rewritten to push the WHERE clause into
-- Postgres instead (`WHERE name ILIKE '%'||$1||'%' ...`).
-- ============================================================================

create extension if not exists pg_trgm;

create table if not exists venues (
  id           uuid primary key default gen_random_uuid(),

  name         text not null,
  type         text not null default 'hotel',
  address      text,
  city         text,

  -- double precision (not numeric) so node-postgres returns a plain JS
  -- number for req/res JSON — numeric would come back as a string and
  -- silently break `Number(lat)` comparisons / Leaflet's LatLngExpression
  -- on the client.
  lat          double precision not null,
  lng          double precision not null,

  cover_image  text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint venues_type_check
    check (type in ('hotel', 'restaurant', 'resort', 'sảnh tiệc'))
);

comment on table venues is
  'Physical locations pinned on the project map (client/src/components/map). One venue can host many projects (case studies).';

create index if not exists idx_venues_city         on venues (city);
create index if not exists idx_venues_name_trgm     on venues using gin (name gin_trgm_ops);
create index if not exists idx_venues_city_trgm     on venues using gin (city gin_trgm_ops);
create index if not exists idx_venues_address_trgm  on venues using gin (address gin_trgm_ops);
