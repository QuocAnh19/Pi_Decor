export type SlotType = 
  | 'drape' 
  | 'drape_detail' 
  | 'flower' 
  | 'text_name' 
  | 'text_date' 
  | 'color_accent' 
  | 'prop'

export interface Template {
  id: string
  name: string
  thumbnail?: string
  svgBase: string
  category?: string
  isActive: boolean
}

export interface SlotDefinition {
  id: string
  templateId: string
  slotKey: string
  label: string
  slotType: SlotType
  normX: number
  normY: number
  normWidth?: number
  normHeight?: number
  allowScale: boolean
  allowRotate: boolean
  mirrorX: boolean
  zIndex: number
  sortOrder: number
  required?: boolean
}

export interface Asset {
  id: string
  assetType: SlotType
  name: string
  thumbnail?: string
  svgData?: string
  colorHex?: string
  fontFamily?: string
  tags?: string[]
  isActive?: boolean
  dominantColors?: string[]
}

export interface SlotRule {
  id: string
  templateId: string
  ruleName: string
  conditionSlot: string
  conditionValue: Record<string, unknown>   // { asset_tag: "do-do" } hoặc { asset_id: "..." }
  targetSlot: string
  action: 'force_asset' | 'restrict_assets' | 'hide_slot'
  actionValue?: Record<string, unknown>
  priority: number
}

export interface SlotState {
  assetId?: string
  asset?: Asset
  customAsset?: Asset
  materialId?: string | null
  materialImage?: string | null
  colorHex?: string | null
  locked?: boolean
  lockedReason?: string
  colorOverride?: string        // primary hue hex e.g. "#E91E63"
  colorMap?: Record<string, string>  // { "#C62828": "#E91E63", "#880E4F": "#880037" }
  filterMode?: 'multiply_blend' | 'flat_tint' | 'color_map'
  colorSaturation?: number      // color saturation intensity 0 to 200 (default 100)
  forcedAssetTag?: string
}

export type SlotConfig = Record<string, SlotState>

export type SlotConfigPatch = Partial<SlotConfig>

export function getDefaultSlotDimensions(type: SlotType): { normWidth: number; normHeight: number } {
  switch (type) {
    case 'drape':
      return { normWidth: 0.75, normHeight: 0.70 }
    case 'drape_detail':
      return { normWidth: 0.65, normHeight: 0.25 }
    case 'flower':
      return { normWidth: 0.22, normHeight: 0.35 }
    case 'text_name':
      return { normWidth: 0.45, normHeight: 0.15 }
    case 'text_date':
      return { normWidth: 0.30, normHeight: 0.10 }
    case 'color_accent':
      return { normWidth: 0.15, normHeight: 0.15 }
    case 'prop':
    default:
      return { normWidth: 0.25, normHeight: 0.25 }
  }
}
