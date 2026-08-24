import React, { useRef, useState, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent
} from '@dnd-kit/core'

import { Template, SlotDefinition, SlotConfig } from '../../types'
import { SVGCanvas } from '../shared/SVGCanvas'
import { SlotMarker } from './SlotMarker'
import { svgToNormalized } from '../../utils/coordinates'

export interface AdminCanvasProps {
  template: Template
  slots: SlotDefinition[]
  slotConfig?: SlotConfig
  selectedSlotId: string | null
  showGrid: boolean
  onSlotSelect: (slotId: string) => void
  onSlotMove: (slotId: string, normX: number, normY: number) => void
  onSlotUpdate?: (slotId: string, patch: Partial<SlotDefinition>) => void
  onDoubleClickEmpty?: (normX: number, normY: number) => void
}

export const AdminCanvas: React.FC<AdminCanvasProps> = ({
  template,
  slots,
  slotConfig = {},
  selectedSlotId,
  showGrid,
  onSlotSelect,
  onSlotMove,
  onSlotUpdate,
  onDoubleClickEmpty
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) {
        // Enforce exact 4:3 aspect ratio (800x600) based on container width to prevent vertical shifting
        const aspectHeight = Math.round(rect.width * (600 / 800))
        setDimensions({ width: rect.width, height: aspectHeight })
      }
    }

    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const slotId = event.active.id as string
    onSlotSelect(slotId)
    setDragDelta(null)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta(event.delta)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    setDragDelta(null)

    if (!active || (delta.x === 0 && delta.y === 0)) return

    const slotId = active.id as string
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return

    // Convert starting norm pos + pixel delta to new normalized pos with 100% free movement
    const startPxX = slot.normX * dimensions.width
    const startPxY = slot.normY * dimensions.height

    const endPxX = startPxX + delta.x
    const endPxY = startPxY + delta.y

    const newNorm = svgToNormalized(endPxX, endPxY, dimensions.width, dimensions.height)
    onSlotMove(slotId, newNorm.x, newNorm.y)
  }

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onDoubleClickEmpty) return

    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const norm = svgToNormalized(clickX, clickY, dimensions.width, dimensions.height)
    onDoubleClickEmpty(norm.x, norm.y)
  }

  const renderGridLines = (w: number, h: number, gridSize: number = 10) => {
    const verticals = Array.from({ length: Math.floor(w / gridSize) }).map(
      (_, i) => `M ${i * gridSize} 0 V ${h}`
    )
    const horizontals = Array.from({ length: Math.floor(h / gridSize) }).map(
      (_, i) => `M 0 ${i * gridSize} H ${w}`
    )

    return (
      <svg
        data-no-snapshot="true"
        className="guide-line"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5
        }}
        viewBox={`0 0 ${w} ${h}`}
      >
        <path
          d={[...verticals, ...horizontals].join(' ')}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={0.5}
        />
      </svg>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={containerRef}
        id="studio-canvas-stage"
        data-studio-canvas="true"
        onDoubleClick={handleCanvasDoubleClick}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          aspectRatio: '800 / 600',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #e7ded0',
          boxShadow: '0 12px 32px rgba(39, 22, 32, 0.08)',
          margin: '0 auto'
        }}
      >
        {/* Base Template SVG Canvas */}
        <SVGCanvas
          template={template}
          slots={slots}
          slotConfig={slotConfig}
          width={dimensions.width}
          height={dimensions.height}
          dragState={dragDelta && selectedSlotId ? { slotId: selectedSlotId, delta: dragDelta } : null}
          showBorders={true}
        />

        {/* SVG Grid Overlay */}
        {showGrid && renderGridLines(dimensions.width, dimensions.height, 10)}

        {/* Draggable Slot Markers Overlay */}
        <div
          data-no-snapshot="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {slots.map((slot) => (
            <SlotMarker
              key={slot.id}
              slot={slot}
              canvasWidth={dimensions.width}
              canvasHeight={dimensions.height}
              isSelected={slot.id === selectedSlotId}
              onClick={() => onSlotSelect(slot.id)}
              onResize={onSlotUpdate}
              showDebugCoords={true}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}
