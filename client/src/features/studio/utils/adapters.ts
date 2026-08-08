import type {
  StudioTemplateRow,
  StudioSlotDefinitionRow,
  StudioAssetRow,
  StudioSlotRuleRow,
} from "../../../lib/types";
import type {
  Template,
  SlotDefinition,
  Asset,
  SlotRule,
  SlotType,
} from "../types";

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

export function toStudioRule(row: StudioSlotRuleRow): SlotRule {
  return {
    id: row.id,
    templateId: row.template_id,
    ruleName: row.rule_name ?? "",
    conditionSlot: row.condition_slot,
    conditionValue: row.condition_value as SlotRule["conditionValue"],
    targetSlot: row.target_slot,
    action: row.action,
    actionValue: row.action_value as SlotRule["actionValue"],
    priority: row.priority ?? 0,
  };
}
