import { useState, useEffect, useCallback, useMemo } from 'react'
import { SlotConfig, SlotDefinition, Asset } from '../types'
import { AnyRule, evaluateRules } from '../rules'
import { extractSVGColors, hexToHSL, hslToHex } from '../utils/svgColorUtils'

export interface UseSlotDnDReturn {
  slotConfig: SlotConfig
  activeAsset: Asset | null
  setActiveAsset: (asset: Asset | null) => void
  assignAsset: (slotKey: string, asset: Asset) => void
  assignColor: (
    slotKey: string,
    hex: string,
    filterMode?: 'multiply_blend' | 'flat_tint' | 'color_map',
    colorSaturation?: number
  ) => void
  removeAsset: (slotKey: string) => void
  resetConfig: () => void
  setWholeConfig: (config: SlotConfig) => void
  lockedSlots: Set<string>
  isDirty: boolean
}

const STORAGE_PREFIX = 'pidecor_draft_'

export function useSlotDnD(
  slots: SlotDefinition[],
  rules: AnyRule[],
  templateId: string,
  initialConfig: SlotConfig = {}
): UseSlotDnDReturn {
  const storageKey = `${STORAGE_PREFIX}${templateId}`

  // Load initial state from localStorage if available, fallback to initialConfig
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Failed to parse draft from localStorage', e)
    }
    return initialConfig
  })

  const [activeAsset, setActiveAsset] = useState<Asset | null>(null)
  const [isDirty, setIsDirty] = useState<boolean>(false)

  // Compute lockedSlots set based on current slotConfig
  const lockedSlots = useMemo(() => {
    const locked = new Set<string>()
    for (const [key, state] of Object.entries(slotConfig)) {
      if (state.locked) {
        locked.add(key)
      }
    }
    return locked
  }, [slotConfig])

  // Debounced persistence to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(slotConfig))
      } catch (e) {
        console.warn('Failed to save draft to localStorage', e)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [slotConfig, storageKey])

  // Set whole config directly (e.g. applying admin preset or clearing to blank)
  const setWholeConfig = useCallback((newConfig: SlotConfig) => {
    setSlotConfig(newConfig)
    setIsDirty(true)
  }, [])

  // Assign asset to slot

  const assignAsset = useCallback((slotKey: string, asset: Asset) => {
    // Check if slot is locked
    if (lockedSlots.has(slotKey)) {
      console.warn(`Cannot assign asset to locked slot '${slotKey}'`)
      return
    }

    setSlotConfig((prev) => {
      const existing = prev[slotKey]
      const colorOverride = existing?.colorOverride
      const filterMode = existing?.filterMode ?? 'multiply_blend'

      let colorMap = existing?.colorMap
      if (colorOverride && asset.svgData) {
        const originalColors = extractSVGColors(asset.svgData)
        colorMap = {}
        for (const orig of originalColors) {
          const { l } = hexToHSL(orig)
          if (l > 10 && l < 90) {
            const { h: newH, s: newS } = hexToHSL(colorOverride)
            const { l: origL, s: origS } = hexToHSL(orig)
            colorMap[orig] = hslToHex(newH, Math.round((origS + newS) / 2), origL)
          }
        }
      }

      const updated: SlotConfig = {
        ...prev,
        [slotKey]: {
          ...prev[slotKey],
          assetId: asset.id,
          asset: asset,
          colorOverride,
          colorMap,
          filterMode
        }
      }

      // Evaluate rules
      const patch = evaluateRules(rules, updated, slots)
      const finalConfig: SlotConfig = { ...updated }

      for (const [targetSlot, patchState] of Object.entries(patch)) {
        if (!patchState) continue
        finalConfig[targetSlot] = {
          ...finalConfig[targetSlot],
          ...patchState
        }
      }

      return finalConfig
    })
    setIsDirty(true)
  }, [lockedSlots, rules, slots])

  // Assign color override & saturation intensity to slot
  const assignColor = useCallback(
    (
      slotKey: string,
      hex: string,
      filterMode: 'multiply_blend' | 'flat_tint' | 'color_map' = 'multiply_blend',
      colorSaturation: number = 100
    ) => {
      setSlotConfig((prev) => {
        const existing = prev[slotKey]
        const asset = existing?.asset
        let colorMap: Record<string, string> | undefined

        if (asset?.svgData) {
          const originalColors = extractSVGColors(asset.svgData)
          // Map only the dominant colors (skip near-white, near-black, transparent)
          colorMap = {}
          for (const orig of originalColors) {
            const { l } = hexToHSL(orig)
            if (l > 10 && l < 90) {
              // Shift hue to match new color while preserving lightness
              const { h: newH, s: newS } = hexToHSL(hex)
              const { l: origL, s: origS } = hexToHSL(orig)
              colorMap[orig] = hslToHex(newH, Math.round((origS + newS) / 2), origL)
            }
          }
        }

        return {
          ...prev,
          [slotKey]: {
            ...existing,
            colorOverride: hex,
            colorMap,
            filterMode,
            colorSaturation
          }
        }
      })
      setIsDirty(true)
    },
    []
  )

  // Remove asset from slot
  const removeAsset = useCallback((slotKey: string) => {
    if (lockedSlots.has(slotKey)) {
      console.warn(`Cannot remove asset from locked slot '${slotKey}'`)
      return
    }

    setSlotConfig((prev) => {
      const updated = { ...prev }
      delete updated[slotKey]

      // Re-evaluate rules after clearing
      const patch = evaluateRules(rules, updated, slots)
      const finalConfig: SlotConfig = { ...updated }

      for (const [targetSlot, patchState] of Object.entries(patch)) {
        if (!patchState) continue
        finalConfig[targetSlot] = {
          ...finalConfig[targetSlot],
          ...patchState
        }
      }

      return finalConfig
    })
    setIsDirty(true)
  }, [lockedSlots, rules, slots])

  // Reset config
  const resetConfig = useCallback(() => {
    setSlotConfig({})
    try {
      localStorage.removeItem(storageKey)
    } catch (e) {
      console.warn('Failed to clear draft from localStorage', e)
    }
    setIsDirty(false)
  }, [storageKey])

  return {
    slotConfig,
    activeAsset,
    setActiveAsset,
    assignAsset,
    assignColor,
    removeAsset,
    resetConfig,
    setWholeConfig,
    lockedSlots,
    isDirty
  }
}
