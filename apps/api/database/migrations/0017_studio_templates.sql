-- ============================================================================
-- 0017_studio_templates.sql
-- Pi Decor — Postgres schema, migration 17
-- ============================================================================
-- Backs: Studio interactive builder templates, slot definitions, assets, and rules.
--   Maps 1-to-1 with client/src/features/studio/types/index.ts:
--     - studio_templates (Template)
--     - studio_slot_definitions (SlotDefinition)
--     - studio_assets (Asset)
--     - studio_slot_rules (SlotRule)
--   Prompt 11 will add API routes to CRUD templates and catalog assets.
--   Prompt 18 will wire the Studio builder UI to this DB storage.
--   Note: Deleting a template cascades to its slot definitions & rules,
--         but does NOT delete studio_assets (assets are shared resources).
-- ============================================================================

create table if not exists studio_templates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  thumbnail       text,
  svg_base        text not null,   -- SVG string 800x600, sanitized before storing
  category        text,
  is_active       boolean not null default true,
  default_config  jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table studio_templates add column if not exists default_config jsonb not null default '{}';

comment on table studio_templates is
  'Studio canvas background templates.';

create table if not exists studio_slot_definitions (
  id            uuid primary key default gen_random_uuid(),
  template_id   uuid not null references studio_templates(id) on delete cascade,
  slot_key      text not null,          -- e.g. "drape-main", "flower-left"
  label         text not null,
  slot_type     text not null check (slot_type in
                  ('drape','drape_detail','flower','text_name',
                   'text_date','color_accent','prop')),
  norm_x        numeric not null,       -- 0.0-1.0 normalized position
  norm_y        numeric not null,
  norm_width    numeric,
  norm_height   numeric,
  allow_scale   boolean not null default true,
  allow_rotate  boolean not null default false,
  mirror_x      boolean not null default false,
  z_index       int not null default 0,
  sort_order    int not null default 0,
  required      boolean not null default false,
  unique (template_id, slot_key)
);

comment on table studio_slot_definitions is
  'Slot position and rule definitions for studio templates.';

create table if not exists studio_assets (
  id               uuid primary key default gen_random_uuid(),
  asset_type       text not null check (asset_type in
                     ('drape','drape_detail','flower','text_name',
                      'text_date','color_accent','prop')),
  name             text not null,
  thumbnail        text,
  svg_data         text,     -- Sanitized SVG data
  color_hex        text,
  font_family      text,
  tags             jsonb not null default '[]',
  is_active        boolean not null default true,
  dominant_colors  jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table studio_assets is
  'Shared asset catalog (fabrics, flowers, arches, props) usable across templates.';

create table if not exists studio_slot_rules (
  id               uuid primary key default gen_random_uuid(),
  template_id      uuid not null references studio_templates(id) on delete cascade,
  rule_name        text,
  condition_slot   text not null,
  condition_value  jsonb not null,   -- e.g. { "asset_tag": "do-do" }
  target_slot      text not null,
  action           text not null check (action in
                     ('force_asset','restrict_assets','hide_slot')),
  action_value     jsonb,
  priority         int not null default 0
);

comment on table studio_slot_rules is
  'Conditional logic rules between slots in a studio template.';

create index if not exists idx_studio_slots_template on studio_slot_definitions (template_id, sort_order);
create index if not exists idx_studio_rules_template on studio_slot_rules (template_id, priority);

drop trigger if exists trg_studio_templates_updated_at on studio_templates;
create trigger trg_studio_templates_updated_at
  before update on studio_templates
  for each row execute function set_updated_at();

drop trigger if exists trg_studio_assets_updated_at on studio_assets;
create trigger trg_studio_assets_updated_at
  before update on studio_assets
  for each row execute function set_updated_at();
