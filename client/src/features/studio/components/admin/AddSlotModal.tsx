import React, { useState, useEffect } from 'react'
import { SlotDefinition, SlotType, getDefaultSlotDimensions } from '../../types'

export interface AddSlotModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (newSlot: Omit<SlotDefinition, 'id' | 'templateId'>) => void
  existingSlots?: SlotDefinition[]
  existingSlotKeys: string[]
  initialNormPos?: { normX: number; normY: number }
}

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingSlots = [],
  existingSlotKeys,
  initialNormPos
}) => {
  const [slotKey, setSlotKey] = useState('')
  const [label, setLabel] = useState('')
  const [slotType, setSlotType] = useState<SlotType>('drape')
  const [required, setRequired] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSlotKey('')
      setLabel('')
      setSlotType('drape')
      setRequired(false)
      setErrorMessage('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedKey = slotKey.trim().toLowerCase()
    if (!trimmedKey) {
      setErrorMessage('Vui lòng nhập Slot Key!')
      return
    }

    // Key format validation (kebab-case)
    if (!/^[a-z0-9-]+$/.test(trimmedKey)) {
      setErrorMessage('Slot Key chỉ được chứa chữ thường (a-z), số (0-9) và dấu gạch ngang (-)!')
      return
    }

    // Unique validation
    if (existingSlotKeys.includes(trimmedKey)) {
      setErrorMessage(`Slot Key '${trimmedKey}' đã tồn tại trong template này!`)
      return
    }

    if (!label.trim()) {
      setErrorMessage('Vui lòng nhập Tên hiển thị!')
      return
    }

    // Inherit dimensions from existing slot of same type if present, or fallback to default
    const sameTypeSlot = existingSlots.find((s) => s.slotType === slotType)
    const defaultDims = getDefaultSlotDimensions(slotType)
    const normWidth = sameTypeSlot?.normWidth ?? defaultDims.normWidth
    const normHeight = sameTypeSlot?.normHeight ?? defaultDims.normHeight

    onAdd({
      slotKey: trimmedKey,
      label: label.trim(),
      slotType,
      normX: initialNormPos?.normX ?? 0.5,
      normY: initialNormPos?.normY ?? 0.5,
      normWidth,
      normHeight,
      allowScale: true,
      allowRotate: true,
      mirrorX: false,
      zIndex: sameTypeSlot?.zIndex ?? 5,
      sortOrder: existingSlotKeys.length + 1,
      required
    })

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
            ➕ Thêm Slot Neo Mới
          </h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid #f43f5e',
              color: '#f43f5e',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '16px'
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Slot Key Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
              Slot Key (Dạng kebab-case, ví dụ: flower-right)
            </label>
            <input
              type="text"
              placeholder="nhap-slot-key-moi"
              value={slotKey}
              onChange={(e) => setSlotKey(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Label Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
              Tên Hiển Thị (Label)
            </label>
            <input
              type="text"
              placeholder="VD: Cụm Hoa Bên Phải"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Slot Type Select */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#f8fafc', display: 'block', marginBottom: '4px' }}>
              Loại Slot
            </label>
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value as SlotType)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f8fafc',
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

          {/* Required Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f8fafc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            ⭐ Thành phần bắt buộc điền
          </label>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#334155',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ➕ Tạo Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
