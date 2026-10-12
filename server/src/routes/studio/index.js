import { Router } from "express";
import crypto from "crypto";
import { db } from "../../config/database.js";
import { logger } from "../../config/logger.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import {
  createTemplateSchema,
  updateTemplateSchema,
  publishTemplateSchema,
  createSlotSchema,
  updateSlotSchema,
  reorderSlotsSchema,
  createAssetSchema,
  updateAssetSchema,
  createRuleSchema,
  updateRuleSchema,
} from "../../schemas/studio.schema.js";
import { sanitizeSvg } from "../../utils/sanitizeSvg.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../services/media.service.js";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";

export const studioRouter = Router();

// ============================================================================
// 1. Studio Templates
// ============================================================================

// GET /api/studio/templates — public, returns active templates only
studioRouter.get("/templates", async (_req, res) => {
  const templates = await db.query(
    `select * from studio_templates where is_active = true order by created_at desc`
  );
  res.json(templates);
});

// GET /api/studio/templates/admin — admin only, returns all templates
studioRouter.get("/templates/admin", verifyToken, requireAdmin, async (_req, res) => {
  const templates = await db.query(
    `select * from studio_templates order by created_at desc`
  );
  res.json(templates);
});

// POST /api/studio/templates — admin only, create new template with sanitized svg_base
studioRouter.post("/templates", verifyToken, requireAdmin, validate(createTemplateSchema), async (req, res) => {
  const { name, thumbnail, svg_base, category, is_active } = req.body ?? {};

  const cleanSvg = sanitizeSvg(svg_base);
  const template = {
    name: String(name).trim(),
    thumbnail: thumbnail ?? null,
    svg_base: cleanSvg,
    category: category ?? null,
    is_active: is_active ?? true,
  };

  const inserted = await db.insert("studio_templates", template);
  res.status(201).json(inserted);
});

// PATCH /api/studio/templates/:id — admin only, update template
studioRouter.patch("/templates/:id", verifyToken, requireAdmin, validate(updateTemplateSchema), async (req, res) => {
  const existing = await db.findById("studio_templates", req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy template." });
  }

  const patch = { ...req.body };
  if (patch.svg_base) {
    patch.svg_base = sanitizeSvg(patch.svg_base);
  }
  if (patch.thumbnail && existing.thumbnail && existing.thumbnail !== patch.thumbnail) {
    await cleanupRemovedMedia(existing.thumbnail, patch.thumbnail);
  }

  const updated = await db.updateById("studio_templates", req.params.id, patch);
  res.json(updated);
});

function ensureUuid(id) {
  if (!id || typeof id !== "string") return crypto.randomUUID();
  const clean = id.replace(/^(tpl|slot|rule|mat|asset)-/, "");
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean)) {
    return clean;
  }
  return crypto.randomUUID();
}

