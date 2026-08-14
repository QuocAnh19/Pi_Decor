-- ============================================================================
-- 0021_studio_assets_unique_name.sql
-- Pi Decor — Postgres schema, migration 21
-- ============================================================================
-- Clean up duplicate rows in studio_assets and add unique index on (asset_type, name)
-- ============================================================================

DELETE FROM studio_assets a USING studio_assets b WHERE a.id > b.id AND a.name = b.name AND a.asset_type = b.asset_type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_assets_unique_type_name ON studio_assets (asset_type, name);
