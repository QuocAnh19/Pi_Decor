import { testimonialsRepository } from "./testimonials.repository.js";
import { publicUrlFor } from "../../utils/uploadImage.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../shared/media.service.js";

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function safeParsePhotos(photos) {
  if (Array.isArray(photos)) return photos;
  if (typeof photos === "string") {
    try {
      const parsed = JSON.parse(photos);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export const testimonialsService = {
  async getPublicTestimonials() {
    const rows = await testimonialsRepository.findApproved();
    return rows.map((t) => ({
      ...t,
      photos: safeParsePhotos(t.photos),
    }));
  },

  async getAdminTestimonials(status) {
    const rows = await testimonialsRepository.findAll(status);
    return rows.map((t) => ({
      ...t,
      photos: safeParsePhotos(t.photos),
    }));
  },

  async createTestimonial(body = {}, files = [], req = null) {
    const { author, role, quote, rating, lead_id, consent_version } = body ?? {};
    const numRating = Math.min(5, Math.max(1, Number(rating ?? 5)));

    let photoList = [];
    if (files && Array.isArray(files) && files.length > 0) {
      photoList = files.map((f) => publicUrlFor(req, f));
    } else if (body.photos) {
      photoList = safeParsePhotos(body.photos);
    }

    const containsBase64 = photoList.some((p) => typeof p === "string" && p.startsWith("data:"));
    if (containsBase64) {
      throw createHttpError(
        400,
        "Không chấp nhận ảnh chuỗi base64 Data URL. Vui lòng upload ảnh qua file upload."
      );
    }

    const testimonialData = {
      lead_id: lead_id ?? null,
      author: String(author).trim(),
      role: role ? String(role).trim() : null,
      quote: String(quote).trim(),
      rating: numRating,
      photos: photoList,
      status: "pending",
      source: "customer",
      consent_at: new Date(),
      consent_version: typeof consent_version === "string" ? consent_version.trim() : "v1.0",
    };

    return testimonialsRepository.insert(testimonialData);
  },

  async updateTestimonial(id, patch = {}) {
    const existing = await testimonialsRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy đánh giá.");
    }

    if (patch.status && !["pending", "approved", "rejected"].includes(patch.status)) {
      throw createHttpError(400, "Trạng thái phê duyệt không hợp lệ.");
    }

    if (patch.photos && Array.isArray(patch.photos)) {
      const containsBase64 = patch.photos.some(
        (p) => typeof p === "string" && p.startsWith("data:")
      );
      if (containsBase64) {
        throw createHttpError(400, "Không chấp nhận ảnh chuỗi base64 Data URL.");
      }

      await cleanupRemovedMedia(existing.photos, patch.photos);
    }

    return testimonialsRepository.updateById(id, patch);
  },

  async deleteTestimonial(id) {
    const existing = await testimonialsRepository.findById(id);
    if (!existing) {
      return false;
    }

    const removed = await testimonialsRepository.removeById(id);
    if (!removed) {
      return false;
    }

    if (existing.photos) {
      await deleteMediaOf(existing, "photos");
    }

    return true;
  },
};
