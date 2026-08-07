import React, { useState, useEffect, useMemo } from 'react'
import { Asset, SlotDefinition, SlotConfig, SlotType } from '../../types'
import { DraggableAsset } from './DraggableAsset'
import { TextAssetCustomizer } from './TextAssetCustomizer'
import { CurtainColorFilterControl } from '../shared/CurtainColorFilterControl'

export interface AssetPickerProps {
  assets: Asset[]
  activeSlotKey?: string
  slots: SlotDefinition[]
  slotConfig: SlotConfig
  onAssetClick: (asset: Asset, slotKey?: string) => void
  onApplyColor?: (hex: string, filterMode?: 'multiply_blend' | 'flat_tint' | 'color_map', saturation?: number) => void
}

type TabType = 'all' | 'drape' | 'flower' | 'text' | 'color'

export const AssetPicker: React.FC<AssetPickerProps> = ({
  assets,
  activeSlotKey,
  slots,
  slotConfig,
  onAssetClick,
  onApplyColor
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Map slotType to TabType
  const getTabForSlotType = (type: SlotType): TabType => {
    switch (type) {
      case 'drape':
      case 'drape_detail':
        return 'drape'
      case 'flower':
        return 'flower'
      case 'text_name':
      case 'text_date':
        return 'text'
      case 'color_accent':
      case 'prop':
        return 'color'
      default:
        return 'all'
    }
  }

  // Active slot definition
  const activeSlot = useMemo(() => {
    return slots.find((s) => s.slotKey === activeSlotKey)
  }, [slots, activeSlotKey])

  // Auto switch tab when activeSlotKey changes
  useEffect(() => {
    if (activeSlotKey && activeSlot) {
      setActiveTab(getTabForSlotType(activeSlot.slotType))
    }
  }, [activeSlotKey, activeSlot])

  // Track set of used asset IDs
  const usedAssetIds = useMemo(() => {
    const ids = new Set<string>()
    for (const state of Object.values(slotConfig)) {
      if (state.assetId) {
        ids.add(state.assetId)
      }
    }
    return ids
  }, [slotConfig])

  // Filter assets based on activeTab and searchQuery
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // 1. Tab filter
      let matchesTab = true
      if (activeTab === 'drape') {
        matchesTab = asset.assetType === 'drape' || asset.assetType === 'drape_detail'
      } else if (activeTab === 'flower') {
        matchesTab = asset.assetType === 'flower'
      } else if (activeTab === 'text') {
        matchesTab = asset.assetType === 'text_name' || asset.assetType === 'text_date'
      } else if (activeTab === 'color') {
        matchesTab = asset.assetType === 'color_accent' || asset.assetType === 'prop'
      }

      if (!matchesTab) return false

      // 2. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = asset.name.toLowerCase().includes(query)
        const matchesTags = asset.tags.some((t) => t.toLowerCase().includes(query))
        return matchesName || matchesTags
      }

      return true
    })
  }, [assets, activeTab, searchQuery])

  const currentSlotState = activeSlotKey ? slotConfig[activeSlotKey] : undefined

  return (
    <div
      className="no-scrollbar"
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      {/* Header & Tabs */}
      <div style={{ padding: '16px', borderBottom: '1px solid #334155' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🎨</span> Thư Viện Mẫu & Tùy Chỉnh
        </h3>

        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 Tìm theo tên hoặc #tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f8fafc',
            fontSize: '12px',
            marginBottom: '10px',
            outline: 'none'
          }}
        />

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0f172a', padding: '4px', borderRadius: '8px' }}>
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'drape', label: 'Rèm' },
              { id: 'flower', label: 'Hoa' },
              { id: 'text', label: 'Bộ Chữ' },
              { id: 'color', label: 'Khác' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === tab.id ? '#38bdf8' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Integrated Curtain Color Filter Control (Shown when 'drape' tab is active) */}
      {activeTab === 'drape' && onApplyColor && (
        <div style={{ padding: '12px 16px 0 16px' }}>
          <CurtainColorFilterControl
            slotLabel={activeSlot?.label}
            currentColorOverride={currentSlotState?.colorOverride || '#991B1B'}
            currentFilterMode={currentSlotState?.filterMode}
            currentColorSaturation={currentSlotState?.colorSaturation}
            onApplyColor={onApplyColor}
          />
        </div>
      )}

      {/* 2. Integrated Live Text Customizer (Shown when 'text' tab is active) */}
      {activeTab === 'text' && (
        <div style={{ padding: '12px 16px 0 16px' }}>
          <TextAssetCustomizer
            onApply={(customAsset) => onAssetClick(customAsset, activeSlotKey)}
          />
        </div>
      )}

      {/* Preset Asset Gallery Header */}
      <div style={{ padding: '12px 16px 4px 16px', fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>📦 Danh Sách Mẫu Có Sẵn:</span>
        <span style={{ fontSize: '10px', color: '#64748b' }}>Click để áp dụng</span>
      </div>

      {/* Asset Grid */}
      <div
        className="no-scrollbar"
        style={{
          padding: '8px 16px 16px 16px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          alignContent: 'start',
          flex: 1,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => (
            <DraggableAsset
              key={asset.id}
              asset={asset}
              isUsed={usedAssetIds.has(asset.id)}
              onClick={() => onAssetClick(asset, activeSlotKey)}
            />
          ))
        ) : (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#64748b', padding: '24px 0', fontSize: '12px' }}>
            Không tìm thấy mẫu phù hợp
          </div>
        )}
      </div>
    </div>
  )
}
