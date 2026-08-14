import React from 'react'
import { SlotDefinition, SlotType, Asset, SlotConfig } from '../../types'
import type { MaterialItem } from '../../../../lib/types'
import { Input, Select } from '../../../../components/ui'
import { TextAssetCustomizer } from '../customer/TextAssetCustomizer'
import { CurtainColorFilterControl } from '../shared/CurtainColorFilterControl'
import { MaterialPickerForSlot } from './MaterialPickerForSlot'

export interface SlotPropertiesProps {
  slot: SlotDefinition | null
  slotConfig?: SlotConfig
  onUpdate: (slotId: string, patch: Partial<SlotDefinition>) => void
  onDelete: (slotId: string) => void
  onAddAsset?: (asset: Omit<Asset, 'id'>, assignToCurrentSlot?: boolean) => void
  onAssignMaterial?: (material: MaterialItem, slot: SlotDefinition) => void
  onAssignColor?: (
    slotKey: string,
    hex: string,
    filterMode?: 'multiply_blend' | 'flat_tint' | 'color_map',
    saturation?: number
  ) => void
}

const SLOT_TYPE_OPTIONS = [
  { value: 'drape', label: '🪟 Rèm nền (fabric / drape)' },
  { value: 'drape_detail', label: '🎗️ Rèm chi tiết (drape_detail)' },
  { value: 'flower', label: '🌸 Cụm hoa (flowers)' },
  { value: 'text_name', label: '✍️ Dãy chữ số (text_name)' },
]

export const SlotProperties: React.FC<SlotPropertiesProps> = ({
  slot,
  slotConfig = {},
  onUpdate,
  onDelete,
  onAddAsset,
  onAssignMaterial,
  onAssignColor
}) => {
  if (!slot) {
    return (
      <div style={{
        padding: '24px',
        color: '#94a3b8',
        fontSize: '14px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '8px'
      }}>
        <span style={{ fontSize: '24px' }}>🎯</span>
        <p style={{ margin: 0, fontWeight: '600', color: '#f8fafc' }}>Chưa chọn Slot neo nào</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
          Nhấp vào một Slot trên Canvas hoặc danh sách bên trái để chỉnh sửa toạ độ, vật liệu và kích thước.
        </p>
      </div>
    )
  }

  const handleDeleteClick = () => {
    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xoá Slot '${slot.label || slot.slotKey}'? Thao tác này sẽ xoá luôn các Rule liên quan.`)
    if (isConfirmed) {
      onDelete(slot.id)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      color: '#f8fafc',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header Slot Info */}
      <div style={{ borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '12px',
            fontFamily: 'monospace',
            backgroundColor: '#0f172a',
            color: '#38bdf8',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #334155'
          }}>
            KEY: {slot.slotKey}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Thứ tự: #{slot.sortOrder}
          </span>
        </div>
      </div>

      {/* Label Edit */}
      <div>
        <Input
          label="Tên Hiển Thị (Label)"
          type="text"
          value={slot.label}
          onChange={(e) => onUpdate(slot.id, { label: e.target.value })}
        />
      </div>

      {/* Slot Type */}
      <div>
        <Select
          label="Loại Slot (Slot Type)"
          value={slot.slotType}
          onChange={(e) => onUpdate(slot.id, { slotType: e.target.value as SlotType })}
          options={SLOT_TYPE_OPTIONS}
        />
      </div>

      {/* Normalized Coordinate Inputs */}
      <div style={{
        backgroundColor: '#0f172a',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#38bdf8' }}>
          📐 Toạ độ chuẩn hoá (0.00 – 1.00)
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <Input
            label="X (0–1):"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={slot.normX}
            onChange={(e) => onUpdate(slot.id, { normX: parseFloat(e.target.value) || 0 })}
          />

          <Input
            label="Y (0–1):"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={slot.normY}
            onChange={(e) => onUpdate(slot.id, { normY: parseFloat(e.target.value) || 0 })}
          />

          <Input
            label="Rộng W (0.05–1.0):"
            type="number"
            min="0.05"
            max="1.0"
            step="0.05"
            value={slot.normWidth ?? 0.2}
            onChange={(e) => onUpdate(slot.id, { normWidth: parseFloat(e.target.value) || 0.2 })}
          />

          <Input
            label="Cao H (0.05–1.0):"
            type="number"
            min="0.05"
            max="1.0"
            step="0.05"
            value={slot.normHeight ?? 0.2}
            onChange={(e) => onUpdate(slot.id, { normHeight: parseFloat(e.target.value) || 0.2 })}
          />
        </div>

        {/* Quick Alignment Tools */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => onUpdate(slot.id, { normX: 0.5 })}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🎯 Căn Giữa Ngang (X=0.5)
          </button>
          <button
            type="button"
            onClick={() => onUpdate(slot.id, { normY: 0.5 })}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🎯 Căn Giữa Dọc (Y=0.5)
          </button>
        </div>
      </div>

      {/* Material Picker for Selected Slot (Select from Database) */}
      {onAssignMaterial && (
        <MaterialPickerForSlot slot={slot} onAssignMaterial={onAssignMaterial} />
      )}

      {/* Embedded Live Text Customizer in Admin Panel */}
      {(slot.slotType === 'text_name' || slot.slotType === 'text_date') && onAddAsset && (
        <div>
          <TextAssetCustomizer
            onApply={(customAsset) => onAddAsset(customAsset, true)}
          />
        </div>
      )}

      {/* Curtain Color Picker & Filter Control for Active Drape Asset (Admin Panel) */}
      {(slot.slotType === 'drape' || slot.slotType === 'drape_detail') && (
        <CurtainColorFilterControl
          slotLabel={slot.label}
          currentColorOverride={slotConfig[slot.slotKey]?.colorOverride || '#991B1B'}
          currentFilterMode={slotConfig[slot.slotKey]?.filterMode || 'multiply_blend'}
          currentColorSaturation={slotConfig[slot.slotKey]?.colorSaturation}
          onApplyColor={(hex, filterMode, saturation) => {
            if (onAssignColor) {
              onAssignColor(slot.slotKey, hex, filterMode, saturation)
            }
          }}
        />
      )}

      {/* Checkbox Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#f8fafc', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(slot.required)}
            onChange={(e) => onUpdate(slot.id, { required: e.target.checked })}
          />
          ⭐ Slot Bắt Buộc (Required)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#f8fafc', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(slot.allowScale)}
            onChange={(e) => onUpdate(slot.id, { allowScale: e.target.checked })}
          />
          🔍 Cho Phép Scale (Thu Phóng)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#f8fafc', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(slot.allowRotate)}
            onChange={(e) => onUpdate(slot.id, { allowRotate: e.target.checked })}
          />
          🔄 Cho Phép Xoay (Rotate)
        </label>
      </div>

      {/* Z-Index & Sort Order */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Input
          label="Z-Index (0-10)"
          type="number"
          min="0"
          max="10"
          value={slot.zIndex}
          onChange={(e) => onUpdate(slot.id, { zIndex: parseInt(e.target.value) || 0 })}
        />

        <Input
          label="Sort Order"
          type="number"
          value={slot.sortOrder}
          onChange={(e) => onUpdate(slot.id, { sortOrder: parseInt(e.target.value) || 0 })}
        />
      </div>

      {/* Delete Slot Button */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #334155' }}>
        <button
          onClick={handleDeleteClick}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid #e11d48',
            borderRadius: '6px',
            color: '#e11d48',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🗑️ Xoá Slot Neo Này
        </button>
      </div>
    </div>
  )
}
