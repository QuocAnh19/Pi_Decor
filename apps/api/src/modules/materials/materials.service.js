import { materialsRepository } from "./materials.repository.js";
import { publicUrlFor } from "../../utils/uploadImage.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../shared/media.service.js";

const CATEGORY_MAP = {
  "rèm nền": "fabric",
  "rèm chi tiết": "drape_detail",
  "cụm hoa": "flowers",
  "dãy chữ số": "text_name",
};

export function normalizeCategory(catInput) {
  if (!catInput) return "fabric";
  const str = String(catInput).trim().toLowerCase();
  if (CATEGORY_MAP[str]) return CATEGORY_MAP[str];
  return str;
}

export async function generateUniqueName(targetName, currentId = null) {
  const trimmed = String(targetName).trim();
  const duplicate = await materialsRepository.findDuplicateName(trimmed, currentId);
  if (duplicate.length === 0) return trimmed;

  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${trimmed} (${suffix})`;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export const materialsService = {
  async getMaterials(category) {
    if (category) {
      const cat = String(category).trim().toLowerCase();
      const mapped = CATEGORY_MAP[cat] || cat;
      return materialsRepository.findMany(cat, mapped);
    }
    return materialsRepository.findMany(null, null);
  },

  async createMaterial(body = {}, file = null, req = null) {
    const { name, category, color_hex } = body ?? {};
    const categoryToUse = normalizeCategory(category);
    const finalName = await generateUniqueName(name);

    const materialData = {
      name: finalName,
      category: categoryToUse,
      color_hex: color_hex ?? null,
      image_url: file ? publicUrlFor(req, file) : null,
    };

    return materialsRepository.insert(materialData);
  },

  async updateMaterial(id, body = {}, file = null, req = null) {
    const existing = await materialsRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy vật liệu.");
    }

    const patch = { ...body };
    if (patch.category) {
      patch.category = normalizeCategory(patch.category);
    }

    if (patch.name) {
      patch.name = await generateUniqueName(patch.name, id);
    }

    if (file) {
      patch.image_url = publicUrlFor(req, file);
      if (existing.image_url) {
        await cleanupRemovedMedia(existing.image_url, patch.image_url);
      }
    }

    return materialsRepository.updateById(id, patch);
  },

  async deleteMaterial(id) {
    const existing = await materialsRepository.findById(id);
    if (!existing) {
      return false;
    }

    const removed = await materialsRepository.removeById(id);
    if (!removed) {
      return false;
    }

    await deleteMediaOf(existing, "image_url");
    return true;
  },
};
