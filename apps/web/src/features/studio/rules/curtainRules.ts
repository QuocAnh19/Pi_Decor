import { Rule } from "./index";
import { SlotConfig, SlotConfigPatch } from "../types";

/**
 * Rule: Nếu drape-main có asset mang tag "do-do" (đỏ đô)
 * -> drape-detail bị force sang tag "rect-block" và bị khóa.
 */
export const redDrapeRule: Rule = {
  name: "red-drape-force-rect-block",
  priority: 10,
  condition: (slotConfig: SlotConfig) => {
    const drapeMain = slotConfig["drape-main"];
    return Boolean(drapeMain?.asset?.tags?.includes("do-do"));
  },
  apply: (_slotConfig: SlotConfig): SlotConfigPatch => {
    return {
      "drape-detail": {
        forcedAssetTag: "rect-block",
        locked: true,
        lockedReason: "Rèm chính màu đỏ đô bắt buộc dùng chi tiết dạng khối",
      },
    };
  },
};

export const curtainRules: Rule[] = [redDrapeRule];
