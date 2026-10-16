import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { studioRepository } from "./studio.repository.js";
import { sanitizeSvg } from "../../utils/sanitizeSvg.js";
import { cleanupRemovedMedia } from "../../shared/media.service.js";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

export function ensureUuid(id) {
  if (!id || typeof id !== "string") return crypto.randomUUID();
  const clean = id.replace(/^(tpl|slot|rule|mat|asset)-/, "");
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean)) {
    return clean;
  }
  return crypto.randomUUID();
}

export async function publishTemplate(rawTargetId, body = {}) {
  const { name, thumbnail, svg_base, category, is_active, slots, rules, slot_config } = body;
  const cleanSvg = sanitizeSvg(svg_base);
  const validTargetUuid = ensureUuid(rawTargetId);

  let existing = null;
  if (rawTargetId !== "new") {
    existing = await studioRepository.findTemplateById(validTargetUuid);
  }

  const activeFlag =
    is_active !== undefined ? Boolean(is_active) : existing ? Boolean(existing.is_active) : true;

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
        logger.error(
          { err },
          "Failed to upload template thumbnail to Cloudinary, keeping payload as-is"
        );
      }
    }
  }

  let savedTemplate;
  if (existing) {
    savedTemplate = await studioRepository.updateTemplateById(existing.id, {
      name: String(name).trim(),
      thumbnail: finalThumbnail !== undefined ? finalThumbnail : (existing.thumbnail ?? null),
      svg_base: cleanSvg,
      category: category ?? existing.category ?? null,
      is_active: activeFlag,
      default_config: slot_config ?? existing.default_config ?? {},
    });
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
    savedTemplate = await studioRepository.insertTemplate(templateRow);
  }

  if (Array.isArray(slots)) {
    await studioRepository.removeSlotsByTemplateId(savedTemplate.id);
    for (const slot of slots) {
      await studioRepository.insertSlot({
        id: ensureUuid(slot.id),
        template_id: savedTemplate.id,
        slot_key: String(slot.slot_key).trim(),
        label: String(slot.label).trim(),
        slot_type: slot.slot_type || "drape",
        norm_x: Number(slot.norm_x ?? 0.5),
        norm_y: Number(slot.norm_y ?? 0.5),
        norm_width:
          slot.norm_width !== null && slot.norm_width !== undefined
            ? Number(slot.norm_width)
            : null,
        norm_height:
          slot.norm_height !== null && slot.norm_height !== undefined
            ? Number(slot.norm_height)
            : null,
        allow_scale: slot.allow_scale ?? true,
        allow_rotate: slot.allow_rotate ?? false,
        mirror_x: slot.mirror_x ?? false,
        z_index: Number(slot.z_index ?? 0),
        sort_order: Number(slot.sort_order ?? 0),
        required: slot.required ?? false,
      });
    }
  }

  if (Array.isArray(rules)) {
    await studioRepository.removeRulesByTemplateId(savedTemplate.id);
    for (const rule of rules) {
      await studioRepository.insertRule({
        id: ensureUuid(rule.id),
        template_id: savedTemplate.id,
        rule_name: rule.rule_name || null,
        condition_slot: rule.condition_slot,
        condition_value: rule.condition_value || {},
        target_slot: rule.target_slot,
        action: rule.action,
        action_value: rule.action_value || null,
        priority: Number(rule.priority ?? 0),
      });
    }
  }

  return {
    message: activeFlag
      ? "Đã xuất bản (Publish) template thành công!"
      : "Đã lưu nháp (Draft) template thành công!",
    template: savedTemplate,
  };
}
