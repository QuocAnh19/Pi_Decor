import { z } from "zod";
import { VN_PHONE_REGEX, sanitizePhoneNumber } from "../constants/phone.js";
import { leadStatusEnum, leadActivityTypeEnum } from "../constants/enums.js";

export const createLeadSchema = z.object({
  name: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string({ required_error: "Thiếu tên." }).min(1, "Thiếu tên.").max(100, "Tên quá dài.")
  ),

  phone: z.preprocess(
    (v) => (typeof v === "string" ? sanitizePhoneNumber(v) : v),
    z
      .string({ required_error: "Thiếu số điện thoại." })
      .min(1, "Thiếu số điện thoại.")
      .regex(VN_PHONE_REGEX, "Số điện thoại không đúng định dạng (VD: 0905123456).")
  ),

  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
    z.string().email("Email không hợp lệ.").nullable().optional()
  ),

  wedding_date: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
    z.string().nullable().optional()
  ),

  message: z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
    z.string().max(2000, "Nội dung lời nhắn tối đa 2000 ký tự.").nullable().optional()
  ),

  design_snapshot: z.unknown().nullable().optional(),

  consent: z.preprocess(
    (v) => (v === true || v === "true" || v === 1 || v === "1" ? true : v),
    z.literal(true, {
      errorMap: () => ({ message: "Bạn phải đồng ý với chính sách xử lý dữ liệu cá nhân." }),
    })
  ),
  consent_version: z.string().default("v1.0"),
});

export const updateLeadStatusSchema = z.object({
  status: leadStatusEnum.optional(),
  design_snapshot: z.unknown().optional(),
});

export const createLeadActivitySchema = z.object({
  activity_type: leadActivityTypeEnum,
  body: z.string().max(2000, "Nội dung hoạt động tối đa 2000 ký tự.").nullable().optional(),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
export type UpdateLeadStatusDto = z.infer<typeof updateLeadStatusSchema>;
export type CreateLeadActivityDto = z.infer<typeof createLeadActivitySchema>;
