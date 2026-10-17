-- ============================================================================
-- 0001_baseline.sql — Pi Decor Baseline Migration (gộp từ 0001–0029)
-- ============================================================================
-- 1. EXTENSIONS
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
-- 2. TRIGGER FUNCTIONS
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
-- 3. TABLES & CONSTRAINTS
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin', 'owner')),
  created_at timestamptz not null default now()
);
comment on table admins is 'Single-tenant admin account(s) for /admin/*. Password hashed with bcryptjs before insert — never store plaintext.';
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  wedding_date date,
  message text,
  design_snapshot jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  consent_at timestamptz,
  consent_version text
);
comment on table leads is 'One row per customer contact — Footer form or Studio export. status matches the 3-state flow: new / contacted / closed.';
comment on column leads.design_snapshot is 'BuilderState JSON captured client-side at submit time; NOT the same as designs.layers (that is the Konva canvas state for the older Interactive Workspace flow).';
comment on column leads.consent_at is 'Thời điểm người dùng xác nhận đồng ý xử lý dữ liệu cá nhân';
comment on column leads.consent_version is 'Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý';
create table if not exists designs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  layers jsonb not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);
comment on table designs is 'Saved Konva canvas snapshots (Interactive Workspace), one row per save, many per lead. layers is the full Zustand layer array.';
create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('fabric', 'flower', 'flowers', 'arch', 'prop', 'lighting', 'drape_detail', 'text_name')),
  color_hex text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table materials is 'Decor material catalog (fabric swatches, flower clusters, arches). Admin-editable replacement for the old static materials.json.';
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text,
  "order" int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  brand text, tagline text, icon text, accent text,
  items jsonb not null default '[]'::jsonb,
  href text, cta_label text,
  featured boolean not null default false,
  cover text
);
comment on table services is 'Bento Services grid content (Interactive Studio, Wedding Decor, ...). Admin-editable replacement for the old static services.json.';
create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'hotel' check (type in ('hotel', 'restaurant', 'resort', 'sảnh tiệc')),
  address text, city text,
  lat double precision not null,
  lng double precision not null,
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table venues is 'Physical locations pinned on the project map (client/src/components/map). One venue can host many projects (case studies).';
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id) on delete cascade,
  title text not null,
  wedding_date date,
  style_tags text[] not null default '{}'::text[],
  cover_image text,
  gallery jsonb not null default '[]'::jsonb,
  lead_id uuid references leads(id) on delete set null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  location text, description text, budget text, status text default 'active',
  category_id text, tag text,
  price_tier text not null default 'standard' check (price_tier in ('standard', 'premium', 'luxury'))
);
comment on table projects is 'Case studies (finished weddings) nested under a venue. published=false hides a project from the public map/gallery while still being editable in /admin.';
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('material', 'testimonial', 'studio_asset', 'studio_template', 'project', 'venue')),
  entity_id uuid,
  url text not null,
  provider text not null default 'local' check (provider in ('cloudinary', 'local')),
  public_id text, width int, height int, format text, bytes int,
  created_at timestamptz not null default now()
);
comment on table media_assets is 'Tracks uploaded images/assets across materials, testimonials, studio, projects, and venues for Cloudinary management.';
create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  admin_id uuid references admins(id) on delete set null,
  activity_type text not null check (activity_type in ('status_change', 'note', 'quotation_sent', 'call_logged', 'system', 'call', 'email', 'design_saved')),
  body text, metadata jsonb,
  created_at timestamptz not null default now()
);
comment on table lead_activities is 'Timeline log of activities, status changes, and notes for leads.';
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  admin_id uuid references admins(id) on delete set null,
  quotation_number text not null unique,
  items jsonb not null default '[]'::jsonb,
  subtotal int not null default 0,
  discount int not null default 0,
  total int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected', 'declined', 'expired')),
  valid_until date, notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table quotations is 'Quotation records generated by admin for leads.';
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  author text not null,
  role text,
  quote text not null,
  rating int not null default 5 check (rating >= 1 and rating <= 5),
  photos jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  source text not null default 'customer' check (source in ('customer', 'admin_seed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  consent_at timestamptz, consent_version text
);
comment on table testimonials is 'Customer testimonials and reviews with moderation status.';
comment on column testimonials.consent_at is 'Thời điểm người gửi đánh giá xác nhận đồng ý xử lý dữ liệu';
comment on column testimonials.consent_version is 'Phiên bản điều khoản chính sách bảo mật tại thời điểm đồng ý';
create table if not exists studio_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  thumbnail text,
  svg_base text not null,
  category text,
  is_active boolean not null default true,
  default_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table studio_templates is 'Studio canvas background templates.';

create table if not exists studio_slot_definitions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references studio_templates(id) on delete cascade,
  slot_key text not null,
  label text not null,
  slot_type text not null check (slot_type in ('drape', 'drape_detail', 'flower', 'text_name', 'text_date', 'color_accent', 'prop')),
  norm_x numeric not null,
  norm_y numeric not null,
  norm_width numeric,
  norm_height numeric,
  allow_scale boolean not null default true,
  allow_rotate boolean not null default false,
  mirror_x boolean not null default false,
  z_index int not null default 0,
  sort_order int not null default 0,
  required boolean not null default false,
  unique (template_id, slot_key)
);
comment on table studio_slot_definitions is 'Slot position and rule definitions for studio templates.';

