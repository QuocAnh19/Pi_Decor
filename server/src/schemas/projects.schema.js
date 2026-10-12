import { z } from "zod";
import { parseArrayField } from "../utils/parseArrayField.js";

/**
 * Schema kiểm thực tạo mới dự án (Portfolio / Case Study).
 * price_tier giới hạn trong 'standard' | 'premium'.
 * status giới hạn trong 'active' | 'featured' | 'draft'.
 */
export const createProjectSchema = z.object({
  title: z
    .string({ required_error: "Thiếu tên dự án." })
    .trim()
    .min(1, "Thiếu tên dự án."),
  venue_id: z.string().trim().nullable().optional(),
  wedding_date: z.string().trim().nullable().optional(),
  style_tags: z.preprocess((val) => parseArrayField(val), z.array(z.string())).optional(),
  gallery: z.preprocess((val) => parseArrayField(val), z.array(z.string())).optional(),
  lead_id: z.string().trim().nullable().optional(),
  published: z
    .preprocess(
      (val) => (val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val)),
      z.boolean()
    )
    .optional(),
  location: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  budget: z.string().trim().nullable().optional(),
  status: z
    .enum(["active", "featured", "draft"], {
      errorMap: () => ({ message: "Trạng thái không hợp lệ." }),
    })
    .optional(),
  category_id: z.string().trim().nullable().optional(),
  tag: z.string().trim().nullable().optional(),
  price_tier: z
    .enum(["standard", "premium"], {
      errorMap: () => ({ message: "Hạng mục giá không hợp lệ." }),
    })
    .optional(),
  cover_image: z.string().trim().nullable().optional(),
});

/**
 * Schema cập nhật dự án (PATCH) - cho phép sửa từng trường và loại bỏ trường lạ.
 */
export const updateProjectSchema = createProjectSchema.partial();
