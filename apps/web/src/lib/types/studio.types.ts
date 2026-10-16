// ── Studio DB Rows (Backend Response & Request Shapes — snake_case) ───────

export interface StudioTemplateRow {
  id: string;
  name: string;
  thumbnail: string | null;
  svg_base: string;
  category: string | null;
  is_active: boolean;
  default_config?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface StudioSlotDefinitionRow {
  id: string;
  template_id: string;
  slot_key: string;
  label: string;
  slot_type: string;
  norm_x: number;
  norm_y: number;
  norm_width: number | null;
  norm_height: number | null;
  allow_scale: boolean;
  allow_rotate: boolean;
  mirror_x: boolean;
  z_index: number;
  sort_order: number;
  required: boolean;
}

export interface StudioAssetRow {
  id: string;
  asset_type: string;
  name: string;
  thumbnail: string | null;
  svg_data: string | null;
  color_hex: string | null;
  font_family: string | null;
  tags: string[];
  is_active: boolean;
  dominant_colors: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface StudioSlotRuleRow {
  id: string;
  template_id: string;
  rule_name: string | null;
  condition_slot: string;
  condition_value: Record<string, unknown>;
  target_slot: string;
  action: "force_asset" | "restrict_assets" | "hide_slot";
  action_value: Record<string, unknown> | null;
  priority: number;
}

export interface StudioSlotPublishPayload {
  id?: string;
  slot_key: string;
  label: string;
  slot_type: string;
  norm_x: number;
  norm_y: number;
  norm_width?: number | null;
  norm_height?: number | null;
  allow_scale: boolean;
  allow_rotate: boolean;
  mirror_x: boolean;
  z_index: number;
  sort_order: number;
  required?: boolean;
}

export interface StudioRulePublishPayload {
  id?: string;
  rule_name?: string | null;
  condition_slot: string;
  condition_value: Record<string, unknown>;
  target_slot: string;
  action: "force_asset" | "restrict_assets" | "hide_slot";
  action_value?: Record<string, unknown> | null;
  priority: number;
}

export interface StudioTemplatePublishPayload {
  name: string;
  svg_base: string;
  is_active?: boolean;
  thumbnail?: string | null;
  category?: string | null;
  slots?: StudioSlotPublishPayload[];
  rules?: StudioRulePublishPayload[];
  slot_config?: Record<string, unknown>;
}
