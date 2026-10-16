import { z } from "zod";

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const createMaterialSchema = z.object({
  name: z.string({ required_error: "Thiếu tên vật liệu." }).min(1, "Thiếu tên vật liệu.").max(100),
  category: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  color_hex: z.string().regex(HEX_REGEX, "Mã màu phải dạng #RRGGBB.").nullable().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial();
