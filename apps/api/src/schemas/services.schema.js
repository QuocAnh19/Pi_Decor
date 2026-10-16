import { z } from "zod";
import { parseArrayField } from "../utils/parseArrayField.js";

/**
 * Schema kiểm thực dữ liệu tạo mới dịch vụ Bento Services.
 * Dùng preprocess để chấp nhận items gửi dưới dạng JSON string hoặc CSV.
 */
export const createServiceSchema = z.object({
  brand: z.string().trim().optional(),
  title: z
    .string({ required_error: "Thiếu tiêu đề dịch vụ." })
    .trim()
    .min(1, "Thiếu tiêu đề dịch vụ."),
  tagline: z.string().trim().optional(),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  accent: z.string().trim().optional(),
  items: z.preprocess((val) => parseArrayField(val), z.array(z.string())).optional(),
  href: z.string().trim().nullable().optional(),
  cta_label: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  featured: z
    .preprocess(
      (val) =>
        val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val),
      z.boolean()
    )
    .optional(),
  cover: z.string().trim().nullable().optional(),
  image_url: z.string().trim().nullable().optional(),
  order: z.coerce.number().int().optional(),
});

/**
 * Schema cập nhật dịch vụ - cho phép cập nhật từng phần (PATCH).
 */
export const updateServiceSchema = createServiceSchema.partial();
