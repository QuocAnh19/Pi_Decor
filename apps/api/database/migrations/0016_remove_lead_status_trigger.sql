-- ============================================================================
-- 0016_remove_lead_status_trigger.sql
-- Pi Decor — Postgres schema, migration 16
-- ============================================================================
-- Drops the database trigger trg_lead_status_change. Status changes are logged
-- explicitly by Express API routes with the logged-in admin's admin_id. Removing
-- this trigger prevents duplicate activity logging (1 with admin_id, 1 without).
-- ============================================================================

drop trigger if exists trg_lead_status_change on leads;
drop function if exists log_lead_status_change();
