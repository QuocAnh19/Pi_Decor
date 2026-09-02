import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { uploadImage, publicUrlFor, deleteImageFile, deleteMultipleImageFiles } from "../../utils/uploadImage.js";

export const projectsRouter = Router();

// GET /api/projects — public, list all projects
projectsRouter.get("/", async (_req, res) => {
  const projects = await db.get("projects");
  const sorted = [...projects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(sorted);
});

const projectUpload = uploadImage.fields([
  { name: "image", maxCount: 1 },
  { name: "gallery_files", maxCount: 20 },
]);

// POST /api/projects — admin only, create a new project
projectsRouter.post("/", verifyToken, requireAdmin, projectUpload, async (req, res) => {
  const {
    title,
    venue_id,
    wedding_date,
    style_tags,
    cover_image,
    gallery,
    lead_id,
    published,
    location,
    description,
    budget,
    status,
    category_id,
    tag,
    price_tier,
  } = req.body ?? {};

  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Thiếu tên dự án." });
  }

  let finalPriceTier = "standard";
  if (price_tier !== undefined && price_tier !== null && price_tier !== "") {
    if (!["standard", "premium"].includes(price_tier)) {
      return res.status(400).json({ message: "Hạng mục giá không hợp lệ." });
    }
    finalPriceTier = price_tier;
  }

  let finalCoverImage = cover_image ?? null;
  if (req.files && req.files["image"] && req.files["image"][0]) {
    finalCoverImage = publicUrlFor(req, req.files["image"][0]);
  }

  let parsedTags = [];
  if (Array.isArray(style_tags)) {
    parsedTags = style_tags;
  } else if (typeof style_tags === "string") {
    try {
      parsedTags = JSON.parse(style_tags);
    } catch {
      parsedTags = style_tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  let parsedGallery = [];
  if (Array.isArray(gallery)) {
    parsedGallery = gallery;
  } else if (typeof gallery === "string") {
    try {
      parsedGallery = JSON.parse(gallery);
    } catch {
      parsedGallery = gallery.split(",").map((g) => g.trim()).filter(Boolean);
    }
  }

  if (req.files && req.files["gallery_files"] && Array.isArray(req.files["gallery_files"])) {
    const uploadedUrls = req.files["gallery_files"].map((f) => publicUrlFor(req, f));
    parsedGallery = [...parsedGallery, ...uploadedUrls];
  }

  const project = {
    id: uuid(),
    venue_id: venue_id || null,
    title: title.trim(),
    wedding_date: wedding_date || null,
    style_tags: parsedTags,
    cover_image: finalCoverImage,
    gallery: parsedGallery,
    lead_id: lead_id || null,
    published: published === "false" ? false : Boolean(published ?? true),
    location: location || null,
    description: description || null,
    budget: budget || null,
    status: status || (published === "false" ? "draft" : "active"),
    category_id: category_id || parsedTags[0] || "piwedding",
    tag: tag || parsedTags[1] || "Gia Tiên",
    price_tier: finalPriceTier,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert("projects", project);
  res.status(201).json(project);
});

// PATCH /api/projects/:id — admin only, update project
projectsRouter.patch("/:id", verifyToken, requireAdmin, projectUpload, async (req, res) => {
  const projects = await db.get("projects");
  const existing = projects.find((p) => p.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy dự án." });
  }

  const patch = { ...req.body };

  if ("price_tier" in patch && patch.price_tier !== undefined && patch.price_tier !== null && patch.price_tier !== "") {
    if (!["standard", "premium"].includes(patch.price_tier)) {
      return res.status(400).json({ message: "Hạng mục giá không hợp lệ." });
    }
  }

  if (req.files && req.files["image"] && req.files["image"][0]) {
    patch.cover_image = publicUrlFor(req, req.files["image"][0]);
    if (existing.cover_image && existing.cover_image !== patch.cover_image) {
      await deleteImageFile(existing.cover_image);
    }
  }

  if (patch.style_tags && typeof patch.style_tags === "string") {
    try {
      patch.style_tags = JSON.parse(patch.style_tags);
    } catch {
      patch.style_tags = patch.style_tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }

  let parsedGallery = [];
  if (patch.gallery) {
    if (Array.isArray(patch.gallery)) {
      parsedGallery = patch.gallery;
    } else if (typeof patch.gallery === "string") {
      try {
        parsedGallery = JSON.parse(patch.gallery);
      } catch {
        parsedGallery = patch.gallery.split(",").map((g) => g.trim()).filter(Boolean);
      }
    }
  }

  if (req.files && req.files["gallery_files"] && Array.isArray(req.files["gallery_files"])) {
    const uploadedUrls = req.files["gallery_files"].map((f) => publicUrlFor(req, f));
    parsedGallery = [...parsedGallery, ...uploadedUrls];
  }

  if (patch.gallery || (req.files && req.files["gallery_files"])) {
    patch.gallery = parsedGallery;

    // Delete any gallery images that were removed in the patch
    if (Array.isArray(existing.gallery)) {
      const removedImages = existing.gallery.filter((oldImg) => !parsedGallery.includes(oldImg));
      if (removedImages.length > 0) {
        await deleteMultipleImageFiles(removedImages);
      }
    }
  }

  if ("published" in patch) {
    patch.published = patch.published === "true" || patch.published === true;
  }

  patch.updated_at = new Date().toISOString();

  const updated = await db.updateById("projects", req.params.id, patch);
  res.json(updated);
});

// DELETE /api/projects/:id — admin only, delete project
projectsRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const projects = await db.get("projects");
  const existing = projects.find((p) => p.id === req.params.id);

  const removed = await db.removeById("projects", req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy dự án." });
  }

  if (existing) {
    if (existing.cover_image) {
      await deleteImageFile(existing.cover_image);
    }
    if (Array.isArray(existing.gallery)) {
      await deleteMultipleImageFiles(existing.gallery);
    }
  }

  res.status(204).send();
});
