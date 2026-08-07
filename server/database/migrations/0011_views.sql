-- ============================================================================
-- 0011_views.sql
-- Pi Decor — Postgres schema, migration 11/11
-- ============================================================================
-- Read-only convenience views. Nothing in the Express app queries these
-- directly today (the current routes compute the same numbers in
-- JavaScript after a SELECT * — see withProjectCount() in
-- routes/venues/index.js and the Promise.all() in routes/admin/index.js),
-- so this migration changes no application behaviour. They exist for:
--   - ad-hoc queries in the Supabase/Neon SQL editor while debugging,
--   - a future admin_summary / venues route rewritten to push aggregation
--     into Postgres instead of loading full tables into Node,
--   - BI/reporting tools connected read-only to the database later.
-- ============================================================================

-- Mirrors withProjectCount() in routes/venues/index.js: each venue with the
-- count of its *published* projects only.
create or replace view venues_with_project_count as
select
  v.*,
  count(p.id) filter (where p.published) as project_count
from venues v
left join projects p on p.venue_id = v.id
group by v.id;

comment on view venues_with_project_count is
  'venues + published project_count, computed in SQL. Equivalent to withProjectCount() in routes/venues/index.js.';

-- Mirrors GET /api/admin/summary.
create or replace view admin_dashboard_summary as
select
  (select count(*) from leads)                          as leads_total,
  (select count(*) from leads where status = 'new')      as leads_new,
  (select count(*) from designs)                         as designs_total,
  (select count(*) from materials)                       as materials_total,
  (select count(*) from services)                        as services_total,
  (select count(*) from venues)                          as venues_total,
  (select count(*) from projects where published)        as projects_published_total;

comment on view admin_dashboard_summary is
  'Single-row dashboard counters. Equivalent to GET /api/admin/summary.';
