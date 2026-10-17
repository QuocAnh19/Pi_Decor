import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.string({ required_error: "Thiếu ID." }).uuid("ID phải là định dạng UUID hợp lệ."),
});

export const adminIdParamSchema = uuidParamSchema;

export const slotIdParamSchema = z.object({
  slotId: z.string({ required_error: "Thiếu slot ID." }).uuid("ID phải là định dạng UUID hợp lệ."),
});

export type UuidParamDto = z.infer<typeof uuidParamSchema>;
export type AdminIdParamDto = z.infer<typeof adminIdParamSchema>;
export type SlotIdParamDto = z.infer<typeof slotIdParamSchema>;
