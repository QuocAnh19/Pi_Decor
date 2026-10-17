import { z } from "zod";

// ============================================================================
// 1. Studio Templates
// ============================================================================

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1, "Thiếu tên hoặc nội dung SVG của template.").optional(),
  svg_base: z.string().trim().min(1, "Thiếu tên hoặc nội dung SVG của template.").optional(),
  thumbnail: z.string().trim().nullable().optional(),
  category: z.string().trim().nullable().optional(),
  is_active: z
    .preprocess(
      (val) =>
        val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val),
      z.boolean()
    )
    .optional(),
  default_config: z.record(z.any()).optional(),
});

// ============================================================================
// 2. Studio Template Publish / Draft Save
// ============================================================================

/**
 * Schema cho từng slot khi publish template (chỉ chấp nhận snake_case khớp DB).
 */
export const publishSlotItemSchema = z.object({
  id: z.string().optional(),
  slot_key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  slot_type: z.string().default("drape"),
  norm_x: z.coerce.number().default(0.5),
  norm_y: z.coerce.number().default(0.5),
  norm_width: z.coerce.number().nullable().optional(),
  norm_height: z.coerce.number().nullable().optional(),
  allow_scale: z.coerce.boolean().default(true),
  allow_rotate: z.coerce.boolean().default(false),
  mirror_x: z.coerce.boolean().default(false),
  z_index: z.coerce.number().default(0),
  sort_order: z.coerce.number().default(0),
  required: z.coerce.boolean().default(false),
});

/**
 * Schema cho từng rule khi publish template (chỉ chấp nhận snake_case khớp DB).
 */
export const publishRuleItemSchema = z.object({
  id: z.string().optional(),
  rule_name: z.string().nullable().optional(),
  condition_slot: z.string().trim().min(1),
  condition_value: z.record(z.unknown()).default({}),
  target_slot: z.string().trim().min(1),
  action: z.string().trim().min(1),
  action_value: z.record(z.unknown()).nullable().optional(),
  priority: z.coerce.number().default(0),
});

export const publishTemplateSchema = z.object({
  name: z
    .string({ required_error: "Thiếu tên hoặc nội dung SVG của phông nền." })
    .trim()
    .min(1, "Thiếu tên hoặc nội dung SVG của phông nền."),
  svg_base: z
    .string({ required_error: "Thiếu tên hoặc nội dung SVG của phông nền." })
    .trim()
    .min(1, "Thiếu tên hoặc nội dung SVG của phông nền."),
  thumbnail: z.string().trim().nullable().optional(),
  category: z.string().trim().nullable().optional(),
  is_active: z
    .preprocess(
      (val) =>
        val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val),
      z.boolean()
    )
    .optional(),
  slot_config: z.record(z.any()).optional(),
  slots: z.array(publishSlotItemSchema).optional(),
  rules: z.array(publishRuleItemSchema).optional(),
});
