-- ============================================================================
-- 0013_lead_activities.sql
-- Pi Decor — Postgres schema, migration 13
-- ============================================================================
-- Backs: timeline activities for leads (status changes, notes, calls, emails,
--   quotations sent, designs saved).
--   Prompt 08 will add API routes to insert & query activities for a lead.
--   Prompt 15 will build the timeline UI in LeadDetailDrawer.tsx.
-- ============================================================================

create table if not exists lead_activities (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  admin_id      uuid references admins(id) on delete set null,
  activity_type text not null check (activity_type in
                  ('status_change','note','call','email',
                   'quotation_sent','design_saved')),
  body          text,
  metadata      jsonb,   -- e.g. {"from":"new","to":"contacted"}
  created_at    timestamptz not null default now()
);

comment on table lead_activities is
  'Timeline log of activities, status changes, and notes for leads.';

create index if not exists idx_lead_activities_lead_id on lead_activities (lead_id, created_at desc);

-- Trigger for status changes directly via SQL editor (note: routes will also insert explicitly in app code for JSON DB compatibility).
create or replace function log_lead_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status then
    insert into lead_activities (lead_id, activity_type, body, metadata)
    values (
      new.id,
      'status_change',
      concat('Trạng thái chuyển từ "', old.status, '" sang "', new.status, '"'),
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_lead_status_change on leads;
create trigger trg_lead_status_change
  after update on leads
  for each row execute function log_lead_status_change();
