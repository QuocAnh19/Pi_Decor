-- ============================================================================
-- 0003_align_domain_constraints.sql
-- Pi Decor — Cập nhật các ràng buộc check constraint bảng dữ liệu
-- ============================================================================

-- 1. Mở rộng ràng buộc lead_activities.activity_type
alter table lead_activities drop constraint if exists lead_activities_activity_type_check;
alter table lead_activities add constraint lead_activities_activity_type_check check (
  activity_type in ('status_change', 'note', 'quotation_sent', 'call_logged', 'system', 'call', 'email', 'design_saved')
);

-- 2. Mở rộng ràng buộc materials.category
alter table materials drop constraint if exists materials_category_check;
alter table materials add constraint materials_category_check check (
  category in ('fabric', 'flower', 'flowers', 'arch', 'prop', 'lighting', 'drape_detail', 'text_name')
);

-- 3. Mở rộng ràng buộc quotations.status (bổ sung declined)
alter table quotations drop constraint if exists quotations_status_check;
alter table quotations add constraint quotations_status_check check (
  status in ('draft', 'sent', 'accepted', 'rejected', 'declined', 'expired')
);
