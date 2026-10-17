import { describe, it, expect } from "vitest";
import { evaluateRules } from "./index";
import { curtainRules, redDrapeRule } from "./curtainRules";
import type { SlotConfig, SlotRule, SlotDefinition } from "../types";

describe("Studio Rules Engine", () => {
  const dummySlots: SlotDefinition[] = [
    {
      id: "slot-1",
      templateId: "tpl-1",
      slotKey: "drape-main",
      label: "Rèm chính",
      slotType: "drape",
      normX: 0.1,
      normY: 0.1,
      normWidth: 0.8,
      normHeight: 0.8,
      allowScale: true,
      allowRotate: false,
      mirrorX: false,
      zIndex: 1,
      sortOrder: 1,
      required: true,
    },
    {
      id: "slot-2",
      templateId: "tpl-1",
      slotKey: "drape-detail",
      label: "Chi tiết rèm",
      slotType: "drape",
      normX: 0.2,
      normY: 0.2,
      normWidth: 0.6,
      normHeight: 0.6,
      allowScale: true,
      allowRotate: false,
      mirrorX: false,
      zIndex: 2,
      sortOrder: 2,
      required: false,
    },
  ];

  it("không áp dụng patch nếu rule không khớp điều kiện", () => {
    const config: SlotConfig = {
      "drape-main": {
        assetId: "asset-blue",
        asset: {
          id: "asset-blue",
          assetType: "drape",
          name: "Rèm Xanh",
          tags: ["xanh-duong"],
          isActive: true,
        },
      },
    };

    const patch = evaluateRules(curtainRules, config, dummySlots);
    expect(patch).toEqual({});
  });

  it("áp dụng functional rule: redDrapeRule khóa và force tag 'rect-block' khi rèm có tag 'do-do'", () => {
    const config: SlotConfig = {
      "drape-main": {
        assetId: "asset-red",
        asset: {
          id: "asset-red",
          assetType: "drape",
          name: "Rèm Đỏ Đô",
          tags: ["do-do", "wedding"],
          isActive: true,
        },
      },
    };

    const patch = evaluateRules([redDrapeRule], config, dummySlots);
    expect(patch["drape-detail"]).toBeDefined();
    expect(patch["drape-detail"]?.forcedAssetTag).toBe("rect-block");
    expect(patch["drape-detail"]?.locked).toBe(true);
    expect(patch["drape-detail"]?.lockedReason).toContain("đỏ đô");
  });

  it("áp dụng declarative SlotRule từ database theo thứ tự priority", () => {
    const declarativeRules: SlotRule[] = [
      {
        id: "rule-1",
        templateId: "tpl-1",
        ruleName: "Ưu tiên thấp",
        conditionSlot: "drape-main",
        conditionValue: { asset_tag: "pastel" },
        targetSlot: "drape-detail",
        action: "force_asset",
        actionValue: { forced_asset_tag: "flower-pastel" },
        priority: 5,
      },
      {
        id: "rule-2",
        templateId: "tpl-1",
        ruleName: "Ưu tiên cao",
        conditionSlot: "drape-main",
        conditionValue: { asset_tag: "pastel" },
        targetSlot: "drape-detail",
        action: "force_asset",
        actionValue: { forced_asset_tag: "flower-gold" },
        priority: 20,
      },
    ];

    const config: SlotConfig = {
      "drape-main": {
        assetId: "asset-pastel",
        asset: {
          id: "asset-pastel",
          assetType: "drape",
          name: "Rèm Hồng Pastel",
          tags: ["pastel"],
          isActive: true,
        },
      },
    };

    const patch = evaluateRules(declarativeRules, config, dummySlots);
    expect(patch["drape-detail"]?.forcedAssetTag).toBe("flower-pastel");
  });
});
