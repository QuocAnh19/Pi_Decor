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
-- Scope note: bảng lưu danh mục vật liệu trang trí phục vụ API công khai
-- và quản trị trong admin.
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
