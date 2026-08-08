import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";

export const materialsRouter = Router();

const ALLOWED_CATEGORIES = new Set([
  "fabric",
  "flowers",
  "arch",
  "lighting",
  "drape",
  "drape_detail",
  "flower",
  "text_name",
  "text_date",
  "color_accent",
  "prop",
]);

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// GET /api/materials — public, filter by ?category=...
materialsRouter.get("/", async (req, res) => {
  let list = await db.get("materials");
  if (req.query.category) {
    const cat = String(req.query.category).trim();
    list = list.filter((m) => m.category === cat);
  }
  res.json(list);
});

// POST /api/materials — admin only, optional image upload.
materialsRouter.post("/", verifyToken, requireAdmin, uploadImage.single("image"), async (req, res) => {
  const { name, category, color_hex } = req.body ?? {};
  if (!name || !category) {
    return res.status(400).json({ message: "Thiếu tên hoặc danh mục." });
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return res.status(400).json({ message: "Danh mục không hợp lệ." });
  }

  if (color_hex && !HEX_COLOR_REGEX.test(color_hex)) {
    return res.status(400).json({ message: "Mã màu color_hex không hợp lệ (cần định dạng #RRGGBB)." });
  }

  const material = {
    id: uuid(),
    name,
    category,
    color_hex: color_hex ?? null,
    image_url: req.file ? publicUrlFor(req, req.file) : null,
  };
  await db.insert("materials", material);
  res.status(201).json(material);
});

// PATCH /api/materials/:id — admin only, edit fields and/or replace image.
materialsRouter.patch("/:id", verifyToken, requireAdmin, uploadImage.single("image"), async (req, res) => {
  const patch = { ...req.body };
  if (patch.category && !ALLOWED_CATEGORIES.has(patch.category)) {
    return res.status(400).json({ message: "Danh mục không hợp lệ." });
  }
  if (patch.color_hex && !HEX_COLOR_REGEX.test(patch.color_hex)) {
    return res.status(400).json({ message: "Mã màu color_hex không hợp lệ (cần định dạng #RRGGBB)." });
  }

  if (req.file) patch.image_url = publicUrlFor(req, req.file);
  const updated = await db.update("materials", (m) => m.id === req.params.id, patch);
  if (!updated) return res.status(404).json({ message: "Không tìm thấy vật liệu." });
  res.json(updated);
});

// DELETE /api/materials/:id — admin only.
materialsRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("materials", (m) => m.id === req.params.id);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy vật liệu." });
  res.status(204).send();
});
