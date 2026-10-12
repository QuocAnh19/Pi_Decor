-- ============================================================================
-- 0025_admins_role.sql
-- Pi Decor — Postgres schema, migration 25
-- ============================================================================
-- Adds role column to admins table with constraint ('owner', 'admin').
-- ============================================================================

alter table admins add column if not exists role text not null default 'admin';

do $$
begin
  alter table admins add constraint admins_role_check check (role in ('owner', 'admin'));
exception
  when duplicate_object then null;
end $$;