create table if not exists studio_assets (
  id uuid primary key default gen_random_uuid(),
  asset_type text not null check (asset_type in ('drape', 'drape_detail', 'flower', 'font', 'color', 'prop')),
  name text not null,
  thumbnail text, svg_data text, color_hex text, font_family text,
  tags jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  dominant_colors jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table studio_assets is 'Shared asset catalog (fabrics, flowers, arches, props) usable across templates.';

create table if not exists studio_slot_rules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references studio_templates(id) on delete cascade,
  rule_name text,
  condition_slot text not null,
  condition_value jsonb not null,
  target_slot text not null,
  action text not null check (action in ('force_asset', 'restrict_assets', 'hide_slot')),
  action_value jsonb,
  priority int not null default 0
);
comment on table studio_slot_rules is 'Conditional logic rules between slots in a studio template.';

create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  family_id uuid,
  replaced_by text
);

create table if not exists quotation_counters (
  year int primary key,
  last_seq int not null default 0
);
comment on table quotation_counters is 'Atomic year-based sequence counters for quotation numbers.';

-- 4. TRIGGERS
create trigger trg_materials_updated_at before update on materials for each row execute function set_updated_at();
create trigger trg_services_updated_at before update on services for each row execute function set_updated_at();
create trigger trg_venues_updated_at before update on venues for each row execute function set_updated_at();
create trigger trg_projects_updated_at before update on projects for each row execute function set_updated_at();
create trigger trg_quotations_updated_at before update on quotations for each row execute function set_updated_at();
create trigger trg_testimonials_updated_at before update on testimonials for each row execute function set_updated_at();
create trigger trg_studio_templates_updated_at before update on studio_templates for each row execute function set_updated_at();
create trigger trg_studio_assets_updated_at before update on studio_assets for each row execute function set_updated_at();

-- 5. INDEXES
create index if not exists idx_designs_lead_id on designs (lead_id);
create index if not exists idx_lead_activities_lead_id on lead_activities (lead_id, created_at desc);
create index if not exists idx_leads_created_at on leads (created_at desc);
create index if not exists idx_leads_phone on leads (phone);
create index if not exists idx_leads_status on leads (status);
create index if not exists idx_leads_email_trgm on leads using gin (email gin_trgm_ops);
create index if not exists idx_leads_name_trgm on leads using gin (name gin_trgm_ops);
create index if not exists idx_leads_phone_trgm on leads using gin (phone gin_trgm_ops);
create index if not exists idx_materials_category on materials (category);
create index if not exists idx_materials_category_created_at on materials (category, created_at);
create index if not exists idx_media_assets_entity on media_assets (entity_type, entity_id);
create index if not exists idx_projects_category_id on projects (category_id);
create index if not exists idx_projects_lead_id on projects (lead_id) where (lead_id is not null);
create index if not exists idx_projects_price_tier on projects (price_tier);
create index if not exists idx_projects_published_created_at on projects (published, created_at desc);
create index if not exists idx_projects_status on projects (status);
create index if not exists idx_projects_style_tags_gin on projects using gin (style_tags);
create index if not exists idx_projects_venue_id on projects (venue_id);
create index if not exists idx_projects_venue_published on projects (venue_id, published);
create index if not exists idx_quotations_lead_id on quotations (lead_id, created_at desc);
create index if not exists idx_refresh_tokens_admin on refresh_tokens (admin_id);
create index if not exists idx_refresh_tokens_family on refresh_tokens (family_id);
create index if not exists idx_refresh_tokens_token_hash on refresh_tokens (token_hash);
create index if not exists idx_services_order on services ("order");
create index if not exists idx_studio_assets_active_created_at on studio_assets (is_active, created_at desc);
create unique index if not exists idx_studio_assets_unique_type_name on studio_assets (asset_type, name);
create index if not exists idx_studio_slots_template on studio_slot_definitions (template_id, sort_order);
create index if not exists idx_studio_rules_template on studio_slot_rules (template_id, priority);
create index if not exists idx_studio_templates_active_created_at on studio_templates (is_active, created_at desc);
create index if not exists idx_testimonials_status on testimonials (status, created_at desc);
create index if not exists idx_venues_address_trgm on venues using gin (address gin_trgm_ops);
create index if not exists idx_venues_city on venues (city);
create index if not exists idx_venues_city_trgm on venues using gin (city gin_trgm_ops);
create index if not exists idx_venues_name_trgm on venues using gin (name gin_trgm_ops);

-- 6. VIEWS & 7. DML
create or replace view venues_with_project_count as
select v.*, count(p.id) filter (where p.published) as project_count
from venues v left join projects p on p.venue_id = v.id group by v.id;
comment on view venues_with_project_count is 'venues + published project_count, computed in SQL. Equivalent to withProjectCount() in routes/venues/index.js.';
create or replace view admin_dashboard_summary as
select
  (select count(*) from leads) as leads_total,
  (select count(*) from leads where status = 'new') as leads_new,
  (select count(*) from designs) as designs_total,
  (select count(*) from materials) as materials_total,
  (select count(*) from services) as services_total,
  (select count(*) from venues) as venues_total,
  (select count(*) from projects where published) as projects_published_total;
comment on view admin_dashboard_summary is 'Single-row dashboard counters. Equivalent to GET /api/admin/summary.';
insert into quotation_counters (year, last_seq)
select
  split_part(quotation_number, '-', 2)::int as year,
  max(split_part(quotation_number, '-', 3)::int) as last_seq
from quotations where quotation_number ~ '^BG-[0-9]{4}-[0-9]+$'
group by split_part(quotation_number, '-', 2)::int
on conflict (year) do update
set last_seq = greatest(quotation_counters.last_seq, excluded.last_seq);