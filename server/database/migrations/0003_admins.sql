-- ============================================================================
-- 0003_admins.sql
-- Pi Decor — Postgres schema, migration 3/11
-- ============================================================================
-- Backs: server/src/routes/auth/index.js (POST /api/auth/login)
--        server/src/utils/seed.js         (npm run seed creates the 1st row)
--
-- Scope note (see PiDecor_AdminPanel.md §2): this project has exactly ONE
-- account type — the shop owner. There is no public customer login, so this
-- table is intentionally tiny. If a second admin/sales-staff role is ever
-- needed, add a `role text not null default 'admin'` column then instead of
-- redesigning the table.
-- ============================================================================

create table if not exists admins (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  password_hash  text not null,          -- bcrypt hash, written by bcryptjs (Node)
  created_at     timestamptz not null default now()
);

comment on table admins is
  'Single-tenant admin account(s) for /admin/*. Password hashed with bcryptjs before insert — never store plaintext.';
