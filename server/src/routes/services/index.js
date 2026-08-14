import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { deleteImageFile } from "../../utils/uploadImage.js";

export const servicesRouter = Router();

function formatService(s) {
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

// GET /api/services — public, backs the Bento Services grid.
servicesRouter.get("/", async (_req, res) => {
  const services = await db.get("services");
  const sorted = [...services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json(sorted.map(formatService));
});

servicesRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  const { brand, title, tagline, description, icon, accent, items, href, ctaLabel, cta_label, featured, cover, order, image_url } = req.body ?? {};
  if (!title) return res.status(400).json({ message: "Thiếu tiêu đề dịch vụ." });

  const service = {
    id: uuid(),
    brand: brand || title,
    title: title.trim(),
    tagline: tagline || "",
    description: description || "",
    icon: icon || "HeartIcon",
    accent: accent || "wedding",
    items: Array.isArray(items) ? items : typeof items === "string" ? items.split(",").map((i) => i.trim()).filter(Boolean) : [],
    href: href || null,
    cta_label: cta_label || ctaLabel || "Liên hệ tư vấn",
    featured: Boolean(featured),
    cover: cover || image_url || null,
    order: Number(order ?? 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert("services", service);
  res.status(201).json(formatService(service));
});

servicesRouter.patch("/:id", verifyToken, requireAdmin, async (req, res) => {
  const services = await db.get("services");
  const existing = services.find((s) => s.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });

  const patch = { ...req.body };
  if (patch.ctaLabel) {
    patch.cta_label = patch.ctaLabel;
    delete patch.ctaLabel;
  }
  if (patch.items && typeof patch.items === "string") {
    try {
      patch.items = JSON.parse(patch.items);
    } catch {
      patch.items = patch.items.split(",").map((i) => i.trim()).filter(Boolean);
    }
  }

  const newCover = patch.cover || patch.image_url;
  const oldCover = existing.cover || existing.image_url;
  if (newCover && oldCover && newCover !== oldCover) {
    await deleteImageFile(oldCover);
  }

  patch.updated_at = new Date().toISOString();

  const updated = await db.updateById("services", req.params.id, patch);
  res.json(formatService(updated));
});

servicesRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const services = await db.get("services");
  const existing = services.find((s) => s.id === req.params.id);

  const removed = await db.removeById("services", req.params.id);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });

  if (existing) {
    if (existing.cover) await deleteImageFile(existing.cover);
    if (existing.image_url) await deleteImageFile(existing.image_url);
    if (existing.icon && existing.icon.startsWith("http")) await deleteImageFile(existing.icon);
  }

  res.status(204).send();
});
