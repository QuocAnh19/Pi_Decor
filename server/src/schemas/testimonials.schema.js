import { z } from "zod";

function parsePhotos(photos) {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  if (typeof photos === "string") {
    try {
      const parsed = JSON.parse(photos);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return photos.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * Schema gửi đánh giá khách hàng (Public submit).
 * Bắt buộc tác giả và nội dung đánh giá.
 */
export const createTestimonialSchema = z.object({
  author: z
    .string({ required_error: "Thiếu tên tác giả hoặc nội dung đánh giá." })
    .trim()
    .min(1, "Thiếu tên tác giả hoặc nội dung đánh giá."),
  quote: z
    .string({ required_error: "Thiếu tên tác giả hoặc nội dung đánh giá." })
    .trim()
    .min(1, "Thiếu tên tác giả hoặc nội dung đánh giá."),
  role: z.string().trim().nullable().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  lead_id: z.string().trim().nullable().optional(),
  photos: z.preprocess((val) => parsePhotos(val), z.array(z.string())).optional(),
});

/**
 * Schema cập nhật đánh giá (Admin moderation).
 * Giới hạn status vào 'pending' | 'approved' | 'rejected'.
 */
export const updateTestimonialSchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected"], {
      errorMap: () => ({ message: "Trạng thái phê duyệt không hợp lệ." }),
    })
    .optional(),
  author: z.string().trim().min(1).optional(),
  quote: z.string().trim().min(1).optional(),
  role: z.string().trim().nullable().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  photos: z.preprocess((val) => parsePhotos(val), z.array(z.string())).optional(),
});
