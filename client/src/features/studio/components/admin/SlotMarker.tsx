import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { SlotDefinition, SlotType } from '../../types'
import { normalizedToSVG } from '../../utils/coordinates'

export interface SlotMarkerProps {
  slot: SlotDefinition
  canvasWidth: number
  canvasHeight: number
  isSelected: boolean
  onClick: () => void
  onResize?: (slotId: string, patch: Partial<SlotDefinition>) => void
  showDebugCoords?: boolean
}

const getSlotIcon = (type: SlotType): string => {
  switch (type) {
    case 'drape':
      return '🪟'
    case 'drape_detail':
      return '🎗️'
    case 'flower':
      return '🌸'
    case 'text_name':
    case 'text_date':
      return '✍️'
    case 'color_accent':
      return '🎨'
    case 'prop':
      return '📦'
    default:
      return '📍'
  }
}

type HandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export const SlotMarker: React.FC<SlotMarkerProps> = ({
  slot,
  canvasWidth,
  canvasHeight,
  isSelected,
  onClick,
  onResize,
  showDebugCoords = false
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: slot.id,
    data: { slot }
  })

  // Compute pixel position from normalized coordinates
  const pos = normalizedToSVG(slot.normX, slot.normY, canvasWidth, canvasHeight)

  const widthPx = (slot.normWidth ?? 0.2) * canvasWidth
  const heightPx = (slot.normHeight ?? 0.2) * canvasHeight

  const deltaX = transform ? transform.x : 0
  const deltaY = transform ? transform.y : 0

  const icon = getSlotIcon(slot.slotType)

  // Interactive Resizing Handle Handler
  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    direction: HandleDirection
  ) => {
    e.stopPropagation()
    e.preventDefault()

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const initialNormX = slot.normX
    const initialNormY = slot.normY
    const initialNormW = slot.normWidth ?? 0.2
    const initialNormH = slot.normHeight ?? 0.2

    const initialLeft = initialNormX - initialNormW / 2
    const initialRight = initialNormX + initialNormW / 2
    const initialTop = initialNormY - initialNormH / 2
    const initialBottom = initialNormY + initialNormH / 2

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY

      const deltaPxX = currentX - clientX
      const deltaPxY = currentY - clientY

      const deltaNormX = deltaPxX / canvasWidth
      const deltaNormY = deltaPxY / canvasHeight

      let currentLeft = initialLeft
      let currentRight = initialRight
      let currentTop = initialTop
      let currentBottom = initialBottom

      // Horizontal edge dragging (Opposite side stays 100% fixed)
      if (direction.includes('e')) {
        currentRight = Math.max(initialLeft + 0.05, Math.min(1.0, initialRight + deltaNormX))
      } else if (direction.includes('w')) {
        currentLeft = Math.max(0.0, Math.min(initialRight - 0.05, initialLeft + deltaNormX))
      }

      // Vertical edge dragging (Opposite side stays 100% fixed)
      if (direction.includes('s')) {
        currentBottom = Math.max(initialTop + 0.05, Math.min(1.0, initialBottom + deltaNormY))
      } else if (direction.includes('n')) {
        currentTop = Math.max(0.0, Math.min(initialBottom - 0.05, initialTop + deltaNormY))
      }

      const newNormW = currentRight - currentLeft
      const newNormH = currentBottom - currentTop
      const newNormX = currentLeft + newNormW / 2
      const newNormY = currentTop + newNormH / 2

      onResize?.(slot.id, {
        normX: newNormX,
        normY: newNormY,
        normWidth: newNormW,
        normHeight: newNormH
      })
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleMouseMove)
      window.removeEventListener('touchend', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleMouseMove)
    window.addEventListener('touchend', handleMouseUp)
  }

  const resizerHandles: { dir: HandleDirection; cursor: string; style: React.CSSProperties }[] = [
    { dir: 'nw', cursor: 'nwse-resize', style: { top: '-5px', left: '-5px' } },
    { dir: 'n', cursor: 'ns-resize', style: { top: '-5px', left: '50%', transform: 'translateX(-50%)' } },
    { dir: 'ne', cursor: 'nesw-resize', style: { top: '-5px', right: '-5px' } },
    { dir: 'e', cursor: 'ew-resize', style: { top: '50%', right: '-5px', transform: 'translateY(-50%)' } },
    { dir: 'se', cursor: 'nwse-resize', style: { bottom: '-5px', right: '-5px' } },
    { dir: 's', cursor: 'ns-resize', style: { bottom: '-5px', left: '50%', transform: 'translateX(-50%)' } },
    { dir: 'sw', cursor: 'nesw-resize', style: { bottom: '-5px', left: '-5px' } },
    { dir: 'w', cursor: 'ew-resize', style: { top: '50%', left: '-5px', transform: 'translateY(-50%)' } }
  ]

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        position: 'absolute',
        left: `${pos.x + deltaX}px`,
        top: `${pos.y + deltaY}px`,
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        transform: 'translate(-50%, -50%)',
        border: isSelected
          ? '1.5px solid #38bdf8'
          : showDebugCoords
          ? '1.5px dashed rgba(244, 63, 94, 0.6)'
          : '1px dashed rgba(255, 255, 255, 0.25)',
        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.04)' : 'transparent',
        borderRadius: '8px',
        boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.75 : 1,
        userSelect: 'none',
        zIndex: isSelected ? 30 : slot.zIndex + 10,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease, border-color 0.2s ease'
      }}
    >
      {/* Small Badge Tag at Top Center */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: isSelected ? '#38bdf8' : 'rgba(15, 23, 42, 0.85)',
          color: isSelected ? '#0f172a' : '#cbd5e1',
          border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
          borderRadius: '12px',
          padding: '1px 8px',
          fontSize: '10px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          pointerEvents: 'none'
        }}
      >
        <span>{icon}</span>
        <span>{slot.label}</span>
      </div>

      {showDebugCoords && (
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', position: 'absolute', bottom: '4px', pointerEvents: 'none' }}>
          ({slot.normX.toFixed(2)}, {slot.normY.toFixed(2)})
        </div>
      )}

      {/* Center Anchor Point Dot (Admin Debug only) */}
      {showDebugCoords && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isSelected ? '#38bdf8' : '#f43f5e',
            border: '1px solid #ffffff',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* 8 Corner & Edge Resizer Handles (Only visible when Selected) */}
      {isSelected &&
        resizerHandles.map((handle) => (
          <div
            key={handle.dir}
            onMouseDown={(e) => handleResizeStart(e, handle.dir)}
            onTouchStart={(e) => handleResizeStart(e, handle.dir)}
            title={`Kéo để chỉnh kích thước slot (${handle.dir.toUpperCase()})`}
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              backgroundColor: '#ffffff',
              border: '2px solid #38bdf8',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
              cursor: handle.cursor,
              zIndex: 40,
              ...handle.style
            }}
          />
        ))}
    </div>
  )
}
