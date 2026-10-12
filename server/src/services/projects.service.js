import { db } from "../config/database.js";
import { parseArrayField } from "../utils/parseArrayField.js";
import { uploadImage, publicUrlFor } from "../utils/uploadImage.js";
import { cleanupRemovedMedia, deleteMediaOf } from "./media.service.js";

export const projectUpload = uploadImage.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery_files", maxCount: 20 },
]);

/**
 * Chuẩn hóa và kiểm tra hợp lệ dữ liệu đầu vào của Project.
 * @param {Record<string, any>} raw
 * @param {Record<string, any>} [files]
 * @param {import("express").Request|null} [req]
 * @returns {Record<string, any>}
 */
export function normalizeProjectInput(raw = {}, files = {}, req = null) {
  const result = { ...raw };

  // Giới hạn price_tier vào đúng 2 phân khúc được hỗ trợ
  if ("price_tier" in raw && raw.price_tier !== undefined && raw.price_tier !== null && raw.price_tier !== "") {
    if (!["standard", "premium"].includes(raw.price_tier)) {
      const err = new Error("Hạng mục giá không hợp lệ.");
      err.status = 400;
      throw err;
    }
    result.price_tier = raw.price_tier;
  }

  // Ưu tiên ảnh bìa upload mới từ multipart
  if (files && files["image"] && files["image"][0]) {
    result.cover_image = publicUrlFor(req, files["image"][0]);
  }

  // Chuẩn hóa danh sách tag phong cách
  if ("style_tags" in raw && raw.style_tags !== undefined && raw.style_tags !== null) {
    result.style_tags = parseArrayField(raw.style_tags);
  }

  // Ghép ảnh gallery cũ (nếu giữ) với ảnh upload mới trong lượt gửi này
  const hasGalleryRaw = "gallery" in raw && raw.gallery !== undefined && raw.gallery !== null;
  const hasGalleryFiles = Boolean(
    files && files["gallery_files"] && Array.isArray(files["gallery_files"]) && files["gallery_files"].length > 0
  );
  if (hasGalleryRaw || hasGalleryFiles) {
    let galleryList = hasGalleryRaw ? parseArrayField(raw.gallery) : [];
    if (hasGalleryFiles) {
      const uploadedUrls = files["gallery_files"].map((f) => publicUrlFor(req, f)).filter(Boolean);
      galleryList = [...galleryList, ...uploadedUrls];
    }
    result.gallery = galleryList;
  }

  // Đồng bộ hai chiều giữa status và published để client nhận đúng trạng thái
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

/**
 * Tạo mới dự án và lưu vào DB (id, created_at, updated_at do DB tự quản lý).
 * @param {Record<string, any>} data
 * @param {Record<string, any>} [files]
 * @param {import("express").Request|null} [req]
 * @returns {Promise<Record<string, any>>}
 */
export async function createProject(data = {}, files = {}, req = null) {
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

  const project = await db.insert("projects", projectData);
  return project;
}

/**
 * Cập nhật dự án và dọn rác các file ảnh không còn được dùng.
 * @param {string} id
 * @param {Record<string, any>} data
 * @param {Record<string, any>} [files]
 * @param {import("express").Request|null} [req]
 * @returns {Promise<Record<string, any>>}
 */
export async function updateProject(id, data = {}, files = {}, req = null) {
  const existing = await db.findById("projects", id);
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

  // Dọn file ảnh bìa cũ trên đĩa/Cloudinary khi thay ảnh mới
  if (patch.cover_image !== undefined) {
    await cleanupRemovedMedia(existing.cover_image, patch.cover_image);
  }

  // Dọn những ảnh đã bị loại bỏ khỏi gallery
  if (patch.gallery !== undefined) {
    await cleanupRemovedMedia(existing.gallery, patch.gallery);
  }

  const updated = await db.updateById("projects", id, patch);
  return updated;
}

/**
 * Xóa dự án và toàn bộ tài nguyên hình ảnh đi kèm.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteProject(id) {
  const existing = await db.findById("projects", id);
  if (!existing) {
    return false;
  }

  const removed = await db.removeById("projects", id);
  if (!removed) {
    return false;
  }

  await deleteMediaOf(existing, "cover_image", "gallery");
  return true;
}
