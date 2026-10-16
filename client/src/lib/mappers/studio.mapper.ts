import type {
  StudioTemplateRow,
  StudioSlotDefinitionRow,
  StudioAssetRow,
  StudioSlotRuleRow,
  StudioSlotPublishPayload,
  StudioRulePublishPayload,
  StudioTemplatePublishPayload,
} from "../types";
import type {
  Template,
  SlotDefinition,
  Asset,
  SlotRule,
  SlotType,
  SlotConfig,
} from "../../features/studio";

/**
 * Chuyển đổi hàng studio_templates (snake_case từ DB) sang model nội bộ Studio (camelCase).
 */
export function toStudioTemplate(row: StudioTemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    thumbnail: row.thumbnail ?? undefined,
    svgBase: row.svg_base,
    category: row.category ?? undefined,
    isActive: row.is_active,
  };
}

/**
 * Chuyển đổi hàng studio_slot_definitions (snake_case) sang SlotDefinition (camelCase).
 */
export function toStudioSlot(row: StudioSlotDefinitionRow): SlotDefinition {
  return {
    id: row.id,
    templateId: row.template_id,
    slotKey: row.slot_key,
    label: row.label,
    slotType: row.slot_type as SlotType,
    normX: Number(row.norm_x),
    normY: Number(row.norm_y),
    normWidth: row.norm_width != null ? Number(row.norm_width) : undefined,
    normHeight: row.norm_height != null ? Number(row.norm_height) : undefined,
    allowScale: row.allow_scale ?? true,
    allowRotate: row.allow_rotate ?? false,
    mirrorX: row.mirror_x ?? false,
    zIndex: row.z_index ?? 0,
    sortOrder: row.sort_order ?? 0,
    required: row.required ?? false,
  };
}

/**
 * Chuyển đổi SlotDefinition (camelCase) sang payload snake_case để gửi lên API publish.
 */
export function toStudioSlotPublishPayload(slot: SlotDefinition): StudioSlotPublishPayload {
  return {
    id: slot.id,
    slot_key: slot.slotKey,
    label: slot.label,
    slot_type: slot.slotType,
    norm_x: slot.normX,
    norm_y: slot.normY,
    norm_width: slot.normWidth ?? null,
    norm_height: slot.normHeight ?? null,
    allow_scale: slot.allowScale,
    allow_rotate: slot.allowRotate,
    mirror_x: slot.mirrorX,
    z_index: slot.zIndex,
    sort_order: slot.sortOrder,
    required: slot.required ?? false,
  };
}

/**
 * Chuyển đổi hàng studio_assets (snake_case) sang Asset (camelCase).
 */
export function toStudioAsset(row: StudioAssetRow): Asset {
  return {
    id: row.id,
    assetType: row.asset_type as SlotType,
    name: row.name,
    thumbnail: row.thumbnail ?? undefined,
    svgData: row.svg_data ?? undefined,
    colorHex: row.color_hex ?? undefined,
    fontFamily: row.font_family ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    isActive: row.is_active ?? true,
    dominantColors: Array.isArray(row.dominant_colors) ? row.dominant_colors : undefined,
  };
}

/**
 * Chuyển đổi hàng studio_slot_rules (snake_case) sang SlotRule (camelCase).
 */
export function toStudioRule(row: StudioSlotRuleRow): SlotRule {
  return {
    id: row.id,
    templateId: row.template_id,
    ruleName: row.rule_name ?? "",
    conditionSlot: row.condition_slot,
    conditionValue: row.condition_value ?? {},
    targetSlot: row.target_slot,
    action: row.action,
    actionValue: row.action_value ?? undefined,
    priority: row.priority ?? 0,
  };
}

/**
 * Chuyển đổi SlotRule (camelCase) sang payload snake_case để gửi lên API publish.
 */
export function toStudioRulePublishPayload(rule: SlotRule): StudioRulePublishPayload {
  return {
    id: rule.id,
    rule_name: rule.ruleName || null,
    condition_slot: rule.conditionSlot,
    condition_value: rule.conditionValue ?? {},
    target_slot: rule.targetSlot,
    action: rule.action,
    action_value: rule.actionValue ?? null,
    priority: rule.priority,
  };
}

/**
 * Đóng gói toàn bộ dữ liệu template, slots, rules, slotConfig thành payload snake_case chuẩn API.
 */
export function toTemplatePublishPayload(params: {
  template: Template;
  isActive: boolean;
  thumbnail?: string | null;
  slots: SlotDefinition[];
  rules: SlotRule[];
  slotConfig: SlotConfig;
}): StudioTemplatePublishPayload {
  return {
    name: params.template.name,
    thumbnail: params.thumbnail ?? params.template.thumbnail ?? null,
    svg_base: params.template.svgBase,
    is_active: params.isActive,
    category: params.template.category ?? null,
    slots: params.slots.map(toStudioSlotPublishPayload),
    rules: params.rules.map(toStudioRulePublishPayload),
    slot_config: params.slotConfig as Record<string, unknown>,
  };
}

/**
 * Đọc an toàn default_config đã lưu trong DB sang SlotConfig (tương thích dữ liệu cũ).
 */
export function parseTemplateDefaultConfig(
  rawConfig: Record<string, unknown> | null | undefined,
): SlotConfig {
  if (!rawConfig || typeof rawConfig !== "object" || Array.isArray(rawConfig)) {
    return {};
  }
  return rawConfig as SlotConfig;
}
