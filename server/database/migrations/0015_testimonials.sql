-- ============================================================================
-- 0015_testimonials.sql
-- Pi Decor — Postgres schema, migration 15
-- ============================================================================
-- Backs: customer reviews and testimonials (author, role, quote, rating, photos jsonb,
--   status: pending/approved/rejected, source: customer/admin_seed).
--   Prompt 10 will add API routes to CRUD testimonials & admin moderation.
--   Prompt 17 will wire Testimonials.tsx and admin moderation UI.
--   Note: INITIAL_TESTIMONIALS/testimonials from content.ts will be seeded in seed.js
--   with source = 'admin_seed' and status = 'approved'.
-- ============================================================================

create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete set null,
  author      text not null,
  role        text,
  quote       text not null,
  rating      int not null default 5 check (rating between 1 and 5),
  photos      jsonb not null default '[]',   -- array of photo URLs
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  source      text not null default 'customer'
              check (source in ('customer','admin_seed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table testimonials is
  'Customer testimonials and reviews with moderation status.';

create index if not exists idx_testimonials_status on testimonials (status, created_at desc);

drop trigger if exists trg_testimonials_updated_at on testimonials;
create trigger trg_testimonials_updated_at
  before update on testimonials
  for each row execute function set_updated_at();
