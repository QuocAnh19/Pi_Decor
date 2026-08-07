-- ============================================================================
-- 0007_services.sql
-- Pi Decor — Postgres schema, migration 7/11
-- ============================================================================
-- Backs: server/src/routes/services/index.js
--   GET    /api/services      — public, feeds the Bento Services grid.
--   POST   /api/services      — admin only.
--   PATCH  /api/services/:id  — admin only.
--   DELETE /api/services/:id  — admin only.
--
-- "order" is a reserved SQL keyword, so it is always double-quoted below and
-- in every query the app sends — see the quoteCol() helper in
-- src/config/database.pg.js.
-- ============================================================================

create table if not exists services (
  id           uuid primary key default gen_random_uuid(),

  title        text not null,
  description  text not null default '',
  image_url    text,
  "order"      integer not null default 0,   -- Bento grid display order, ascending

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table services is
  'Bento Services grid content (Interactive Studio, Wedding Decor, ...). Admin-editable replacement for the old static services.json.';

create index if not exists idx_services_order on services ("order");
