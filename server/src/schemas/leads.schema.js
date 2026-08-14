import { z } from "zod";

// Regex VN: bắt đầu bằng 0 hoặc +84, theo sau là 8–10 chữ số
const VN_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;

export const createLeadSchema = z.object({
  name: z.string({ required_error: "Thiếu tên." })
          .min(1, "Thiếu tên.")
          .max(100, "Tên quá dài."),

  phone: z.string({ required_error: "Thiếu số điện thoại." })
           .min(1, "Thiếu số điện thoại.")
           .transform((v) => v.replace(/\s+/g, ""))  // bỏ khoảng trắng
           .pipe(
             z.string().regex(VN_PHONE_REGEX, "Số điện thoại không đúng định dạng VN.")
           ),

  email: z.union([z.string().email("Email không hợp lệ."), z.literal(""), z.null()])
           .optional()
           .transform((v) => (v && typeof v === "string" && v.trim() !== "" ? v.trim() : null)),

  wedding_date: z.string().nullable().optional(),
  message: z.string().max(2000, "Nội dung lời nhắn tối đa 2000 ký tự.").nullable().optional(),
  design_snapshot: z.unknown().nullable().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"], {
    errorMap: () => ({ message: "Trạng thái không hợp lệ." }),
  }),
});
