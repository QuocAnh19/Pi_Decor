import { servicesRepository } from "./services.repository.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../shared/media.service.js";

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
    featured: Boolean(s.featured),
    cover: s.cover || s.image_url || null,
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

  async createService(body = {}) {
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
    } = body ?? {};

    const serviceData = {
      brand: brand || title,
      title: title.trim(),
      tagline: tagline || "",
      description: description || "",
      icon: icon || "HeartIcon",
      accent: accent || "wedding",
      items: Array.isArray(items) ? items : [],
      href: href || null,
      cta_label: cta_label || ctaLabel || "Liên hệ tư vấn",
      featured: Boolean(featured),
      cover: cover || image_url || null,
      order: Number(order ?? 0),
    };

    const created = await servicesRepository.insert(serviceData);
    return formatService(created);
  },

  async updateService(id, body = {}) {
    const existing = await servicesRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy dịch vụ.");
    }

    const patch = { ...body };
    if (patch.ctaLabel) {
      patch.cta_label = patch.ctaLabel;
      delete patch.ctaLabel;
    }

    const newCover = patch.cover || patch.image_url;
    const oldCover = existing.cover || existing.image_url;
    if (newCover !== undefined && oldCover) {
      await cleanupRemovedMedia(oldCover, newCover);
    }

    const updated = await servicesRepository.updateById(id, patch);
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
