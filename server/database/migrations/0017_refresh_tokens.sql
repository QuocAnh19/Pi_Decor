-- 0017_refresh_tokens.sql — Refresh tokens for admin sessions

create table if not exists refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid not null references admins(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_admin on refresh_tokens (admin_id);
