import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string({ required_error: "Thiếu tên hoặc số điện thoại." }).min(1, "Thiếu tên hoặc số điện thoại."),
  phone: z.string({ required_error: "Thiếu tên hoặc số điện thoại." }).min(1, "Thiếu tên hoặc số điện thoại."),
  email: z.string().nullable().optional(),
  wedding_date: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  design_snapshot: z.unknown().nullable().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"], {
    errorMap: () => ({ message: "Trạng thái không hợp lệ." }),
  }),
});
