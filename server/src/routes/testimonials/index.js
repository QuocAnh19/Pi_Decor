import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";
import { testimonialLimiter } from "../../middlewares/rateLimiters.js";

export const testimonialsRouter = Router();

function safeParsePhotos(photos) {
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

// GET /api/testimonials — public, returns approved testimonials only (newest first)
testimonialsRouter.get("/", async (_req, res) => {
  const testimonials = await db.get("testimonials");
  const approved = testimonials
    .filter((t) => t.status === "approved")
    .map((t) => ({
      ...t,
      photos: safeParsePhotos(t.photos),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(approved);
});

// POST /api/testimonials — public form submission, ALWAYS forces status='pending', source='customer'
testimonialsRouter.post("/", testimonialLimiter, uploadImage.array("photos", 3), async (req, res) => {
  const { author, role, quote, rating, lead_id } = req.body ?? {};

  if (!author || !quote) {
    return res.status(400).json({ message: "Thiếu tên tác giả hoặc nội dung đánh giá." });
  }

  const numRating = Math.min(5, Math.max(1, Number(rating ?? 5)));

  let photoList = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    photoList = req.files.map((f) => publicUrlFor(req, f));
  } else if (req.body.photos) {
    photoList = safeParsePhotos(req.body.photos);
  }

  // Reject raw Base64 data URLs to prevent database bloat
  const containsBase64 = photoList.some((p) => typeof p === "string" && p.startsWith("data:"));
  if (containsBase64) {
    return res.status(400).json({
      message: "Không chấp nhận ảnh chuỗi base64 Data URL. Vui lòng upload ảnh qua file upload.",
    });
  }

  const testimonial = {
    id: uuid(),
    lead_id: lead_id ?? null,
    author: String(author).trim(),
    role: role ? String(role).trim() : null,
    quote: String(quote).trim(),
    rating: numRating,
    photos: photoList,
    status: "pending",   // Always force pending for public submissions
    source: "customer",  // Always force customer
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await db.insert("testimonials", testimonial);
  res.status(201).json(testimonial);
});

// GET /api/testimonials/admin — admin only, get all testimonials (optional ?status= filter)
testimonialsRouter.get("/admin", verifyToken, requireAdmin, async (req, res) => {
  let list = await db.get("testimonials");
  if (req.query.status) {
    const st = String(req.query.status).trim();
    list = list.filter((t) => t.status === st);
  }
  const formatted = list
    .map((t) => ({
      ...t,
      photos: safeParsePhotos(t.photos),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(formatted);
});

// PATCH /api/testimonials/:id — admin only, approve/reject or edit testimonial
testimonialsRouter.patch("/:id", verifyToken, requireAdmin, async (req, res) => {
  const testimonials = await db.get("testimonials");
  const existing = testimonials.find((t) => t.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy đánh giá." });
  }

  const patch = { ...req.body };
  if (patch.status && !["pending", "approved", "rejected"].includes(patch.status)) {
    return res.status(400).json({ message: "Trạng thái phê duyệt không hợp lệ." });
  }

  if (patch.photos && Array.isArray(patch.photos)) {
    const containsBase64 = patch.photos.some((p) => typeof p === "string" && p.startsWith("data:"));
    if (containsBase64) {
      return res.status(400).json({ message: "Không chấp nhận ảnh chuỗi base64 Data URL." });
    }
  }

  const updated = await db.update("testimonials", (t) => t.id === req.params.id, patch);
  res.json(updated);
});

// DELETE /api/testimonials/:id — admin only
testimonialsRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const removed = await db.remove("testimonials", (t) => t.id === req.params.id);
  if (!removed) {
    return res.status(404).json({ message: "Không tìm thấy đánh giá." });
  }
  res.status(204).send();
});
