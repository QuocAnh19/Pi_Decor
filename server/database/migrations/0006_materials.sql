-- ============================================================================
-- 0006_materials.sql
-- Pi Decor — Postgres schema, migration 6/11
-- ============================================================================
-- Backs: server/src/routes/materials/index.js
--   GET    /api/materials      — public.
--   POST   /api/materials      — admin only, optional image upload.
--   PATCH  /api/materials/:id  — admin only.
--   DELETE /api/materials/:id  — admin only.
--
-- Scope note (PiDecor_AdminPanel.md §1): this table exists and its admin API
-- already works end-to-end, but there is currently no admin UI screen for
-- it — editing goes through server/src/utils/seed.js for now, since the
-- Studio builder's own swatches/shapes are still hardcoded client-side in
-- client/src/lib/studioBuilder/catalog.ts. Kept as a real table (not a
-- static JSON file) so the API is ready the moment a "Vật liệu" admin
-- screen gets built, without another migration.
-- ============================================================================

create table if not exists materials (
  id          uuid primary key default gen_random_uuid(),

  name        text not null,

  -- Free-text on purpose: seed.js currently only uses "fabric", but the
  -- Studio's own vocabulary (fabric / flowers / arch / lighting) may grow.
  -- Enforcing a CHECK here would mean a migration every time a new category
  -- is added from the admin UI — validate categories in the API layer
  -- instead, where the list can change without a schema change.
  category    text not null,

  color_hex   text,               -- e.g. "#E7B6BB" — swatch color, nullable for non-fabric items
  image_url   text,               -- Cloudinary URL (see utils/uploadImage.js) or null

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table materials is
  'Decor material catalog (fabric swatches, flower clusters, arches). Admin-editable replacement for the old static materials.json.';

create index if not exists idx_materials_category on materials (category);
