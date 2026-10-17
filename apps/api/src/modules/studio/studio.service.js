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

  async updateTemplate(id, body = {}) {
    const existing = await studioRepository.findTemplateById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy template.");
    }

    const patch = { ...body };
    if (patch.svg_base) {
      patch.svg_base = sanitizeSvg(patch.svg_base);
    }

    const updated = await studioRepository.updateTemplateById(id, patch);
    if (patch.thumbnail && existing.thumbnail && existing.thumbnail !== patch.thumbnail) {
      await cleanupRemovedMedia(existing.thumbnail, patch.thumbnail);
    }
    return updated;
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

  async deleteSlot(slotId) {
    return studioRepository.removeSlotById(slotId);
  },

  // Assets
  async getAllAssets() {
    return studioRepository.findAllAssets();
  },

  // Rules
  async getRulesByTemplateId(templateId) {
    return studioRepository.findRulesByTemplateId(templateId);
  },
};
