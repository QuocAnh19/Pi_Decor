import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { uploadImage, publicUrlFor, deleteMultipleImageFiles } from "../../utils/uploadImage.js";
import { testimonialLimiter } from "../../middlewares/rateLimiters.js";
import { createCrudRouter } from "../../utils/crudRouterFactory.js";

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

export const testimonialsRouter = createCrudRouter({
  table: "testimonials",
  listPublic: true,
  notFoundMessage: "Không tìm thấy đánh giá.",
  createHandler: false, // public creation with multiple photos handled below
  transformOnList: (testimonials) => {
    return testimonials
      .filter((t) => t.status === "approved")
      .map((t) => ({
        ...t,
        photos: safeParsePhotos(t.photos),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  transformOnUpdate: async (patch, existing) => {
    if (patch.status && !["pending", "approved", "rejected"].includes(patch.status)) {
      const err = new Error("Trạng thái phê duyệt không hợp lệ.");
      err.status = 400;
      throw err;
    }

    if (patch.photos && Array.isArray(patch.photos)) {
      const containsBase64 = patch.photos.some((p) => typeof p === "string" && p.startsWith("data:"));
      if (containsBase64) {
        const err = new Error("Không chấp nhận ảnh chuỗi base64 Data URL.");
        err.status = 400;
        throw err;
      }

      const existingPhotos = safeParsePhotos(existing.photos);
      const removedPhotos = existingPhotos.filter((oldP) => !patch.photos.includes(oldP));
      if (removedPhotos.length > 0) {
        await deleteMultipleImageFiles(removedPhotos);
      }
    }

    return patch;
  },
});

// ── Route riêng: Public Form Submission with Multiple Photos ─────────────────
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

// ── Route riêng: Admin List with Status Filter ───────────────────────────────
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
