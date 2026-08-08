import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { sanitizeSvg } from "../../utils/sanitizeSvg.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";

export const studioRouter = Router();

// ============================================================================
// 1. Studio Templates
// ============================================================================

// GET /api/studio/templates — public, returns active templates only
studioRouter.get("/templates", async (_req, res) => {
  const templates = await db.get("studio_templates");
  res.json(templates.filter((t) => t.is_active));
});

// GET /api/studio/templates/admin — admin only, returns all templates
studioRouter.get("/templates/admin", verifyToken, requireAdmin, async (_req, res) => {
  const templates = await db.get("studio_templates");
  res.json(templates);
});

// POST /api/studio/templates — admin only, create new template with sanitized svg_base
studioRouter.post("/templates", verifyToken, requireAdmin, async (req, res) => {
  const { name, thumbnail, svg_base, category, is_active } = req.body ?? {};

  if (!name || !svg_base) {
    return res.status(400).json({ message: "Thiếu tên hoặc nội dung SVG của template." });
  }

  const cleanSvg = sanitizeSvg(svg_base);
  const template = {
    id: uuid(),
    name: String(name).trim(),
    thumbnail: thumbnail ?? null,
    svg_base: cleanSvg,
    category: category ?? null,
    is_active: is_active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert("studio_templates", template);
  res.status(201).json(template);
});

// PATCH /api/studio/templates/:id — admin only, update template
studioRouter.patch("/templates/:id", verifyToken, requireAdmin, async (req, res) => {
  const patch = { ...req.body };
  if (patch.svg_base) {
    patch.svg_base = sanitizeSvg(patch.svg_base);
  }

  const updated = await db.update("studio_templates", (t) => t.id === req.params.id, patch);
  if (!updated) {
    return res.status(404).json({ message: "Không tìm thấy template." });
  }
  res.json(updated);
});

// DELETE /api/studio/templates/:id — admin only, delete template (and cleanup associated slots/rules in DB)
studioRouter.delete("/templates/:id", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("studio_templates", (t) => t.id === req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy template." });
  }

  // Clean up associated slots and rules (app-level cascade for JSON DB mode)
  await db.remove("studio_slot_definitions", (s) => s.template_id === req.params.id);
  await db.remove("studio_slot_rules", (r) => r.template_id === req.params.id);

  res.status(204).send();
});

// ============================================================================
// 2. Studio Slot Definitions
// ============================================================================

// GET /api/studio/templates/:id/slots — get slot definitions for a template
studioRouter.get("/templates/:id/slots", async (req, res) => {
  const slots = await db.get("studio_slot_definitions");
  const filtered = slots
    .filter((s) => s.template_id === req.params.id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  res.json(filtered);
});

// POST /api/studio/templates/:id/slots — admin only, create a slot definition
studioRouter.post("/templates/:id/slots", verifyToken, requireAdmin, async (req, res) => {
  const {
    slot_key, label, slot_type, norm_x, norm_y, norm_width, norm_height,
    allow_scale, allow_rotate, mirror_x, z_index, sort_order, required,
  } = req.body ?? {};

  if (!slot_key || !label || !slot_type || norm_x === undefined || norm_y === undefined) {
    return res.status(400).json({ message: "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y." });
  }

  const slot = {
    id: uuid(),
    template_id: req.params.id,
    slot_key: String(slot_key).trim(),
    label: String(label).trim(),
    slot_type,
    norm_x: Number(norm_x),
    norm_y: Number(norm_y),
    norm_width: norm_width !== undefined ? Number(norm_width) : null,
    norm_height: norm_height !== undefined ? Number(norm_height) : null,
    allow_scale: allow_scale ?? true,
    allow_rotate: allow_rotate ?? false,
    mirror_x: mirror_x ?? false,
    z_index: z_index ?? 0,
    sort_order: sort_order ?? 0,
    required: required ?? false,
  };

  await db.insert("studio_slot_definitions", slot);
  res.status(201).json(slot);
});

// PATCH /api/studio/templates/:id/slots/reorder — admin only, batch update slot sort_order
studioRouter.patch("/templates/:id/slots/reorder", verifyToken, requireAdmin, async (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "Payload phải là mảng các đối tượng { id, sort_order }." });
  }

  for (const item of items) {
    if (item.id && item.sort_order !== undefined) {
      await db.update("studio_slot_definitions", (s) => s.id === item.id, { sort_order: Number(item.sort_order) });
    }
  }

  const slots = await db.get("studio_slot_definitions");
  const updatedList = slots
    .filter((s) => s.template_id === req.params.id)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  res.json(updatedList);
});

