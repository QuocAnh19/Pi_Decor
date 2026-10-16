import { z } from "zod";
import { quotationStatusEnum } from "../constants/enums.js";

export const quotationItemSchema = z.object({
  description: z.string().trim().default(""),
  quantity: z.coerce.number().min(0, "Số lượng phải >= 0").default(1),
  unit_price: z.coerce.number().min(0, "Đơn giá phải >= 0").default(0),
});

export const createQuotationSchema = z.object({
  lead_id: z
    .string({ required_error: "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)." })
    .trim()
    .min(1, "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)."),
  items: z
    .array(quotationItemSchema, {
      required_error: "Thiếu lead_id hoặc danh sách hạng mục báo giá (items).",
    })
    .min(1, "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)."),
  discount: z.coerce.number().min(0, "Giảm giá phải >= 0").optional(),
  valid_until: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateQuotationSchema = z.object({
  items: z.array(quotationItemSchema).optional(),
  discount: z.coerce.number().min(0, "Giảm giá phải >= 0").optional(),
  status: z
    .preprocess((val) => (val === "rejected" ? "declined" : val), quotationStatusEnum)
    .optional(),
  valid_until: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export type QuotationItemDto = z.infer<typeof quotationItemSchema>;
export type CreateQuotationDto = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationDto = z.infer<typeof updateQuotationSchema>;
