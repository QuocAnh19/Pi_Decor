import { SlotConfig, SlotConfigPatch, SlotDefinition } from '../types'

export interface Rule {
  name: string
  priority?: number
  condition: (slotConfig: SlotConfig, slots: SlotDefinition[]) => boolean
  apply: (slotConfig: SlotConfig, slots: SlotDefinition[]) => SlotConfigPatch
}

/**
 * Evaluates rules according to priority (higher priority evaluated first).
 * Merges rule patches into a single result without mutating the input slotConfig.
 */
export function evaluateRules(
  rules: Rule[],
  slotConfig: SlotConfig,
  slots: SlotDefinition[] = []
): SlotConfigPatch {
  // Sort rules by priority descending (default priority = 0)
  const sortedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  let accumulatedPatch: SlotConfigPatch = {}
  // Create a working copy of slotConfig to allow subsequent rules to see updates
  let currentConfig: SlotConfig = { ...slotConfig }

  for (const rule of sortedRules) {
    if (rule.condition(currentConfig, slots)) {
      const patch = rule.apply(currentConfig, slots)
      
      // Merge patch into accumulatedPatch and currentConfig
      accumulatedPatch = { ...accumulatedPatch, ...patch }
      
      // Update currentConfig for subsequent rule evaluations
      for (const [slotKey, patchState] of Object.entries(patch)) {
        currentConfig[slotKey] = {
          ...currentConfig[slotKey],
          ...patchState
        }
      }
    }
  }

  return accumulatedPatch
}
