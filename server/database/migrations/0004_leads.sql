-- ============================================================================
-- 0004_leads.sql
-- Pi Decor — Postgres schema, migration 4/11
-- ============================================================================
-- Backs: server/src/routes/leads/index.js
--   POST  /api/leads        — public, called by Footer LeadForm AND by the
--                              Studio "Lưu thiết kế" / export flow.
--   GET   /api/leads        — admin only, list newest-first.
--   PATCH /api/leads/:id    — admin only, change status.
--
-- Replaces the "ghi chú tự do" (free-form note) gap called out in Mục
-- 1.1(d)/3.2 of PiDecor_PhanTich_DeXuat_KyThuat.docx: every customer
-- request is now one structured row instead of a Zalo message or a sticky
-- note.
-- ============================================================================

create table if not exists leads (
  id                uuid primary key default gen_random_uuid(),

  name              text not null,
  phone             text not null,
  email             text,
  wedding_date      date,
  message           text,

  -- Snapshot of the Studio builder state (BuilderState in
  -- client/src/lib/studioBuilder/types.ts: baseFabric, valance, flowers,
  -- details) at the moment the customer submitted the form. jsonb (not
  -- json) so it can be indexed/queried later if needed, e.g. "how many
  -- leads picked the wine-red fabric".
  design_snapshot   jsonb,

  status            text not null default 'new',

  created_at        timestamptz not null default now(),

  constraint leads_status_check
    check (status in ('new', 'contacted', 'closed'))
);

comment on table leads is
  'One row per customer contact — Footer form or Studio export. status matches the 3-state flow in PiDecor_AdminPanel.md §4 (Mới / Đã liên hệ / Đã chốt).';
comment on column leads.design_snapshot is
  'BuilderState JSON captured client-side at submit time; NOT the same as designs.layers (that is the Konva canvas state for the older Interactive Workspace flow).';

-- Admin dashboard lists newest-first and filters by status constantly
-- (GET /api/leads sorts by created_at desc; /api/admin/summary counts
-- status = 'new').
create index if not exists idx_leads_created_at on leads (created_at desc);
create index if not exists idx_leads_status     on leads (status);

-- Look up a customer's past submissions by phone number (support/sales use
-- case: "khách này đã gửi bao nhiêu lần rồi?").
create index if not exists idx_leads_phone on leads (phone);
