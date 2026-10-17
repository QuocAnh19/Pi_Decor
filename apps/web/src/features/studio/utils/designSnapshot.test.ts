import { describe, it, expect } from "vitest";
import { parseDesignSnapshot, buildDesignSnapshot } from "../../../lib/mappers/lead.mapper";
import type { SlotConfig, SlotDefinition } from "../../studio/types";

describe("Design Snapshot Serialization & Deserialization", () => {
  const dummySlots: SlotDefinition[] = [
    {
      id: "slot-custom-1",
      templateId: "tpl-classic-01",
      slotKey: "drape-main",
      label: "Rèm chính",
      slotType: "drape",
      normX: 0.15,
      normY: 0.25,
      normWidth: 0.7,
      normHeight: 0.5,
      allowScale: true,
      allowRotate: false,
      mirrorX: false,
      zIndex: 1,
      sortOrder: 1,
      required: true,
    },
  ];

  const dummySlotConfig: SlotConfig = {
    "drape-main": {
      assetId: "asset-velvet-red",
      colorOverride: "#991B1B",
      filterMode: "multiply_blend",
    },
  };

  it("buildDesignSnapshot đóng gói đầy đủ thông tin chuẩn schema JSONB", () => {
    const snapshot = buildDesignSnapshot({
      templateId: "tpl-wedding-01",
      templateName: "Mẫu Tiệc Cưới Vintage",
      slotConfig: dummySlotConfig,
      slots: dummySlots,
      previewImage: "https://example.com/preview.jpg",
      savedBy: "customer",
    });

    expect(snapshot.template_id).toBe("tpl-wedding-01");
    expect(snapshot.template_name).toBe("Mẫu Tiệc Cưới Vintage");
    expect(snapshot.preview_image).toBe("https://example.com/preview.jpg");
    expect(snapshot.saved_by).toBe("customer");
    expect(snapshot.custom_slots).toHaveLength(1);
    expect(snapshot.slot_config).toEqual(dummySlotConfig);
  });

  it("parseDesignSnapshot giải mã chính xác dữ liệu snapshot từ server", () => {
    const rawSnapshot = {
      template_id: "tpl-wedding-01",
      template_name: "Mẫu Tiệc Cưới Vintage",
      preview_image: "https://example.com/preview.jpg",
      custom_slots: [
        {
          id: "slot-db-1",
          template_id: "tpl-wedding-01",
          slot_key: "drape-main",
          label: "Rèm chính",
          slot_type: "curtain_fabric",
          norm_x: 0.15,
          norm_y: 0.25,
          norm_width: 0.7,
          norm_height: 0.5,
          allow_scale: true,
          allow_rotate: false,
          mirror_x: false,
          z_index: 1,
          sort_order: 1,
          required: true,
        },
      ],
      slot_config: dummySlotConfig,
    };

    const parsed = parseDesignSnapshot(rawSnapshot);
    expect(parsed.templateId).toBe("tpl-wedding-01");
    expect(parsed.templateName).toBe("Mẫu Tiệc Cưới Vintage");
    expect(parsed.previewImage).toBe("https://example.com/preview.jpg");
    expect(parsed.customSlots).toHaveLength(1);
    expect(parsed.customSlots?.[0].slotKey).toBe("drape-main");
    expect(parsed.slotConfig).toEqual(dummySlotConfig);
  });

  it("parseDesignSnapshot trả về fallback an toàn khi raw null hoặc rỗng", () => {
    const parsedNull = parseDesignSnapshot(null);
    expect(parsedNull.templateId).toBe("tpl-classic-01");
    expect(parsedNull.slotConfig).toBeUndefined();

    const parsedEmpty = parseDesignSnapshot({});
    expect(parsedEmpty.templateId).toBe("tpl-classic-01");
  });
});
