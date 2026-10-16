import { Router } from "express";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createServiceSchema, updateServiceSchema } from "../../schemas/services.schema.js";
import { cleanupRemovedMedia, deleteMediaOf } from "../../services/media.service.js";

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

servicesRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  validate(createServiceSchema),
  async (req, res) => {
    const {
      brand,
      title,
      tagline,
      description,
      icon,
      accent,
      items,
      href,
      ctaLabel,
      cta_label,
      featured,
      cover,
      order,
      image_url,
    } = req.body ?? {};

    const serviceData = {
      brand: brand || title,
      title: title.trim(),
      tagline: tagline || "",
      description: description || "",
      icon: icon || "HeartIcon",
      accent: accent || "wedding",
      items: Array.isArray(items) ? items : [],
      href: href || null,
      cta_label: cta_label || ctaLabel || "Liên hệ tư vấn",
      featured: Boolean(featured),
      cover: cover || image_url || null,
      order: Number(order ?? 0),
    };

    const created = await db.insert("services", serviceData);
    res.status(201).json(formatService(created));
  }
);

servicesRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validate(updateServiceSchema),
  async (req, res) => {
    const services = await db.get("services");
    const existing = services.find((s) => s.id === req.params.id);
    if (!existing) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });

    const patch = { ...req.body };
    if (patch.ctaLabel) {
      patch.cta_label = patch.ctaLabel;
      delete patch.ctaLabel;
    }

    const newCover = patch.cover || patch.image_url;
    const oldCover = existing.cover || existing.image_url;
    if (newCover !== undefined && oldCover) {
      await cleanupRemovedMedia(oldCover, newCover);
    }

    const updated = await db.updateById("services", req.params.id, patch);
    res.json(formatService(updated));
  }
);

servicesRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const services = await db.get("services");
  const existing = services.find((s) => s.id === req.params.id);

  const removed = await db.removeById("services", req.params.id);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });

  if (existing) {
    await deleteMediaOf(existing, "cover", "image_url", "icon");
  }

  res.status(204).send();
});
