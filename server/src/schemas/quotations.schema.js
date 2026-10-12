import { z } from "zod";

/**
 * Schema kiểm thực từng hạng mục chi phí trong báo giá.
 * Số lượng và đơn giá phải không âm.
 */
export const quotationItemSchema = z.object({
  description: z.string().trim().default(""),
  quantity: z.coerce.number().min(0, "Số lượng phải >= 0").default(1),
  unit_price: z.coerce.number().min(0, "Đơn giá phải >= 0").default(0),
});

/**
 * Schema tạo mới báo giá cho lead.
 * Bắt buộc lead_id và danh sách items tối thiểu 1 phần tử.
 */
export const createQuotationSchema = z.object({
  lead_id: z
    .string({ required_error: "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)." })
    .trim()
    .min(1, "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)."),
  items: z
    .array(quotationItemSchema, { required_error: "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)." })
    .min(1, "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)."),
  discount: z.coerce.number().min(0, "Giảm giá phải >= 0").optional(),
  valid_until: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

/**
 * Schema cập nhật báo giá (PATCH).
 * Ánh xạ 'rejected' thành 'declined' để đồng bộ với CHECK constraint của migration 0014.
 */
export const updateQuotationSchema = z.object({
  items: z.array(quotationItemSchema).optional(),
  discount: z.coerce.number().min(0, "Giảm giá phải >= 0").optional(),
  status: z
    .preprocess(
      (val) => (val === "rejected" ? "declined" : val),
      z.enum(["draft", "sent", "accepted", "declined", "expired"], {
        errorMap: () => ({ message: "Trạng thái báo giá không hợp lệ." }),
      })
    )
    .optional(),
  valid_until: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});
