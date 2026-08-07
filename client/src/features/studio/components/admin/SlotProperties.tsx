import React from 'react'
import { SlotDefinition, SlotType, Asset, SlotConfig } from '../../types'
import { TextAssetCustomizer } from '../customer/TextAssetCustomizer'
import { CurtainColorFilterControl } from '../shared/CurtainColorFilterControl'

export interface SlotPropertiesProps {
  slot: SlotDefinition | null
  slotConfig?: SlotConfig
  onUpdate: (slotId: string, patch: Partial<SlotDefinition>) => void
  onDelete: (slotId: string) => void
  onAddAsset?: (asset: Omit<Asset, 'id'>, assignToCurrentSlot?: boolean) => void
  onAssignColor?: (
    slotKey: string,
    hex: string,
    filterMode?: 'multiply_blend' | 'flat_tint' | 'color_map',
    saturation?: number
  ) => void
}

export const SlotProperties: React.FC<SlotPropertiesProps> = ({
  slot,
  slotConfig = {},
  onUpdate,
  onDelete,
  onAddAsset,
  onAssignColor
}) => {
  if (!slot) {
    return (
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #334155',
          color: '#94a3b8',
          fontSize: '13px',
          textAlign: 'center',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        👈 Chọn một Slot trên Canvas hoặc Sidebar để chỉnh sửa thuộc tính
      </div>
    )
  }

  const handleDeleteClick = () => {
    if (slot.required) {
      const confirmDelete = window.confirm(
        `⚠️ Slot '${slot.label}' là thành phần BẮT BUỘC! Xóa slot này có thể ảnh hưởng đến thiết kế của khách hàng. Bạn chắc chắn muốn xóa?`
      )
      if (!confirmDelete) return
    } else {
      const confirmDelete = window.confirm(`Bạn có chắc muốn xóa slot '${slot.label}'?`)
      if (!confirmDelete) return
    }

    onDelete(slot.id)
  }

  return (
    <div
      className="no-scrollbar"
      style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxHeight: 'calc(100vh - 140px)',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
          ⚙️ Thuộc Tính Slot (Admin)
        </h3>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
          ID: {slot.id.slice(0, 8)}...
        </span>
      </div>

      {/* Readonly Slot Key */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
          Slot Key (Unique ID)
        </label>
        <input
          type="text"
          value={slot.slotKey}
          disabled
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#64748b',
            fontSize: '13px',
            fontFamily: 'monospace'
          }}
        />
      </div>

      {/* Label */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
          Tên Hiển Thị (Label)
        </label>
        <input
          type="text"
          value={slot.label}
          onChange={(e) => onUpdate(slot.id, { label: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0f172a',
            border: '1px solid #38bdf8',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      {/* Slot Type */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
          Loại Slot (Slot Type)
        </label>
        <select
          value={slot.slotType}
          onChange={(e) => onUpdate(slot.id, { slotType: e.target.value as SlotType })}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '13px',
            outline: 'none'
          }}
        >
          <option value="drape">🪟 Rèm nền chính (drape)</option>
          <option value="drape_detail">🎗️ Chi tiết rèm lớp phủ (drape_detail)</option>
          <option value="flower">🌸 Cụm hoa trang trí (flower)</option>
          <option value="text_name">✍️ Tên chú rể & cô dâu (text_name)</option>
          <option value="text_date">📅 Ngày cưới (text_date)</option>
          <option value="color_accent">🎨 Màu nhấn (color_accent)</option>
          <option value="prop">📦 Phụ kiện khác (prop)</option>
        </select>
      </div>

      {/* Position & Size Inspection (Normalized) */}
      <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#38bdf8', marginBottom: '8px' }}>
          📐 Tọa Độ & Kích Thước Chuẩn Hóa (0.0–1.0)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Norm X: </span>
            <strong style={{ color: '#f43f5e' }}>{slot.normX.toFixed(3)}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Norm Y: </span>
            <strong style={{ color: '#f43f5e' }}>{slot.normY.toFixed(3)}</strong>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
              Rộng W (0.05–1.0):
            </label>
            <input
              type="number"
              min="0.05"
              max="1.0"
              step="0.05"
              value={slot.normWidth ?? 0.2}
              onChange={(e) => onUpdate(slot.id, { normWidth: parseFloat(e.target.value) || 0.2 })}
              style={{
                width: '100%',
                padding: '4px 8px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '12px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
              Cao H (0.05–1.0):
            </label>
            <input
              type="number"
              min="0.05"
              max="1.0"
              step="0.05"
              value={slot.normHeight ?? 0.2}
              onChange={(e) => onUpdate(slot.id, { normHeight: parseFloat(e.target.value) || 0.2 })}
              style={{
                width: '100%',
                padding: '4px 8px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        {/* Quick Alignment Tools */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => onUpdate(slot.id, { normX: 0.5 })}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '11px',
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
              fontSize: '11px',
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(slot.required)}
            onChange={(e) => onUpdate(slot.id, { required: e.target.checked })}
          />
          ⭐ Slot Bắt Buộc (Required)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(slot.allowScale)}
            onChange={(e) => onUpdate(slot.id, { allowScale: e.target.checked })}
          />
          🔍 Cho Phép Scale (Thu Phóng)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer' }}>
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
        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Z-Index (0-10)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={slot.zIndex}
            onChange={(e) => onUpdate(slot.id, { zIndex: parseInt(e.target.value) || 0 })}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Sort Order
          </label>
          <input
            type="number"
            value={slot.sortOrder}
            onChange={(e) => onUpdate(slot.id, { sortOrder: parseInt(e.target.value) || 0 })}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Delete Slot Button */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #334155' }}>
        <button
          onClick={handleDeleteClick}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🗑️ Xóa Slot Này
        </button>
      </div>
    </div>
  )
}
