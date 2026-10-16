-- ============================================================================
-- 0009_projects.sql
-- Pi Decor — Postgres schema, migration 9/11
-- ============================================================================
-- Backs: server/src/routes/venues/index.js
--   POST   /api/venues/:id/projects           — admin only, add a case study.
--   PATCH  /api/venues/projects/:projectId    — admin only.
--   DELETE /api/venues/projects/:projectId    — admin only.
--
-- A "project" is one real wedding already decorated at a given venue —
-- the case-study gallery shown when a map pin is clicked.
-- ============================================================================

create table if not exists projects (
  id            uuid primary key default gen_random_uuid(),

  venue_id      uuid not null references venues (id) on delete cascade,

  title         text not null,
  wedding_date  date,

  -- Native Postgres array, not jsonb: tags are always plain strings
  -- ("romantic", "pastel", "vintage", ...) and this lets `style_tags &&
  -- ARRAY['pastel']` filtering be added later without touching the schema.
  style_tags    text[] not null default '{}',

  cover_image   text,
  gallery       jsonb not null default '[]',   -- array of image URLs

  -- Optional link back to the customer whose Studio session became this
  -- real installation, so the admin "design_snapshot" view can trace a
  -- finished project back to the original lead. Nullable: most seeded/past
  -- projects predate the lead-capture flow and won't have one.
  lead_id       uuid references leads (id) on delete set null,

  published     boolean not null default true,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table projects is
  'Case studies (finished weddings) nested under a venue. published=false hides a project from the public map/gallery while still being editable in /admin.';

-- GET /api/venues/:id filters "projects where venue_id = ? and published".
create index if not exists idx_projects_venue_id           on projects (venue_id);
create index if not exists idx_projects_venue_published     on projects (venue_id, published);
create index if not exists idx_projects_style_tags_gin       on projects using gin (style_tags);
create index if not exists idx_projects_lead_id             on projects (lead_id) where lead_id is not null;
