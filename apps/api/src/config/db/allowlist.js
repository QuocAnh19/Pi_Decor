// ── Column allowlist per table ──────────────────────────────────────────
// Every INSERT/UPDATE is built exclusively from these lists, so a request
// body can never inject an arbitrary column name — only values are
// parameterized ($1, $2, ...), and only known column names are ever
// concatenated into SQL text. Keep this in sync with database/migrations/.
export const TABLES = {
  admins: ["id", "email", "password_hash", "role", "created_at"],
  leads: [
    "id",
    "name",
    "phone",
    "email",
    "wedding_date",
    "message",
    "design_snapshot",
    "status",
    "created_at",
  ],
  materials: ["id", "name", "category", "color_hex", "image_url", "created_at", "updated_at"],
  services: [
    "id",
    "brand",
    "title",
    "tagline",
    "description",
    "icon",
    "accent",
    "items",
    "href",
    "cta_label",
    "featured",
    "cover",
    "order",
    "image_url",
    "created_at",
    "updated_at",
  ],
  venues: [
    "id",
    "name",
    "type",
    "address",
    "city",
    "lat",
    "lng",
    "cover_image",
    "created_at",
    "updated_at",
  ],
  projects: [
    "id",
    "venue_id",
    "title",
    "wedding_date",
    "style_tags",
    "cover_image",
    "gallery",
    "lead_id",
    "published",
    "created_at",
    "updated_at",
    "location",
    "description",
    "budget",
    "status",
    "category_id",
    "tag",
    "price_tier",
  ],
  lead_activities: ["id", "lead_id", "admin_id", "activity_type", "body", "metadata", "created_at"],
  quotations: [
    "id",
    "lead_id",
    "admin_id",
    "quotation_number",
    "items",
    "subtotal",
    "discount",
    "total",
    "status",
    "valid_until",
    "notes",
    "created_at",
    "updated_at",
  ],
  testimonials: [
    "id",
    "lead_id",
    "author",
    "role",
    "quote",
    "rating",
    "photos",
    "status",
    "source",
    "created_at",
    "updated_at",
  ],
  studio_templates: [
    "id",
    "name",
    "thumbnail",
    "svg_base",
    "category",
    "is_active",
    "default_config",
    "created_at",
    "updated_at",
  ],
  studio_slot_definitions: [
    "id",
    "template_id",
    "slot_key",
    "label",
    "slot_type",
    "norm_x",
    "norm_y",
    "norm_width",
    "norm_height",
    "allow_scale",
    "allow_rotate",
    "mirror_x",
    "z_index",
    "sort_order",
    "required",
  ],
  studio_assets: [
    "id",
    "asset_type",
    "name",
    "thumbnail",
    "svg_data",
    "color_hex",
    "font_family",
    "tags",
    "is_active",
    "dominant_colors",
    "created_at",
    "updated_at",
  ],
  studio_slot_rules: [
    "id",
    "template_id",
    "rule_name",
    "condition_slot",
    "condition_value",
    "target_slot",
    "action",
    "action_value",
    "priority",
  ],
  refresh_tokens: [
    "id",
    "admin_id",
    "token_hash",
    "expires_at",
    "revoked_at",
    "created_at",
    "family_id",
    "replaced_by",
  ],
  quotation_counters: ["year", "last_seq"],
};

// jsonb columns need JSON.stringify() before going over the wire; pg does
// NOT do this automatically for plain JS objects/arrays bound as query
// params (it only auto-parses jsonb coming *back* from the database).
export const JSONB_COLUMNS = new Set([
  "design_snapshot",
  "gallery",
  "metadata",
  "items",
  "photos",
  "tags",
  "dominant_colors",
  "condition_value",
  "action_value",
  "default_config",
]);

export function assertKnownTable(table) {
  if (!TABLES[table]) {
    throw new Error(`[database.pg.js] Unknown table "${table}" — add it to TABLES first.`);
  }
}

/** "order" is a reserved word; every other column name is safe unquoted. */
export function quoteCol(col) {
  return col === "order" ? `"order"` : col;
}

export function serializeValue(col, value) {
  if (value === undefined) return null;
  if (JSONB_COLUMNS.has(col) && value !== null) return JSON.stringify(value);
  return value;
}
