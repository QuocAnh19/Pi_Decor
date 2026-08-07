-- ============================================================================
-- 0010_updated_at_trigger.sql
-- Pi Decor — Postgres schema, migration 10/11
-- ============================================================================
-- One generic trigger function, attached to every table that has an
-- `updated_at` column, so PATCH requests never need to remember to set it
-- by hand — and it stays correct even for updates issued directly in the
-- SQL editor. (leads/designs are append-mostly and intentionally have no
-- updated_at: a lead's history is its status changes, not a "last edited"
-- timestamp.)
-- ============================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_materials_updated_at on materials;
create trigger trg_materials_updated_at
  before update on materials
  for each row execute function set_updated_at();

drop trigger if exists trg_services_updated_at on services;
create trigger trg_services_updated_at
  before update on services
  for each row execute function set_updated_at();

drop trigger if exists trg_venues_updated_at on venues;
create trigger trg_venues_updated_at
  before update on venues
  for each row execute function set_updated_at();

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();
