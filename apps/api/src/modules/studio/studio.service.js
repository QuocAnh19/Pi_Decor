import { studioRepository } from "./studio.repository.js";
import { sanitizeSvg } from "../../utils/sanitizeSvg.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../shared/media.service.js";
import { publishTemplate } from "./studio-publish.service.js";

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export const studioService = {
  // Templates
  async getActiveTemplates() {
    return studioRepository.findActiveTemplates();
  },

  async getAllTemplates() {
    return studioRepository.findAllTemplates();
  },

  async createTemplate(body = {}) {
    const { name, thumbnail, svg_base, category, is_active } = body;
    const template = {
      name: String(name).trim(),
      thumbnail: thumbnail ?? null,
      svg_base: sanitizeSvg(svg_base),
      category: category ?? null,
      is_active: is_active ?? true,
    };
    return studioRepository.insertTemplate(template);
  },

  async updateTemplate(id, body = {}) {
    const existing = await studioRepository.findTemplateById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy template.");
    }

    const patch = { ...body };
    if (patch.svg_base) {
      patch.svg_base = sanitizeSvg(patch.svg_base);
    }
    if (patch.thumbnail && existing.thumbnail && existing.thumbnail !== patch.thumbnail) {
      await cleanupRemovedMedia(existing.thumbnail, patch.thumbnail);
    }

    return studioRepository.updateTemplateById(id, patch);
  },

  async publishTemplate(rawTargetId, body = {}) {
    return publishTemplate(rawTargetId, body);
  },

  async deleteTemplate(id) {
    const existing = await studioRepository.findTemplateById(id);
    if (!existing) return false;
    const removed = await studioRepository.removeTemplateById(id);
    if (!removed) return false;
    await deleteMediaOf(existing, "thumbnail");
    return true;
  },

  // Slots
  async getSlotsByTemplateId(templateId) {
    return studioRepository.findSlotsByTemplateId(templateId);
  },

  async createSlot(templateId, body = {}) {
    const {
      slot_key,
      label,
      slot_type,
      norm_x,
      norm_y,
      norm_width,
      norm_height,
      allow_scale,
      allow_rotate,
      mirror_x,
      z_index,
      sort_order,
      required,
    } = body;

    return studioRepository.insertSlot({
      template_id: templateId,
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
    });
  },

  async reorderSlots(templateId, items = []) {
    for (const item of items) {
      if (item.id && item.sort_order !== undefined) {
        await studioRepository.updateSlotById(item.id, {
          sort_order: Number(item.sort_order),
        });
      }
    }
    return studioRepository.findSlotsByTemplateId(templateId);
  },

  async updateSlot(slotId, body = {}) {
    const updated = await studioRepository.updateSlotById(slotId, body);
    if (!updated) {
      throw createHttpError(404, "Không tìm thấy slot definition.");
    }
    return updated;
  },

  async deleteSlot(slotId) {
    return studioRepository.removeSlotById(slotId);
  },

  // Assets
  async getActiveAssets() {
    return studioRepository.findActiveAssets();
  },

  async getAllAssets() {
    return studioRepository.findAllAssets();
  },

  async upsertAsset(body = {}) {
    const {
      asset_type,
      name,
      thumbnail,
      svg_data,
      color_hex,
      font_family,
      tags,
      is_active,
      dominant_colors,
    } = body;

    const finalSvg = svg_data ? sanitizeSvg(svg_data) : null;
    const finalThumbnail = thumbnail ?? null;
    const cleanName = String(name).trim();

    const existing = await studioRepository.findAssetByNameAndType(cleanName, asset_type);
    if (existing) {
      if (finalThumbnail && existing.thumbnail && existing.thumbnail !== finalThumbnail) {
        await cleanupRemovedMedia(existing.thumbnail, finalThumbnail);
      }
      const updated = await studioRepository.updateAssetById(existing.id, {
        thumbnail: finalThumbnail ?? existing.thumbnail ?? null,
        svg_data: finalSvg ?? existing.svg_data ?? null,
        color_hex: color_hex ?? existing.color_hex ?? null,
        font_family: font_family ?? existing.font_family ?? null,
        tags: Array.isArray(tags) ? tags : (existing.tags ?? []),
        is_active: is_active ?? existing.is_active ?? true,
      });
      return { asset: updated, isNew: false };
    }

    const inserted = await studioRepository.insertAsset({
      asset_type,
      name: cleanName,
      thumbnail: finalThumbnail,
      svg_data: finalSvg,
      color_hex: color_hex ?? null,
      font_family: font_family ?? null,
      tags: Array.isArray(tags) ? tags : [],
      is_active: is_active ?? true,
      dominant_colors: dominant_colors ?? null,
    });
    return { asset: inserted, isNew: true };
  },

  async updateAsset(id, body = {}) {
    const existing = await studioRepository.findAssetById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy asset.");
    }

    const patch = { ...body };
    if (patch.svg_data) {
      patch.svg_data = sanitizeSvg(patch.svg_data);
    }
    if (patch.thumbnail && existing.thumbnail && existing.thumbnail !== patch.thumbnail) {
      await cleanupRemovedMedia(existing.thumbnail, patch.thumbnail);
    }

    return studioRepository.updateAssetById(id, patch);
  },

  async deleteAsset(id) {
    const existing = await studioRepository.findAssetById(id);
    if (!existing) return false;
    const removed = await studioRepository.removeAssetById(id);
    if (!removed) return false;
    await deleteMediaOf(existing, "thumbnail");
    return true;
  },

  // Rules
  async getRulesByTemplateId(templateId) {
    return studioRepository.findRulesByTemplateId(templateId);
  },

  async createRule(templateId, body = {}) {
    const {
      rule_name,
      condition_slot,
      condition_value,
      target_slot,
      action,
      action_value,
      priority,
    } = body;

    return studioRepository.insertRule({
      template_id: templateId,
      rule_name: rule_name ? String(rule_name).trim() : null,
      condition_slot,
      condition_value,
      target_slot,
      action,
      action_value: action_value ?? null,
      priority: priority ?? 0,
    });
  },

  async updateRule(ruleId, body = {}) {
    const updated = await studioRepository.updateRuleById(ruleId, body);
    if (!updated) {
      throw createHttpError(404, "Không tìm thấy rule.");
    }
    return updated;
  },

  async deleteRule(ruleId) {
    return studioRepository.removeRuleById(ruleId);
  },
};