// PATCH /api/studio/slots/:slotId — admin only, edit single slot
studioRouter.patch("/slots/:slotId", verifyToken, requireAdmin, async (req, res) => {
  const updated = await db.update("studio_slot_definitions", (s) => s.id === req.params.slotId, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Không tìm thấy slot definition." });
  }
  res.json(updated);
});

// DELETE /api/studio/slots/:slotId — admin only, delete single slot
studioRouter.delete("/slots/:slotId", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("studio_slot_definitions", (s) => s.id === req.params.slotId);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy slot definition." });
  }
  res.status(204).send();
});

// ============================================================================
// 3. Studio Assets
// ============================================================================

// GET /api/studio/assets — public, returns active assets only
studioRouter.get("/assets", async (_req, res) => {
  const assets = await db.get("studio_assets");
  res.json(assets.filter((a) => a.is_active));
});

// GET /api/studio/assets/admin — admin only, returns all assets
studioRouter.get("/assets/admin", verifyToken, requireAdmin, async (_req, res) => {
  const assets = await db.get("studio_assets");
  res.json(assets);
});

// POST /api/studio/assets — admin only, create asset (optional file upload or body)
studioRouter.post("/assets", verifyToken, requireAdmin, uploadImage.single("svg"), async (req, res) => {
  const { asset_type, name, thumbnail, svg_data, color_hex, font_family, tags, is_active, dominant_colors } = req.body ?? {};

  if (!asset_type || !name) {
    return res.status(400).json({ message: "Thiếu loại asset (asset_type) hoặc tên." });
  }

  let finalSvg = svg_data ? sanitizeSvg(svg_data) : null;
  let finalThumbnail = thumbnail ?? null;

  if (req.file) {
    finalThumbnail = publicUrlFor(req, req.file);
  }

  const asset = {
    id: uuid(),
    asset_type,
    name: String(name).trim(),
    thumbnail: finalThumbnail,
    svg_data: finalSvg,
    color_hex: color_hex ?? null,
    font_family: font_family ?? null,
    tags: Array.isArray(tags) ? tags : [],
    is_active: is_active ?? true,
    dominant_colors: dominant_colors ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert("studio_assets", asset);
  res.status(201).json(asset);
});

// PATCH /api/studio/assets/:id — admin only, update asset
studioRouter.patch("/assets/:id", verifyToken, requireAdmin, uploadImage.single("svg"), async (req, res) => {
  const patch = { ...req.body };
  if (patch.svg_data) {
    patch.svg_data = sanitizeSvg(patch.svg_data);
  }
  if (req.file) {
    patch.thumbnail = publicUrlFor(req, req.file);
  }

  const updated = await db.update("studio_assets", (a) => a.id === req.params.id, patch);
  if (!updated) {
    return res.status(404).json({ message: "Không tìm thấy asset." });
  }
  res.json(updated);
});

// DELETE /api/studio/assets/:id — admin only, delete asset
studioRouter.delete("/assets/:id", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("studio_assets", (a) => a.id === req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy asset." });
  }
  res.status(204).send();
});

// ============================================================================
// 4. Studio Slot Rules
// ============================================================================

// GET /api/studio/templates/:id/rules — get slot rules for a template
studioRouter.get("/templates/:id/rules", async (req, res) => {
  const rules = await db.get("studio_slot_rules");
  const filtered = rules
    .filter((r) => r.template_id === req.params.id)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  res.json(filtered);
});

// POST /api/studio/templates/:id/rules — admin only, create rule
studioRouter.post("/templates/:id/rules", verifyToken, requireAdmin, async (req, res) => {
  const { rule_name, condition_slot, condition_value, target_slot, action, action_value, priority } = req.body ?? {};

  if (!condition_slot || !condition_value || !target_slot || !action) {
    return res.status(400).json({ message: "Thiếu thông tin điều kiện hoặc hành động của rule." });
  }

  const rule = {
    id: uuid(),
    template_id: req.params.id,
    rule_name: rule_name ? String(rule_name).trim() : null,
    condition_slot,
    condition_value,
    target_slot,
    action,
    action_value: action_value ?? null,
    priority: priority ?? 0,
  };

  await db.insert("studio_slot_rules", rule);
  res.status(201).json(rule);
});

// PATCH /api/studio/rules/:ruleId — admin only, edit rule
studioRouter.patch("/rules/:ruleId", verifyToken, requireAdmin, async (req, res) => {
  const updated = await db.update("studio_slot_rules", (r) => r.id === req.params.ruleId, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Không tìm thấy rule." });
  }
  res.json(updated);
});

// DELETE /api/studio/rules/:ruleId — admin only, delete rule
studioRouter.delete("/rules/:ruleId", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("studio_slot_rules", (r) => r.id === req.params.ruleId);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy rule." });
  }
  res.status(204).send();
});
