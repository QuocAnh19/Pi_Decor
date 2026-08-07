import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";

export const materialsRouter = Router();

// GET /api/materials — public, replaces the static materials.json the
// Studio used to import at build time (Mục 1.1 of the technical proposal:
// "mỗi lần muốn đổi ảnh mẫu... đều phải sửa code và deploy lại").
materialsRouter.get("/", async (_req, res) => {
  res.json(await db.get("materials"));
});

// POST /api/materials — admin only, optional image upload.
materialsRouter.post("/", verifyToken, requireAdmin, uploadImage.single("image"), async (req, res) => {
  const { name, category, color_hex } = req.body ?? {};
  if (!name || !category) {
    return res.status(400).json({ message: "Thiếu tên hoặc danh mục." });
  }
  const material = {
    id: uuid(),
    name,
    category, // "fabric" | "flowers" | "arch" | ...
    color_hex: color_hex ?? null,
    image_url: req.file ? publicUrlFor(req, req.file.filename) : null,
  };
  await db.insert("materials", material);
  res.status(201).json(material);
});

// PATCH /api/materials/:id — admin only, edit fields and/or replace image.
materialsRouter.patch("/:id", verifyToken, requireAdmin, uploadImage.single("image"), async (req, res) => {
  const patch = { ...req.body };
  if (req.file) patch.image_url = publicUrlFor(req, req.file.filename);
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
