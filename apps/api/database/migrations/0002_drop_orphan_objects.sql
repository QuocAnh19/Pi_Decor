-- ============================================================================
-- 0002_drop_orphan_objects.sql
-- Pi Decor — Dọn dẹp các view và bảng mồ côi không còn sử dụng trong hệ thống
-- ============================================================================
-- Thứ tự thực thi bảo đảm toàn vẹn phụ thuộc (không cần dùng CASCADE):
-- 1. admin_dashboard_summary (view truy vấn bảng designs)
-- 2. venues_with_project_count (view tiện ích không có consumer trong code)
-- 3. designs (dữ liệu snapshot nay nằm trực tiếp ở leads.design_snapshot)
-- 4. media_assets (không có route/service nào trong codebase sử dụng)
-- ============================================================================

-- 1. Xóa các view tiện ích mồ côi
drop view if exists admin_dashboard_summary;
drop view if exists venues_with_project_count;

-- 2. Xóa các bảng không còn sử dụng
drop table if exists designs;
drop table if exists media_assets;
