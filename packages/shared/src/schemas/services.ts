import { z } from "zod";

/**
 * Các phân hệ nhãn hiệu dịch vụ cốt lõi của Pi Decor.
 */
export const serviceAccentEnum = z.enum(["kids", "wedding", "event"]);
export type ServiceAccentDto = z.infer<typeof serviceAccentEnum>;

/**
 * Schema kiểm thực dữ liệu tạo mới dịch vụ Bento Services.
 * Hỗ trợ preprocess items gửi dưới dạng JSON string, CSV hoặc mảng chuỗi.
 */
export const createServiceSchema = z.object({
  title: z
    .string({ required_error: "Thiếu tiêu đề dịch vụ." })
    .trim()
    .min(1, "Thiếu tiêu đề dịch vụ."),
  brand: z.string().trim().optional(),
  tagline: z.string().trim().optional(),
  description: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  accent: z.string().trim().optional(),
  items: z
    .preprocess((val) => {
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            return parsed.map((s) => String(s).trim()).filter(Boolean);
          }
        } catch {
          return val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      return val;
    }, z.array(z.string()))
    .optional(),
  href: z.string().trim().nullable().optional(),
  cta_label: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  featured: z
    .preprocess(
      (val) =>
        val === undefined || val === null
          ? undefined
          : val === "false" || val === false
            ? false
            : Boolean(val),
      z.boolean()
    )
    .optional(),
  cover: z.string().trim().nullable().optional(),
  image_url: z.string().trim().nullable().optional(),
  order: z.coerce.number().int().optional(),
});

/**
 * Schema cập nhật dịch vụ từng phần (PATCH).
 */
export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
