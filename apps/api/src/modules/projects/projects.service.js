import { projectsRepository } from "./projects.repository.js";
import { parseArrayField } from "../../utils/parseArrayField.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../shared/media.service.js";

export const projectUpload = uploadImage.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery_files", maxCount: 20 },
]);

export function normalizeProjectInput(raw = {}, files = {}, req = null) {
  const result = { ...raw };

  if (
    "price_tier" in raw &&
    raw.price_tier !== undefined &&
    raw.price_tier !== null &&
    raw.price_tier !== ""
  ) {
    if (!["standard", "premium"].includes(raw.price_tier)) {
      const err = new Error("Hạng mục giá không hợp lệ.");
      err.status = 400;
      throw err;
    }
    result.price_tier = raw.price_tier;
  }

  if (files && files["image"] && files["image"][0]) {
    result.cover_image = publicUrlFor(req, files["image"][0]);
  }

  if ("style_tags" in raw && raw.style_tags !== undefined && raw.style_tags !== null) {
    result.style_tags = parseArrayField(raw.style_tags);
  }

  const hasGalleryRaw = "gallery" in raw && raw.gallery !== undefined && raw.gallery !== null;
  const hasGalleryFiles = Boolean(
    files &&
    files["gallery_files"] &&
    Array.isArray(files["gallery_files"]) &&
    files["gallery_files"].length > 0
  );
  if (hasGalleryRaw || hasGalleryFiles) {
    let galleryList = hasGalleryRaw ? parseArrayField(raw.gallery) : [];
    if (hasGalleryFiles) {
      const uploadedUrls = files["gallery_files"].map((f) => publicUrlFor(req, f)).filter(Boolean);
      galleryList = [...galleryList, ...uploadedUrls];
    }
    result.gallery = galleryList;
  }

  if ("status" in raw && raw.status !== undefined && raw.status !== null && raw.status !== "") {
    if (!["active", "featured", "draft"].includes(raw.status)) {
      const err = new Error("Trạng thái không hợp lệ.");
      err.status = 400;
      throw err;
    }
    result.published = raw.status !== "draft";
  } else if ("published" in raw) {
    result.published = raw.published === "false" ? false : Boolean(raw.published ?? true);
  }

  return result;
}

export const projectsService = {
  async getPublishedProjects() {
    return projectsRepository.findPublished();
  },

  async getAllProjects() {
    return projectsRepository.findAll();
  },

  async createProject(data = {}, files = {}, req = null) {
    const rawTitle = data.title ? String(data.title).trim() : "";
    if (!rawTitle) {
      const err = new Error("Thiếu tên dự án.");
      err.status = 400;
      throw err;
    }

    const normalized = normalizeProjectInput(data, files, req);

    const style_tags = normalized.style_tags ?? [];
    const gallery = normalized.gallery ?? [];
    const published =
      normalized.published !== undefined
        ? normalized.published
        : data.published === "false"
          ? false
          : Boolean(data.published ?? true);
    const status = normalized.status || (published ? "active" : "draft");
    const price_tier = normalized.price_tier || "standard";

    const projectData = {
      venue_id: data.venue_id || null,
      title: rawTitle,
      wedding_date: data.wedding_date || null,
      style_tags,
      cover_image: normalized.cover_image ?? null,
      gallery,
      lead_id: data.lead_id || null,
      published,
      location: data.location || null,
      description: data.description || null,
      budget: data.budget || null,
      status,
      category_id: data.category_id || style_tags[0] || "piwedding",
      tag: data.tag || style_tags[1] || "Gia Tiên",
      price_tier,
    };

    return projectsRepository.insert(projectData);
  },

  async updateProject(id, data = {}, files = {}, req = null) {
    const existing = await projectsRepository.findById(id);
    if (!existing) {
      const err = new Error("Không tìm thấy dự án.");
      err.status = 404;
      throw err;
    }

    const normalized = normalizeProjectInput(data, files, req);
    const patch = { ...normalized };

    if (patch.title !== undefined) {
      patch.title = String(patch.title).trim();
    }

    const updated = await projectsRepository.updateById(id, patch);

    if (patch.cover_image !== undefined) {
      await cleanupRemovedMedia(existing.cover_image, patch.cover_image);
    }

    if (patch.gallery !== undefined) {
      await cleanupRemovedMedia(existing.gallery, patch.gallery);
    }

    return updated;
  },

  async deleteProject(id) {
    const existing = await projectsRepository.findById(id);
    if (!existing) {
      return false;
    }

    const removed = await projectsRepository.removeById(id);
    if (!removed) {
      return false;
    }

    await deleteMediaOf(existing, "cover_image", "gallery");
    return true;
  },
};
