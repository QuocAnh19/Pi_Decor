-- ============================================================================
-- 0005_designs.sql
-- Pi Decor — Postgres schema, migration 5/11
-- ============================================================================
-- Backs: server/src/routes/designs/index.js
--   POST /api/designs         — save a full Konva layer set, tied to a lead.
--   GET  /api/designs/:leadId — reload every saved design for that lead.
--
-- Cho phép lưu và tải lại trạng thái thiết kế thay vì chỉ xuất một lần.
-- ============================================================================

create table if not exists designs (
  id             uuid primary key default gen_random_uuid(),

  -- A design always belongs to a lead in this codebase (designsRouter
  -- rejects the request if lead_id is missing). If a customer's lead is
  -- later deleted, delete their saved designs with it rather than leaving
  -- orphaned rows.
  lead_id        uuid not null references leads (id) on delete cascade,

  -- Array of layer objects from the Zustand store
  -- (useWorkspaceStore: { id, type, x, y, rotation, color, ... }[]).
  layers         jsonb not null,

  thumbnail_url  text,

  created_at     timestamptz not null default now()
);

comment on table designs is
  'Saved Konva canvas snapshots (Interactive Workspace), one row per save, many per lead. layers is the full Zustand layer array.';

-- GET /api/designs/:leadId always filters by lead_id.
create index if not exists idx_designs_lead_id on designs (lead_id);
