import { db } from "../../config/database.js";

export async function seedStudioTemplates() {
  const existing = await db.query("select id from studio_templates limit 1");
  if (existing.length === 0) {
    const templateId = "11111111-1111-1111-1111-111111111111";
    await db.query(
      `
      insert into studio_templates (id, name, thumbnail, svg_base, category, is_active, default_config, created_at)
      values (
        $1,
        'Mẫu Phông Cưới Elegance Rose',
        null,
        '<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#fcf9f2"/><text x="400" y="300" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#a15c2e">Pi Decor Studio</text></svg>',
        'fabric',
        true,
        '{"theme": "rose", "primary_color": "#a15c2e"}'::jsonb,
        now()
      )
      on conflict (id) do nothing
    `,
      [templateId]
    );

    // Chèn 1 slot mẫu cho template
    await db.query(
      `
      insert into studio_slot_definitions (
        template_id, slot_key, label, slot_type, norm_x, norm_y, norm_width, norm_height, sort_order
      )
      values (
        $1, 'drape_main', 'Rèm Nền Chính', 'drape', 0.5, 0.5, 0.8, 0.8, 1
      )
      on conflict (template_id, slot_key) do nothing
    `,
      [templateId]
    );

    console.log("✓ Seeded studio templates & slots.");
  }
}
