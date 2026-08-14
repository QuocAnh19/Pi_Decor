import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { uploadImage, publicUrlFor, deleteImageFile } from "../../utils/uploadImage.js";

export const materialsRouter = Router();

const CATEGORY_MAP = {
  "rèm nền": "fabric",
  "rèm chi tiết": "drape_detail",
  "cụm hoa": "flowers",
  "dãy chữ số": "text_name",
};

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

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
function generateUniqueName(existingMaterials, targetName, currentId = null) {
  const trimmed = String(targetName).trim();
  const isDuplicate = existingMaterials.some(
    (m) => String(m.id) !== String(currentId) && m.name.toLowerCase().trim() === trimmed.toLowerCase()
  );
  if (!isDuplicate) return trimmed;

  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${trimmed} (${suffix})`;
}

// GET /api/materials — public, filter by ?category=...
materialsRouter.get("/", async (req, res) => {
  let list = await db.get("materials");
  if (req.query.category) {
    const cat = String(req.query.category).trim().toLowerCase();
    list = list.filter((m) => m.category === cat || m.category === CATEGORY_MAP[cat]);
  }
  res.json(list);
});

// POST /api/materials — admin only, optional image upload.
materialsRouter.post("/", verifyToken, requireAdmin, uploadImage.single("image"), async (req, res) => {
  const { name, category, color_hex } = req.body ?? {};
  if (!name) {
    return res.status(400).json({ message: "Vui lòng nhập tên vật liệu." });
  }

  const categoryToUse = normalizeCategory(category);

  if (color_hex && !HEX_COLOR_REGEX.test(color_hex)) {
    return res.status(400).json({ message: "Mã màu color_hex không hợp lệ (cần định dạng #RRGGBB)." });
  }

  const existingMaterials = await db.get("materials");
  const finalName = generateUniqueName(existingMaterials, name);

  const material = {
    id: uuid(),
    name: finalName,
    category: categoryToUse,
    color_hex: color_hex ?? null,
    image_url: req.file ? publicUrlFor(req, req.file) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert("materials", material);
  res.status(201).json(material);
});

// PATCH /api/materials/:id — admin only, edit fields and/or replace image.
materialsRouter.patch("/:id", verifyToken, requireAdmin, uploadImage.single("image"), async (req, res) => {
  const existingMaterials = await db.get("materials");
  const existing = existingMaterials.find((m) => String(m.id) === String(req.params.id));
  if (!existing) return res.status(404).json({ message: "Không tìm thấy vật liệu." });

  const patch = { ...req.body, updated_at: new Date().toISOString() };
  if (patch.category) {
    patch.category = normalizeCategory(patch.category);
  }
  if (patch.color_hex && !HEX_COLOR_REGEX.test(patch.color_hex)) {
    return res.status(400).json({ message: "Mã màu color_hex không hợp lệ (cần định dạng #RRGGBB)." });
  }

  if (patch.name) {
    patch.name = generateUniqueName(existingMaterials, patch.name, req.params.id);
  }

  if (req.file) {
    patch.image_url = publicUrlFor(req, req.file);
    if (existing.image_url && existing.image_url !== patch.image_url) {
      await deleteImageFile(existing.image_url);
    }
  }

  const updated = await db.update("materials", (m) => String(m.id) === String(req.params.id), patch);
  res.json(updated);
});

// DELETE /api/materials/:id — admin only.
materialsRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const targetId = req.params.id;
  const existingMaterials = await db.get("materials");
  const existing = existingMaterials.find((m) => String(m.id) === String(targetId));

  const removed = await db.remove("materials", (m) => String(m.id) === String(targetId));
  if (!removed) return res.status(404).json({ message: "Không tìm thấy vật liệu." });

  if (existing?.image_url) {
    await deleteImageFile(existing.image_url);
  }

  res.status(204).send();
});
