import { z } from "zod";
import { parseArrayField } from "../utils/parseArrayField.js";

// ============================================================================
// 1. Studio Templates
// ============================================================================

export const createTemplateSchema = z.object({
  name: z
    .string({ required_error: "Thiếu tên hoặc nội dung SVG của template." })
    .trim()
    .min(1, "Thiếu tên hoặc nội dung SVG của template."),
  svg_base: z
    .string({ required_error: "Thiếu tên hoặc nội dung SVG của template." })
    .trim()
    .min(1, "Thiếu tên hoặc nội dung SVG của template."),
  thumbnail: z.string().trim().nullable().optional(),
  category: z.string().trim().nullable().optional(),
  is_active: z
    .preprocess(
      (val) => (val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val)),
      z.boolean()
    )
    .optional(),
  default_config: z.record(z.any()).optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

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
      (val) => (val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val)),
      z.boolean()
    )
    .optional(),
  slot_config: z.record(z.any()).optional(),
  slots: z.array(publishSlotItemSchema).optional(),
  rules: z.array(publishRuleItemSchema).optional(),
});

// ============================================================================
// 3. Studio Slot Definitions
// ============================================================================

export const createSlotSchema = z.object({
  slot_key: z
    .string({ required_error: "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y." })
    .trim()
    .min(1, "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y."),
  label: z
    .string({ required_error: "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y." })
    .trim()
    .min(1, "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y."),
  slot_type: z
    .string({ required_error: "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y." })
    .trim()
    .min(1, "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y."),
  norm_x: z.coerce.number({ required_error: "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y." }),
  norm_y: z.coerce.number({ required_error: "Thiếu thông tin slot_key, label, slot_type hoặc vị trí norm_x/norm_y." }),
  norm_width: z.coerce.number().nullable().optional(),
  norm_height: z.coerce.number().nullable().optional(),
  allow_scale: z.coerce.boolean().optional(),
  allow_rotate: z.coerce.boolean().optional(),
  mirror_x: z.coerce.boolean().optional(),
  z_index: z.coerce.number().optional(),
  sort_order: z.coerce.number().optional(),
  required: z.coerce.boolean().optional(),
});

export const updateSlotSchema = createSlotSchema.partial();

export const reorderSlotsSchema = z.array(
  z.object({
    id: z.string().trim().min(1),
    sort_order: z.coerce.number(),
  })
);

// ============================================================================
// 4. Studio Assets
// ============================================================================

export const createAssetSchema = z.object({
  asset_type: z
    .string({ required_error: "Thiếu loại asset (asset_type) hoặc tên." })
    .trim()
    .min(1, "Thiếu loại asset (asset_type) hoặc tên."),
  name: z
    .string({ required_error: "Thiếu loại asset (asset_type) hoặc tên." })
    .trim()
    .min(1, "Thiếu loại asset (asset_type) hoặc tên."),
  thumbnail: z.string().trim().nullable().optional(),
  svg_data: z.string().trim().nullable().optional(),
  color_hex: z.string().trim().nullable().optional(),
  font_family: z.string().trim().nullable().optional(),
  tags: z.preprocess((val) => parseArrayField(val), z.array(z.string())).optional(),
  is_active: z
    .preprocess(
      (val) => (val === undefined || val === null ? undefined : val === "false" ? false : Boolean(val)),
      z.boolean()
    )
    .optional(),
  dominant_colors: z.any().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

// ============================================================================
// 5. Studio Slot Rules
// ============================================================================

export const createRuleSchema = z.object({
  condition_slot: z
    .string({ required_error: "Thiếu thông tin điều kiện hoặc hành động của rule." })
    .trim()
    .min(1, "Thiếu thông tin điều kiện hoặc hành động của rule."),
  condition_value: z.any({ required_error: "Thiếu thông tin điều kiện hoặc hành động của rule." }),
  target_slot: z
    .string({ required_error: "Thiếu thông tin điều kiện hoặc hành động của rule." })
    .trim()
    .min(1, "Thiếu thông tin điều kiện hoặc hành động của rule."),
  action: z
    .string({ required_error: "Thiếu thông tin điều kiện hoặc hành động của rule." })
    .trim()
    .min(1, "Thiếu thông tin điều kiện hoặc hành động của rule."),
  rule_name: z.string().trim().nullable().optional(),
  action_value: z.any().nullable().optional(),
  priority: z.coerce.number().optional(),
});

export const updateRuleSchema = createRuleSchema.partial();
