import { describe, it, expect } from "vitest";
import {
  toStudioSlot,
  toStudioSlotPublishPayload,
  toStudioRule,
  toStudioRulePublishPayload,
} from "./studio.mapper";
import { normalizeQuotation, toQuotationPayload } from "./quotation.mapper";
import type { StudioSlotDefinitionRow, StudioSlotRuleRow, Quotation } from "../types";

describe("mappers roundtrip tests", () => {
  it("chuyển đổi hai chiều slot (StudioSlotDefinitionRow <-> SlotDefinition) không mất dữ liệu", () => {
    const originalRow: StudioSlotDefinitionRow = {
      id: "slot-001",
      template_id: "tpl-001",
      slot_key: "curtain_main",
      label: "Rèm chính",
      slot_type: "curtain",
      norm_x: 0.15,
      norm_y: 0.2,
      norm_width: 0.5,
      norm_height: 0.6,
      allow_scale: true,
      allow_rotate: false,
      mirror_x: true,
      z_index: 2,
      sort_order: 1,
      required: true,
    };

    // DB -> Client camelCase
    const slotDef = toStudioSlot(originalRow);
    expect(slotDef.slotKey).toBe(originalRow.slot_key);
    expect(slotDef.normX).toBe(originalRow.norm_x);
    expect(slotDef.normWidth).toBe(originalRow.norm_width);
    expect(slotDef.mirrorX).toBe(true);

    // Client camelCase -> API publish payload (snake_case)
    const payload = toStudioSlotPublishPayload(slotDef);
    expect(payload.id).toBe(originalRow.id);
    expect(payload.slot_key).toBe(originalRow.slot_key);
    expect(payload.label).toBe(originalRow.label);
    expect(payload.slot_type).toBe(originalRow.slot_type);
    expect(payload.norm_x).toBe(originalRow.norm_x);
    expect(payload.norm_y).toBe(originalRow.norm_y);
    expect(payload.norm_width).toBe(originalRow.norm_width);
    expect(payload.norm_height).toBe(originalRow.norm_height);
    expect(payload.allow_scale).toBe(originalRow.allow_scale);
    expect(payload.allow_rotate).toBe(originalRow.allow_rotate);
    expect(payload.mirror_x).toBe(originalRow.mirror_x);
    expect(payload.z_index).toBe(originalRow.z_index);
    expect(payload.sort_order).toBe(originalRow.sort_order);
    expect(payload.required).toBe(originalRow.required);
  });

  it("chuyển đổi hai chiều rule (StudioSlotRuleRow <-> SlotRule) không mất dữ liệu", () => {
    const originalRuleRow: StudioSlotRuleRow = {
      id: "rule-001",
      template_id: "tpl-001",
      rule_name: "Tự động đổi phông",
      condition_slot: "curtain_main",
      condition_value: { color: "red" },
      target_slot: "backdrop_center",
      action: "hide_slot",
      action_value: { hidden: true },
      priority: 5,
    };

    const slotRule = toStudioRule(originalRuleRow);
    expect(slotRule.conditionSlot).toBe("curtain_main");
    expect(slotRule.targetSlot).toBe("backdrop_center");
    expect(slotRule.priority).toBe(5);

    const payload = toStudioRulePublishPayload(slotRule);
    expect(payload.id).toBe(originalRuleRow.id);
    expect(payload.rule_name).toBe(originalRuleRow.rule_name);
    expect(payload.condition_slot).toBe(originalRuleRow.condition_slot);
    expect(payload.condition_value).toEqual(originalRuleRow.condition_value);
    expect(payload.target_slot).toBe(originalRuleRow.target_slot);
    expect(payload.action).toBe(originalRuleRow.action);
    expect(payload.action_value).toEqual(originalRuleRow.action_value);
    expect(payload.priority).toBe(originalRuleRow.priority);
  });

  it("chuyển đổi và chuẩn hóa quotation chính xác", () => {
    const rawQuotation: Quotation = {
      id: "q-1",
      lead_id: "lead-1",
      admin_id: "admin-1",
      quotation_number: "BG-2026-0001",
      items: [
        { description: "Cổng hoa", quantity: 2, unit_price: 3000000, subtotal: 6000000 },
      ],
      subtotal: 6000000,
      discount: 500000,
      total: 5500000,
      status: "draft",
      valid_until: null,
      notes: null,
      created_at: "2026-10-15T00:00:00Z",
      updated_at: "2026-10-15T00:00:00Z",
    };

    const normalized = normalizeQuotation(rawQuotation);
    expect(normalized.subtotal).toBe(6000000);
    expect(normalized.total).toBe(5500000);

    const payload = toQuotationPayload({
      leadId: normalized.lead_id,
      items: normalized.items,
      discount: normalized.discount,
    });
    expect(payload.lead_id).toBe("lead-1");
    expect(payload.items[0].description).toBe("Cổng hoa");
    expect(payload.items[0].quantity).toBe(2);
    expect(payload.items[0].unit_price).toBe(3000000);
    expect(payload.discount).toBe(500000);
  });
});
