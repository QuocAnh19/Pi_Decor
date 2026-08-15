import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SlotDefinition, Asset } from '../../types'

export interface AnchorSlotProps {
  slot: SlotDefinition
  assignedAsset?: Asset
  isLocked?: boolean
  lockedReason?: string
  activeAssetType?: string | null
  onRemove?: () => void
  onSelectSlot?: () => void
  isActiveSlot?: boolean
  style?: React.CSSProperties
}

export const AnchorSlot: React.FC<AnchorSlotProps> = ({
  slot,
  assignedAsset,
  isLocked = false,
  lockedReason = '',
  activeAssetType = null,
  onRemove,
  onSelectSlot,
  isActiveSlot = false,
  style = {}
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: slot.slotKey,
    data: { slot },
    disabled: isLocked
  })

  const hasAsset = Boolean(assignedAsset)
  const isDraggingAny = activeAssetType !== null
  const isCompatible = isDraggingAny && activeAssetType === slot.slotType
  const isIncompatibleHover = isOver && !isCompatible && !isLocked

  // Determine borders, backgrounds, and badges depending on state
  let borderColor = '#64748b' // default slate border
  let backgroundColor = 'rgba(15, 23, 42, 0.05)'
  let borderStyle = 'dashed'
  let boxShadow = 'none'

  if (isLocked) {
    borderColor = '#ef4444' // red
    backgroundColor = 'rgba(239, 68, 68, 0.08)'
    borderStyle = 'solid'
  } else if (isOver && isCompatible) {
    borderColor = '#10b981' // emerald green hover
    backgroundColor = 'rgba(16, 185, 129, 0.15)'
    borderStyle = 'solid'
    boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)'
  } else if (isIncompatibleHover) {
    borderColor = '#f43f5e'
    backgroundColor = 'rgba(244, 63, 94, 0.15)'
    borderStyle = 'dashed'
  } else if (hasAsset) {
    borderColor = isActiveSlot ? '#38bdf8' : 'rgba(52, 211, 153, 0.35)'
    backgroundColor = 'transparent' // Completely transparent background to show asset
    borderStyle = 'solid'
  } else if (isActiveSlot) {
    borderColor = '#38bdf8'
    backgroundColor = 'rgba(56, 189, 248, 0.08)'
    borderStyle = 'solid'
    boxShadow = '0 0 12px rgba(56, 189, 248, 0.3)'
  } else if (slot.required) {
    borderColor = '#f59e0b' // amber
    backgroundColor = 'rgba(245, 158, 11, 0.04)'
  }

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation()
        onSelectSlot?.()
      }}
      title={isLocked ? `🔒 ${lockedReason || 'Đã bị khóa bởi quy tắc'}` : slot.label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        borderRadius: '8px',
        border: `2px ${borderStyle} ${borderColor}`,
        backgroundColor,
        boxShadow,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        ...style
      }}
    >
      {/* Locked Badge */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
        >
          🔒
        </div>
      )}

      {/* Remove Button when Asset is present */}
      {hasAsset && !isLocked && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#f43f5e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 10
          }}
        >
          ×
        </button>
      )}

      {/* Slot Content Display */}
      {isIncompatibleHover ? (
        <div style={{ color: '#f43f5e', fontSize: '11px', fontWeight: '600', textAlign: 'center' }}>
          Sai loại slot
        </div>
      ) : hasAsset ? (
        <div style={{ textAlign: 'center', width: '100%', pointerEvents: 'none' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: isLocked ? '#fca5a5' : '#6ee7b7',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {assignedAsset?.name}
          </div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
            Đã chọn
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', width: '100%', pointerEvents: 'none' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: slot.required ? '#fbbf24' : '#cbd5e1' }}>
            {slot.label}
          </div>
          {slot.required && (
            <span
              style={{
                fontSize: '9px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                padding: '1px 6px',
                borderRadius: '4px',
                marginTop: '3px',
                display: 'inline-block'
              }}
            >
              Bắt buộc
            </span>
          )}
        </div>
      )}
    </div>
  )
}
