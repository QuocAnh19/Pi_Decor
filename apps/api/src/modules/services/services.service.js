import { servicesRepository } from "./services.repository.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";
import { parseArrayField } from "../../utils/parseArrayField.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../shared/media.service.js";

export const serviceUpload = uploadImage.fields([
  { name: "cover", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "image_url", maxCount: 1 },
]);

export function normalizeServiceInput(raw = {}, files = {}, req = null) {
  const result = { ...raw };

  if (files) {
    if (files.cover && files.cover[0]) {
      result.cover = publicUrlFor(req, files.cover[0]);
    }
    if (files.image && files.image[0]) {
      result.image_url = publicUrlFor(req, files.image[0]);
    } else if (files.image_url && files.image_url[0]) {
      result.image_url = publicUrlFor(req, files.image_url[0]);
    }
  }

  if ("items" in raw && raw.items !== undefined && raw.items !== null) {
    result.items = parseArrayField(raw.items);
  }

  if ("featured" in raw && raw.featured !== undefined) {
    result.featured =
      raw.featured === "false" || raw.featured === false ? false : Boolean(raw.featured);
  }

  if ("order" in raw && raw.order !== undefined && raw.order !== null && raw.order !== "") {
    result.order = Number(raw.order);
  }

  return result;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function formatService(s) {
  return {
    id: s.id,
    brand: s.brand || s.title,
    title: s.title,
    tagline: s.tagline || "",
    description: s.description || "",
    icon: s.icon || "HeartIcon",
    accent: s.accent || "wedding",
    items: Array.isArray(s.items) ? s.items : [],
    href: s.href || null,
    ctaLabel: s.cta_label || s.ctaLabel || "Liên hệ tư vấn",
    cta_label: s.cta_label || s.ctaLabel || "Liên hệ tư vấn",
    featured: Boolean(s.featured),
    cover: s.cover || s.image_url || null,
    image_url: s.image_url || s.cover || null,
    order: s.order ?? 0,
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

export const servicesService = {
  async getAllServices() {
    const services = await servicesRepository.findAll();
    const sorted = [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return sorted.map(formatService);
  },

  async createService(body = {}, files = {}, req = null) {
    const normalized = normalizeServiceInput(body, files, req);
    const {
      brand,
      title,
      tagline,
      description,
      icon,
      accent,
      items,
      href,
      ctaLabel,
      cta_label,
      featured,
      cover,
      order,
      image_url,
    } = normalized;

    const serviceData = {
      brand: brand || title,
      title: String(title).trim(),
      tagline: tagline || "",
      description: description || "",
      icon: icon || "HeartIcon",
      accent: accent || "wedding",
      items: Array.isArray(items) ? items : [],
      href: href || null,
      cta_label: cta_label || ctaLabel || "Liên hệ tư vấn",
      featured: Boolean(featured),
      cover: cover || image_url || null,
      image_url: image_url || cover || null,
      order: Number(order ?? 0),
    };

    const created = await servicesRepository.insert(serviceData);
    return formatService(created);
  },

  async updateService(id, body = {}, files = {}, req = null) {
    const existing = await servicesRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy dịch vụ.");
    }

    const normalized = normalizeServiceInput(body, files, req);
    const patch = { ...normalized };
    if (patch.ctaLabel) {
      patch.cta_label = patch.ctaLabel;
      delete patch.ctaLabel;
    }

    const newCover = patch.cover;
    const oldCover = existing.cover;
    const newImageUrl = patch.image_url;
    const oldImageUrl = existing.image_url;

    const updated = await servicesRepository.updateById(id, patch);

    if (newCover !== undefined && oldCover && newCover !== oldCover) {
      await cleanupRemovedMedia(oldCover, newCover);
    }
    if (newImageUrl !== undefined && oldImageUrl && newImageUrl !== oldImageUrl) {
      await cleanupRemovedMedia(oldImageUrl, newImageUrl);
    }

    return formatService(updated);
  },

  async deleteService(id) {
    const existing = await servicesRepository.findById(id);
    if (!existing) {
      return false;
    }

    const removed = await servicesRepository.removeById(id);
    if (!removed) {
      return false;
    }

    await deleteMediaOf(existing, "cover", "image_url", "icon");
    return true;
  },
};