// PUT /api/studio/templates/:id/publish — admin only, full atomic publish or draft save
studioRouter.put("/templates/:id/publish", verifyToken, requireAdmin, validate(publishTemplateSchema), async (req, res) => {
  try {
    const rawTargetId = req.params.id;
    const { name, thumbnail, svg_base, category, is_active, slots, rules, slot_config } = req.body ?? {};

    const cleanSvg = sanitizeSvg(svg_base);
    const validTargetUuid = ensureUuid(rawTargetId);

    // Only match existing template by exact ID (never by name to prevent overwriting existing templates)
    let existing = null;
    if (rawTargetId !== "new") {
      existing = await db.findById("studio_templates", validTargetUuid);
    }

    const activeFlag = is_active !== undefined ? Boolean(is_active) : (existing ? Boolean(existing.is_active) : true);

    let finalThumbnail = thumbnail;
    if (thumbnail && typeof thumbnail === "string" && thumbnail.startsWith("data:image/")) {
      if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) {
        try {
          const uploadRes = await cloudinary.uploader.upload(thumbnail, {
            folder: "pidecor/templates",
            resource_type: "image",
          });
          finalThumbnail = uploadRes.secure_url;
          if (existing?.thumbnail && existing.thumbnail !== finalThumbnail) {
            await cleanupRemovedMedia(existing.thumbnail, finalThumbnail);
          }
        } catch (err) {
          logger.error({ err }, "Failed to upload template thumbnail to Cloudinary, keeping payload as-is");
        }
      }
    }

    let savedTemplate;
    if (existing) {
      savedTemplate = await db.updateById(
        "studio_templates",
        existing.id,
        {
          name: String(name).trim(),
          thumbnail: finalThumbnail !== undefined ? finalThumbnail : (existing.thumbnail ?? null),
          svg_base: cleanSvg,
          category: category ?? existing.category ?? null,
          is_active: activeFlag,
          default_config: slot_config ?? existing.default_config ?? {},
        }
      );
    } else {
      const templateRow = {
        name: String(name).trim(),
        thumbnail: finalThumbnail ?? null,
        svg_base: cleanSvg,
        category: category ?? null,
        is_active: activeFlag,
        default_config: slot_config ?? {},
      };
      if (rawTargetId !== "new") {
        templateRow.id = validTargetUuid;
      }
      savedTemplate = await db.insert("studio_templates", templateRow);
    }

    // Batch sync slot definitions for this template
    if (Array.isArray(slots)) {
      await db.removeWhere("studio_slot_definitions", "template_id", savedTemplate.id);

      for (const slot of slots) {
        const slotRow = {
          id: ensureUuid(slot.id),
          template_id: savedTemplate.id,
          slot_key: String(slot.slotKey || slot.slot_key).trim(),
          label: String(slot.label).trim(),
          slot_type: slot.slotType || slot.slot_type || "drape",
          norm_x: Number(slot.normX ?? slot.norm_x ?? 0.5),
          norm_y: Number(slot.normY ?? slot.norm_y ?? 0.5),
          norm_width: slot.normWidth !== undefined ? Number(slot.normWidth) : slot.norm_width !== undefined ? Number(slot.norm_width) : null,
          norm_height: slot.normHeight !== undefined ? Number(slot.normHeight) : slot.norm_height !== undefined ? Number(slot.norm_height) : null,
          allow_scale: slot.allowScale ?? slot.allow_scale ?? true,
          allow_rotate: slot.allowRotate ?? slot.allow_rotate ?? false,
          mirror_x: slot.mirrorX ?? slot.mirror_x ?? false,
          z_index: Number(slot.zIndex ?? slot.z_index ?? 0),
          sort_order: Number(slot.sortOrder ?? slot.sort_order ?? 0),
          required: slot.required ?? false,
        };
        await db.insert("studio_slot_definitions", slotRow);
      }
    }

    // Batch sync slot rules for this template
    if (Array.isArray(rules)) {
      await db.removeWhere("studio_slot_rules", "template_id", savedTemplate.id);

      for (const rule of rules) {
        const ruleRow = {
          id: ensureUuid(rule.id),
          template_id: savedTemplate.id,
          rule_name: rule.ruleName || rule.rule_name || null,
          condition_slot: rule.conditionSlot || rule.condition_slot,
          condition_value: rule.conditionValue || rule.condition_value || {},
          target_slot: rule.targetSlot || rule.target_slot,
          action: rule.action,
          action_value: rule.actionValue || rule.action_value || null,
          priority: Number(rule.priority ?? 0),
        };
        await db.insert("studio_slot_rules", ruleRow);
      }
    }

    res.json({
      message: activeFlag ? "Đã xuất bản (Publish) template thành công!" : "Đã lưu nháp (Draft) template thành công!",
      template: savedTemplate,
    });
  } catch (err) {
    logger.error({ err }, "Error in publish/draft template endpoint");
    res.status(500).json({ message: "Lỗi hệ thống khi lưu template: " + (err.message || "Không thể truy vấn CSDL") });
  }
});

// DELETE /api/studio/templates/:id — admin only, delete template (and cleanup associated slots/rules in DB)
studioRouter.delete("/templates/:id", verifyToken, requireAdmin, async (req, res) => {
  const existing = await db.findById("studio_templates", req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy template." });
  }

  const removed = await db.removeById("studio_templates", req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy template." });
  }

  await deleteMediaOf(existing, "thumbnail");
  res.status(204).send();
});

// ============================================================================
// 2. Studio Slot Definitions
// ============================================================================

// GET /api/studio/templates/:id/slots — get slot definitions for a template (ordered by sort_order)
studioRouter.get("/templates/:id/slots", async (req, res) => {
  const slots = await db.query(
    `select * from studio_slot_definitions where template_id = $1 order by sort_order asc`,
    [req.params.id]
  );
  res.json(slots);
});

// POST /api/studio/templates/:id/slots — admin only, create a slot definition
studioRouter.post("/templates/:id/slots", verifyToken, requireAdmin, validate(createSlotSchema), async (req, res) => {
  const {
    slot_key, label, slot_type, norm_x, norm_y, norm_width, norm_height,
    allow_scale, allow_rotate, mirror_x, z_index, sort_order, required,
  } = req.body ?? {};

  const slot = {
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

  const inserted = await db.insert("studio_slot_definitions", slot);
  res.status(201).json(inserted);
});

// PATCH /api/studio/templates/:id/slots/reorder — admin only, batch update slot sort_order
studioRouter.patch("/templates/:id/slots/reorder", verifyToken, requireAdmin, validate(reorderSlotsSchema), async (req, res) => {
  const items = req.body;

  for (const item of items) {
    if (item.id && item.sort_order !== undefined) {
      await db.updateById("studio_slot_definitions", item.id, { sort_order: Number(item.sort_order) });
    }
  }

  const updatedList = await db.query(
    `select * from studio_slot_definitions where template_id = $1 order by sort_order asc`,
    [req.params.id]
  );
  res.json(updatedList);
});

// PATCH /api/studio/slots/:slotId — admin only, edit single slot
studioRouter.patch("/slots/:slotId", verifyToken, requireAdmin, validate(updateSlotSchema), async (req, res) => {
  const updated = await db.updateById("studio_slot_definitions", req.params.slotId, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Không tìm thấy slot definition." });
  }
  res.json(updated);
});

// DELETE /api/studio/slots/:slotId — admin only, delete single slot
studioRouter.delete("/slots/:slotId", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.removeById("studio_slot_definitions", req.params.slotId);
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
  const assets = await db.query(
    `select * from studio_assets where is_active = true order by created_at desc`
  );
  res.json(assets);
});

