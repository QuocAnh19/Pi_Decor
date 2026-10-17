-- ============================================================================
-- database/security/create_app_role.sql
-- ============================================================================
-- Tạo role thứ hai với quyền tối thiểu (least privilege) cho Express app,
-- tách biệt với role owner dùng để chạy migrations (cần quyền DDL CREATE/ALTER/DROP).
-- Express runtime chỉ cần SELECT / INSERT / UPDATE / DELETE trên 15 bảng nghiệp vụ.
--
-- ── Lưu ý đặc biệt khi sử dụng trên Neon Postgres ───────────────────────────
-- Trên Neon, các role và user được quản lý tập trung thông qua Neon Console
-- hoặc Neon CLI (người dùng không có quyền superuser trực tiếp để CREATE ROLE).
-- 1. Vào Neon Console -> Project -> Roles/Users -> "Create Role" (ví dụ: pidecor_app).
-- 2. Đặt mật khẩu và tạo connection string riêng cho pidecor_app.
-- 3. Đăng nhập bằng role owner (neondb_owner) qua Neon SQL Editor hoặc psql.
-- 4. Bỏ qua lệnh CREATE ROLE bên dưới và chạy phần GRANT / REVOKE.
-- ────────────────────────────────────────────────────────────────────────────

-- 1. Tạo role (chỉ áp dụng cho Postgres tự host hoặc local Docker)
-- Trên Neon: tạo role qua Neon Console, sau đó comment dòng này.
do $$
begin
  if not exists (select from pg_roles where rolname = 'pidecor_app') then
    create role pidecor_app with login password :'app_password';
  end if;
end
$$;

-- 2. Cấp quyền kết nối và sử dụng schema public
grant connect on database current_database() to pidecor_app;
grant usage on schema public to pidecor_app;

-- 3. Cấp quyền DML trên toàn bộ 15 bảng nghiệp vụ
grant select, insert, update, delete
  on admins, leads, materials, services, venues, projects,
     lead_activities, quotations, testimonials,
     studio_templates, studio_slot_definitions, studio_assets, studio_slot_rules,
     refresh_tokens, quotation_counters
  to pidecor_app;

-- 4. Thu hồi quyền trên bảng migration bookkeeping
revoke all on schema_migrations from pidecor_app;

-- 5. Ngăn chặn quyền tạo mới đối tượng trên schema public
revoke create on schema public from pidecor_app;

-- 6. Thu hồi quyền từ role PUBLIC mặc định để đảm bảo bảo mật nhiều tầng
revoke all on admins, leads, materials, services, venues, projects,
  lead_activities, quotations, testimonials,
  studio_templates, studio_slot_definitions, studio_assets, studio_slot_rules,
  refresh_tokens, quotation_counters
  from public;
