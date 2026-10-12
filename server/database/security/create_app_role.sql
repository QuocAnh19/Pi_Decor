-- ============================================================================
-- database/security/create_app_role.sql
-- ============================================================================
-- Creates a SECOND, low-privilege Postgres role for the running Express app,
-- separate from the role used to run migrations (which needs CREATE TABLE /
-- ALTER / DROP rights). The app itself only ever needs SELECT / INSERT /
-- UPDATE / DELETE on its 7 tables — nothing else — so it should never
-- connect using the same "owner" credentials migrate.js uses.
--
-- Why this file is NOT in database/migrations/:
--   migrate.js applies every file in that folder automatically and commits
--   its filename to schema_migrations. A file that embeds a password can't
--   safely be auto-run like that (the password would sit in plain text in
--   this repo). Run this one manually, once, by hand — see the steps below.
--
-- ── How to run ────────────────────────────────────────────────────────────
-- 1. Generate a strong password, e.g.:
--      node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
-- 2. Connect with the OWNER connection string (the one already in
--    DATABASE_URL / used by `npm run migrate`), e.g.:
--      psql "$DATABASE_URL"
-- 3. Inside psql, set the password as a variable so it never touches your
--    shell history or this file, then run this script:
--      \set app_password 'PASTE_THE_GENERATED_PASSWORD_HERE'
--      \i database/security/create_app_role.sql
-- 4. Build the runtime connection string with this role and put it in your
--    hosting platform's environment variables (Render/Vercel dashboard),
--    e.g.:
--      postgresql://pidecor_app:PASSWORD@<host>/<db>?sslmode=require
--    Use THIS string as DATABASE_URL for the deployed server. Keep the
--    original owner string only for running `npm run migrate` (locally or
--    in a one-off CI step) — never give the running API server owner
--    credentials.
-- ============================================================================

create role pidecor_app with login password :'app_password';

-- Only allow it to connect and use the public schema — nothing else.
grant connect on database current_database() to pidecor_app;
grant usage on schema public to pidecor_app;

-- No CREATE, no DROP, no ALTER. Exactly the four verbs the app needs, on
-- exactly the tables config/database.pg.js knows about — never
-- schema_migrations (migration history is not the app's business).
grant select, insert, update, delete
  on admins, leads, designs, materials, services, venues, projects,
     media_assets, lead_activities, quotations, testimonials,
     studio_templates, studio_slot_definitions, studio_assets, studio_slot_rules,
     refresh_tokens, quotation_counters
  to pidecor_app;

-- New tables added by a future migration are NOT automatically visible to
-- pidecor_app — this is deliberate (least privilege by default). After
-- adding a table in database/migrations/, add one more GRANT line here and
-- re-run this file (owner connection) to extend access.

-- Explicitly deny writing to the migration bookkeeping table and reading
-- the admins.password_hash column pattern-matching tools might otherwise
-- assume is open — belt-and-braces, since the GRANT list above already
-- doesn't mention schema_migrations.
revoke all on schema_migrations from pidecor_app;

-- Prevent the app role from creating objects in the public schema at all
-- (defense in depth against a compromised app connection trying to plant
-- a table/function).
revoke create on schema public from pidecor_app;

-- Belt-and-braces: make sure PUBLIC (i.e. "any role, by default") has no
-- standing access to these tables either. Neon/Supabase project defaults
-- are already reasonably locked down, but this makes the intent explicit
-- regardless of provider defaults.
revoke all on admins, leads, designs, materials, services, venues, projects,
  media_assets, lead_activities, quotations, testimonials,
  studio_templates, studio_slot_definitions, studio_assets, studio_slot_rules,
  refresh_tokens, quotation_counters
  from public;
