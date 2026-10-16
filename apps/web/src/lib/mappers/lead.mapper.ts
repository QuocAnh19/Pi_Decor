import type { DesignSnapshot, StudioSlotDefinitionRow } from "../types";
import type { SlotConfig, SlotDefinition } from "../../features/studio";
import { toStudioSlot } from "./studio.mapper";

export interface ParsedDesignSnapshot {
  templateId: string;
  templateName?: string;
  slotConfig?: SlotConfig;
  customSlots?: SlotDefinition[];
  previewImage?: string;
}

function isSlotRow(item: unknown): item is StudioSlotDefinitionRow {
  return (
    typeof item === "object" &&
    item !== null &&
    "slot_key" in item &&
    typeof (item as { slot_key: unknown }).slot_key === "string"
  );
}

function isSlotDefinition(item: unknown): item is SlotDefinition {
  return (
    typeof item === "object" &&
    item !== null &&
    "slotKey" in item &&
    typeof (item as { slotKey: unknown }).slotKey === "string"
  );
}

/**
 * Đọc và chuẩn hóa design_snapshot từ Lead (tương thích cả định dạng cũ và mới trong DB).
 */
export function parseDesignSnapshot(raw: DesignSnapshot | null | undefined): ParsedDesignSnapshot {
  if (!raw || typeof raw !== "object") {
    return { templateId: "tpl-classic-01" };
  }

  const templateId =
    typeof raw.template_id === "string" && raw.template_id.trim()
      ? raw.template_id
      : "tpl-classic-01";

  const templateName = typeof raw.template_name === "string" ? raw.template_name : undefined;

  let customSlots: SlotDefinition[] | undefined;
  if (Array.isArray(raw.custom_slots) && raw.custom_slots.length > 0) {
    const parsedSlots: SlotDefinition[] = [];
    for (const item of raw.custom_slots) {
      if (isSlotDefinition(item)) {
        parsedSlots.push(item);
      } else if (isSlotRow(item)) {
        parsedSlots.push(toStudioSlot(item));
      }
    }
    if (parsedSlots.length > 0) {
      customSlots = parsedSlots;
    }
  }

  let slotConfig: SlotConfig | undefined;
  if (raw.slot_config && typeof raw.slot_config === "object" && !Array.isArray(raw.slot_config)) {
    slotConfig = raw.slot_config as SlotConfig;
  } else if (raw.baseFabric) {
    slotConfig = raw as unknown as SlotConfig;
  }

  const previewImage =
    typeof raw.preview_image === "string"
      ? raw.preview_image
      : typeof raw.thumbnail === "string"
        ? raw.thumbnail
        : undefined;

  return {
    templateId,
    templateName,
    slotConfig,
    customSlots,
    previewImage,
  };
}

/**
 * Đóng gói dữ liệu thiết kế Studio thành DesignSnapshot lưu vào bảng leads.
 */
export function buildDesignSnapshot(params: {
  templateId: string;
  templateName: string;
  slotConfig: SlotConfig;
  slots: SlotDefinition[];
  previewImage?: string | null;
  savedBy: "customer" | "admin";
}): DesignSnapshot {
  return {
    template_id: params.templateId,
    template_name: params.templateName,
    slot_config: params.slotConfig as Record<string, unknown>,
    custom_slots: params.slots,
    ...params.slotConfig,
    ...(params.previewImage ? { preview_image: params.previewImage } : {}),
    saved_by: params.savedBy,
    saved_at: new Date().toISOString(),
  };
}
