import { z } from "zod";
import { testimonialStatusEnum } from "../constants/enums.js";

function parsePhotos(photos: unknown): string[] {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos.map(String);
  if (typeof photos === "string") {
    try {
      const parsed = JSON.parse(photos);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return photos
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

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
  consent: z.preprocess(
    (v) => (v === true || v === "true" || v === 1 || v === "1" ? true : v),
    z.literal(true, {
      errorMap: () => ({ message: "Bạn phải đồng ý với chính sách xử lý dữ liệu cá nhân." }),
    })
  ),
  consent_version: z.string().default("v1.0"),
});

export const updateTestimonialSchema = z.object({
  status: testimonialStatusEnum.optional(),
  author: z.string().trim().min(1).optional(),
  quote: z.string().trim().min(1).optional(),
  role: z.string().trim().nullable().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  photos: z.preprocess((val) => parsePhotos(val), z.array(z.string())).optional(),
});

export type CreateTestimonialDto = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialDto = z.infer<typeof updateTestimonialSchema>;
