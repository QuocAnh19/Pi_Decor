import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createTestimonialSchema, updateTestimonialSchema } from "../../schemas/testimonials.schema.js";
import { uploadImage, publicUrlFor } from "../../utils/uploadImage.js";
import { cleanupRemovedMedia } from "../../services/media.service.js";
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
  updateSchema: updateTestimonialSchema,
  notFoundMessage: "Không tìm thấy đánh giá.",
  createHandler: false, // public creation with multiple photos handled below
  listHandler: async (_req, res) => {
    // API công khai: chỉ trả đánh giá đã duyệt (approved), loại bỏ lead_id và trường nội bộ (status, source)
    const rows = await db.query(
      `select id, author, role, quote, rating, photos, created_at, updated_at
       from testimonials
       where status = 'approved'
       order by created_at desc`
    );
    const publicList = rows.map((t) => ({
      ...t,
      photos: safeParsePhotos(t.photos),
    }));
    res.json(publicList);
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

      await cleanupRemovedMedia(existing.photos, patch.photos);
    }

    return patch;
  },
});

// ── Route riêng: Public Form Submission with Multiple Photos ─────────────────
// POST /api/testimonials — public form submission, ALWAYS forces status='pending', source='customer'
testimonialsRouter.post("/", testimonialLimiter, uploadImage.array("photos", 3), validate(createTestimonialSchema), async (req, res) => {
  const { author, role, quote, rating, lead_id } = req.body ?? {};

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

  const testimonialData = {
    lead_id: lead_id ?? null,
    author: String(author).trim(),
    role: role ? String(role).trim() : null,
    quote: String(quote).trim(),
    rating: numRating,
    photos: photoList,
    status: "pending",   // Always force pending for public submissions
    source: "customer",  // Always force customer
  };

  const created = await db.insert("testimonials", testimonialData);
  res.status(201).json(created);
});

// ── Route riêng: Admin List with Status Filter ───────────────────────────────
// GET /api/testimonials/admin — admin only, get all testimonials (optional ?status= filter)
testimonialsRouter.get("/admin", verifyToken, requireAdmin, async (req, res) => {
  let rows;
  if (req.query.status) {
    rows = await db.query(
      `select * from testimonials where status = $1 order by created_at desc`,
      [String(req.query.status).trim()]
    );
  } else {
    rows = await db.query(
      `select * from testimonials order by created_at desc`
    );
  }
  const formatted = rows.map((t) => ({
    ...t,
    photos: safeParsePhotos(t.photos),
  }));
  res.json(formatted);
});
