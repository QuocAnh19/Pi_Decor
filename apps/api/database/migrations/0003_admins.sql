-- ============================================================================
-- 0003_admins.sql
-- Pi Decor — Postgres schema, migration 3/11
-- ============================================================================
-- Backs: server/src/routes/auth/index.js (POST /api/auth/login)
--        server/src/utils/seed.js         (npm run seed creates the 1st row)
--
-- Scope note: this project supports admin and owner account roles.
-- There is no public customer login.
-- ============================================================================

create table if not exists admins (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  password_hash  text not null,          -- bcrypt hash, written by bcryptjs (Node)
  created_at     timestamptz not null default now()
);

comment on table admins is
  'Single-tenant admin account(s) for /admin/*. Password hashed with bcryptjs before insert — never store plaintext.';