// GET /api/studio/assets/admin — admin only, returns all assets
studioRouter.get("/assets/admin", verifyToken, requireAdmin, async (_req, res) => {
  const assets = await db.query(
    `select * from studio_assets order by created_at desc`
  );
  res.json(assets);
});

// POST /api/studio/assets — admin only, create or update asset
studioRouter.post("/assets", verifyToken, requireAdmin, validate(createAssetSchema), async (req, res) => {
  const { asset_type, name, thumbnail, svg_data, color_hex, font_family, tags, is_active, dominant_colors } = req.body ?? {};

  const finalSvg = svg_data ? sanitizeSvg(svg_data) : null;
  const finalThumbnail = thumbnail ?? null;

  const cleanName = String(name).trim();
  const existing = await db.query(
    `select * from studio_assets where name = $1 and asset_type = $2 limit 1`,
    [cleanName, asset_type]
  ).then((r) => r[0] ?? null);

  if (existing) {
    if (finalThumbnail && existing.thumbnail && existing.thumbnail !== finalThumbnail) {
      await cleanupRemovedMedia(existing.thumbnail, finalThumbnail);
    }
    const updated = await db.updateById("studio_assets", existing.id, {
      thumbnail: finalThumbnail ?? existing.thumbnail ?? null,
      svg_data: finalSvg ?? existing.svg_data ?? null,
      color_hex: color_hex ?? existing.color_hex ?? null,
      font_family: font_family ?? existing.font_family ?? null,
      tags: Array.isArray(tags) ? tags : existing.tags ?? [],
      is_active: is_active ?? existing.is_active ?? true,
    });
    return res.json(updated);
  }

  const asset = {
    asset_type,
    name: cleanName,
    thumbnail: finalThumbnail,
    svg_data: finalSvg,
    color_hex: color_hex ?? null,
    font_family: font_family ?? null,
    tags: Array.isArray(tags) ? tags : [],
    is_active: is_active ?? true,
    dominant_colors: dominant_colors ?? null,
  };

  const inserted = await db.insert("studio_assets", asset);
  res.status(201).json(inserted);
});

// PATCH /api/studio/assets/:id — admin only, update asset
studioRouter.patch("/assets/:id", verifyToken, requireAdmin, validate(updateAssetSchema), async (req, res) => {
  const existing = await db.findById("studio_assets", req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy asset." });
  }

  const patch = { ...req.body };
  if (patch.svg_data) {
    patch.svg_data = sanitizeSvg(patch.svg_data);
  }
  if (patch.thumbnail && existing.thumbnail && existing.thumbnail !== patch.thumbnail) {
    await cleanupRemovedMedia(existing.thumbnail, patch.thumbnail);
  }

  const updated = await db.updateById("studio_assets", req.params.id, patch);
  res.json(updated);
});

// DELETE /api/studio/assets/:id — admin only, delete asset
studioRouter.delete("/assets/:id", verifyToken, requireAdmin, async (req, res) => {
  const existing = await db.findById("studio_assets", req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy asset." });
  }

  const removed = await db.removeById("studio_assets", req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy asset." });
  }

  await deleteMediaOf(existing, "thumbnail");
  res.status(204).send();
});

// ============================================================================
// 4. Studio Slot Rules
// ============================================================================

// GET /api/studio/templates/:id/rules — get slot rules for a template (ordered by priority)
studioRouter.get("/templates/:id/rules", async (req, res) => {
  const rules = await db.query(
    `select * from studio_slot_rules where template_id = $1 order by priority asc`,
    [req.params.id]
  );
  res.json(rules);
});

// POST /api/studio/templates/:id/rules — admin only, create rule
studioRouter.post("/templates/:id/rules", verifyToken, requireAdmin, validate(createRuleSchema), async (req, res) => {
  const { rule_name, condition_slot, condition_value, target_slot, action, action_value, priority } = req.body ?? {};

  const rule = {
    template_id: req.params.id,
    rule_name: rule_name ? String(rule_name).trim() : null,
    condition_slot,
    condition_value,
    target_slot,
    action,
    action_value: action_value ?? null,
    priority: priority ?? 0,
  };

  const inserted = await db.insert("studio_slot_rules", rule);
  res.status(201).json(inserted);
});

// PATCH /api/studio/rules/:ruleId — admin only, edit rule
studioRouter.patch("/rules/:ruleId", verifyToken, requireAdmin, validate(updateRuleSchema), async (req, res) => {
  const updated = await db.updateById("studio_slot_rules", req.params.ruleId, req.body);
  if (!updated) {
    return res.status(404).json({ message: "Không tìm thấy rule." });
  }
  res.json(updated);
});

// DELETE /api/studio/rules/:ruleId — admin only, delete rule
studioRouter.delete("/rules/:ruleId", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.removeById("studio_slot_rules", req.params.ruleId);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy rule." });
  }
  res.status(204).send();
});
