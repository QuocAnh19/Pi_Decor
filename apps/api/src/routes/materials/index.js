import { Router } from "express";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createMaterialSchema, updateMaterialSchema } from "../../schemas/materials.schema.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../services/media.service.js";

export const materialsRouter = Router();

const CATEGORY_MAP = {
  "rèm nền": "fabric",
  "rèm chi tiết": "drape_detail",
  "cụm hoa": "flowers",
  "dãy chữ số": "text_name",
};

/**
 * Normalizes category input. Maps Vietnamese aliases to internal keys.
 */
function normalizeCategory(catInput) {
  if (!catInput) return "fabric";
  const str = String(catInput).trim().toLowerCase();
  if (CATEGORY_MAP[str]) return CATEGORY_MAP[str];
  return str;
}

/**
 * Appends a unique 4-character suffix if a material with the same name already exists.
 */
async function generateUniqueName(targetName, currentId = null) {
  const trimmed = String(targetName).trim();
  const duplicate = await db.query(
    `select id from materials where lower(trim(name)) = lower(trim($1)) and ($2::uuid is null or id <> $2::uuid) limit 1`,
    [trimmed, currentId]
  );
  if (duplicate.length === 0) return trimmed;

  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${trimmed} (${suffix})`;
}

// GET /api/materials — public, filter by ?category=...
materialsRouter.get("/", async (req, res) => {
  if (req.query.category) {
    const cat = String(req.query.category).trim().toLowerCase();
    const mapped = CATEGORY_MAP[cat] || cat;
    const list = await db.query(
      `select * from materials where category = $1 or category = $2 order by created_at asc`,
      [cat, mapped]
    );
    return res.json(list);
  }
  const list = await db.query(`select * from materials order by created_at asc`);
  res.json(list);
});

// POST /api/materials — admin only, optional image upload.
materialsRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  uploadImage.single("image"),
  validate(createMaterialSchema),
  async (req, res) => {
    const { name, category, color_hex } = req.body ?? {};

    const categoryToUse = normalizeCategory(category);
    const finalName = await generateUniqueName(name);

    const materialData = {
      name: finalName,
      category: categoryToUse,
      color_hex: color_hex ?? null,
      image_url: req.file ? publicUrlFor(req, req.file) : null,
    };

    const created = await db.insert("materials", materialData);
    res.status(201).json(created);
  }
);

// PATCH /api/materials/:id — admin only, edit fields and/or replace image.
materialsRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  uploadImage.single("image"),
  validate(updateMaterialSchema),
  async (req, res) => {
    const existing = await db.findById("materials", req.params.id);
    if (!existing) return res.status(404).json({ message: "Không tìm thấy vật liệu." });

    const patch = { ...req.body };
    if (patch.category) {
      patch.category = normalizeCategory(patch.category);
    }

    if (patch.name) {
      patch.name = await generateUniqueName(patch.name, req.params.id);
    }

    if (req.file) {
      patch.image_url = publicUrlFor(req, req.file);
      if (existing.image_url) {
        await cleanupRemovedMedia(existing.image_url, patch.image_url);
      }
    }

    const updated = await db.updateById("materials", req.params.id, patch);
    res.json(updated);
  }
);

// DELETE /api/materials/:id — admin only.
materialsRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const targetId = req.params.id;
  const existing = await db.findById("materials", targetId);
  if (!existing) return res.status(404).json({ message: "Không tìm thấy vật liệu." });

  const removed = await db.removeById("materials", targetId);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy vật liệu." });

  await deleteMediaOf(existing, "image_url");

  res.status(204).send();
});
