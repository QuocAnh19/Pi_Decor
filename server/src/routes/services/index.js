import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";

export const servicesRouter = Router();

// GET /api/services — public, backs the Bento Services grid.
servicesRouter.get("/", async (_req, res) => {
  const services = await db.get("services");
  res.json([...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
});

servicesRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { title, description, image_url, order } = req.body ?? {};
  if (!title) return res.status(400).json({ message: "Thiếu tiêu đề dịch vụ." });
  const service = { id: uuid(), title, description: description ?? "", image_url: image_url ?? null, order: order ?? 0 };
  await db.insert("services", service);
  res.status(201).json(service);
});

servicesRouter.patch("/:id", verifyToken, requireAdmin, async (req, res) => {
  const updated = await db.update("services", (s) => s.id === req.params.id, req.body ?? {});
  if (!updated) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
  res.json(updated);
});

servicesRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("services", (s) => s.id === req.params.id);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
  res.status(204).send();
});
