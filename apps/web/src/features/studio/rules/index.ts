import { SlotConfig, SlotConfigPatch, SlotDefinition, SlotRule } from "../types";

export interface Rule {
  name?: string;
  priority?: number;
  condition?: (slotConfig: SlotConfig, slots: SlotDefinition[]) => boolean;
  apply?: (slotConfig: SlotConfig, slots: SlotDefinition[]) => SlotConfigPatch;
}

export type AnyRule = Rule | SlotRule;

/**
 * Evaluates rules according to priority (higher priority evaluated first).
 * Supports both functional Rules and declarative SlotRules from JSON.
 * Merges rule patches into a single result without mutating the input slotConfig.
 */
export function evaluateRules(
  rules: AnyRule[],
  slotConfig: SlotConfig,
  slots: SlotDefinition[] = []
): SlotConfigPatch {
  if (!Array.isArray(rules) || rules.length === 0) return {};

  const sortedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  let accumulatedPatch: SlotConfigPatch = {};
  const currentConfig: SlotConfig = { ...slotConfig };

  for (const rule of sortedRules) {
    if (!rule) continue;

    let isMatch = false;
    let patch: SlotConfigPatch = {};

    // Case 1: Functional Rule (has condition function)
    if ("condition" in rule && typeof rule.condition === "function") {
      isMatch = rule.condition(currentConfig, slots);
      if (isMatch && typeof rule.apply === "function") {
        patch = rule.apply(currentConfig, slots);
      }
    }
    // Case 2: Declarative SlotRule (has conditionSlot & conditionValue)
    else if (
      "conditionSlot" in rule &&
      rule.conditionSlot &&
      rule.conditionValue &&
      rule.targetSlot
    ) {
      const sourceSlotState = currentConfig[rule.conditionSlot];
      const asset = sourceSlotState?.asset;
      const assetTags = asset?.tags || [];
      const assetId = sourceSlotState?.assetId || asset?.id;

      const expectedTag = rule.conditionValue.asset_tag || rule.conditionValue.tag;
      const expectedId = rule.conditionValue.asset_id || rule.conditionValue.id;

      if (expectedTag && assetTags.includes(expectedTag as string)) {
        isMatch = true;
      } else if (expectedId && assetId === expectedId) {
        isMatch = true;
      }

      if (isMatch) {
        const forcedTag = rule.actionValue?.forced_asset_tag || rule.actionValue?.tag;
        patch = {
          [rule.targetSlot]: {
            forcedAssetTag: (forcedTag as string) || undefined,
            locked: true,
            lockedReason: rule.ruleName || "Slot bị khóa theo quy tắc thiết kế",
          },
        };
      }
    }

    if (isMatch && patch) {
      accumulatedPatch = { ...accumulatedPatch, ...patch };

      for (const [slotKey, patchState] of Object.entries(patch)) {
        if (!patchState) continue;
        currentConfig[slotKey] = {
          ...currentConfig[slotKey],
          ...patchState,
        };
      }
    }
  }

  return accumulatedPatch;
}
