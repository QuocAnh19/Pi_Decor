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

  // Hold-to-unlock snap & Alt key bypass state
  const [isSnapUnlocked, setIsSnapUnlocked] = useState(false)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for Alt key press to temporarily bypass snapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setIsAltPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setIsAltPressed(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

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
      activationConstraint: { distance: 4 }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const slotId = event.active.id as string
    onSlotSelect(slotId)
    setDragDelta(null)
    setIsSnapUnlocked(false)
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta(event.delta)

    const activeSlot = slots.find((s) => s.id === selectedSlotId)
    if (activeSlot && dimensions.width > 0) {
      const currentPxX = activeSlot.normX * dimensions.width + event.delta.x
      const currentPxY = activeSlot.normY * dimensions.height + event.delta.y
      const currentNormX = currentPxX / dimensions.width
      const currentNormY = currentPxY / dimensions.height

      const nearCenter = Math.abs(currentNormX - 0.5) < 0.018 || Math.abs(currentNormY - 0.5) < 0.018

      // If user holds still or moves slowly near line for > 300ms, automatically unlock magnet snap!
      if (nearCenter && !isSnapUnlocked && !holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          setIsSnapUnlocked(true)
        }, 300)
      } else if (!nearCenter) {
        if (holdTimerRef.current) {
          clearTimeout(holdTimerRef.current)
          holdTimerRef.current = null
        }
        setIsSnapUnlocked(false)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    setDragDelta(null)
    setIsSnapUnlocked(false)
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (!active || (delta.x === 0 && delta.y === 0)) return

    const slotId = active.id as string
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return

    // Convert starting norm pos + pixel delta to new normalized pos
    const startPxX = slot.normX * dimensions.width
    const startPxY = slot.normY * dimensions.height

    const endPxX = startPxX + delta.x
    const endPxY = startPxY + delta.y

    const newNorm = svgToNormalized(endPxX, endPxY, dimensions.width, dimensions.height)
    let normX = newNorm.x
    let normY = newNorm.y

    // Apply magnet snap ONLY if snap is not bypassed by Hold-to-unlock or Alt key
    if (!isSnapUnlocked && !isAltPressed) {
      if (Math.abs(normX - 0.5) < 0.012) {
        normX = 0.5
      }
      if (Math.abs(normY - 0.5) < 0.012) {
        normY = 0.5
      }
    }

    onSlotMove(slotId, normX, normY)
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

  // Canva / Figma style Smart Alignment Guides (Horizontal & Vertical Center + Other Slots)
  const renderSmartGuides = (w: number, h: number) => {
    const activeSlot = slots.find((s) => s.id === selectedSlotId)
    if (!activeSlot) return null

    let currentNormX = activeSlot.normX
    let currentNormY = activeSlot.normY

    if (dragDelta) {
      const currentPxX = activeSlot.normX * w + dragDelta.x
      const currentPxY = activeSlot.normY * h + dragDelta.y
      currentNormX = currentPxX / w
      currentNormY = currentPxY / h
    }

    const isCenterH = Math.abs(currentNormX - 0.5) < 0.018
    const isCenterV = Math.abs(currentNormY - 0.5) < 0.018

    const alignedOtherX = slots.filter(
      (s) => s.id !== activeSlot.id && Math.abs(currentNormX - s.normX) < 0.012
    )
    const alignedOtherY = slots.filter(
      (s) => s.id !== activeSlot.id && Math.abs(currentNormY - s.normY) < 0.012
    )

    if (!isCenterH && !isCenterV && alignedOtherX.length === 0 && alignedOtherY.length === 0 && !isSnapUnlocked) {
      return null
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 20
        }}
        viewBox={`0 0 ${w} ${h}`}
      >
        {/* Horizontal Center Guide Line (Vertical Cyan Line at X = 50%) */}
        {isCenterH && (
          <g>
            <line
              x1={w / 2}
              y1={0}
              x2={w / 2}
              y2={h}
              stroke={isSnapUnlocked ? '#b98a3e' : '#a15c2e'}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <rect
              x={w / 2 - (isSnapUnlocked ? 75 : 50)}
              y={10}
              width={isSnapUnlocked ? 150 : 100}
              height={20}
              rx={10}
              fill={isSnapUnlocked ? '#b98a3e' : '#a15c2e'}
            />
            <text x={w / 2} y={23} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="700">
              {isSnapUnlocked ? 'Đã Mở Khóa Dính (Tự Do)' : 'Căn Giữa Ngang'}
            </text>
          </g>
        )}

        {/* Vertical Center Guide Line (Horizontal Line at Y = 50%) */}
        {isCenterV && (
          <g>
            <line
              x1={0}
              y1={h / 2}
              x2={w}
              y2={h / 2}
              stroke={isSnapUnlocked ? '#b98a3e' : '#a15c2e'}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <rect
              x={12}
              y={h / 2 - 10}
              width={isSnapUnlocked ? 140 : 95}
              height={20}
              rx={10}
              fill={isSnapUnlocked ? '#b98a3e' : '#a15c2e'}
            />
            <text x={isSnapUnlocked ? 82 : 60} y={h / 2 + 4} textAnchor="middle" fill="#ffffff" fontSize={10} fontWeight="700">
              {isSnapUnlocked ? 'Mở Khóa Dính' : 'Căn Giữa Dọc'}
            </text>
          </g>
        )}

        {/* Aligned with other slots (X Axis Alignment) */}
        {alignedOtherX.map((other) => (
          <line
            key={`guide-x-${other.id}`}
            x1={other.normX * w}
            y1={0}
            x2={other.normX * w}
            y2={h}
            stroke="#b4586b"
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
        ))}

        {/* Aligned with other slots (Y Axis Alignment) */}
        {alignedOtherY.map((other) => (
          <line
            key={`guide-y-${other.id}`}
            x1={0}
            y1={other.normY * h}
            x2={w}
            y2={other.normY * h}
            stroke="#b4586b"
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
        ))}
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

        {/* Canva/Figma Style Smart Alignment Guides */}
        {renderSmartGuides(dimensions.width, dimensions.height)}

        {/* Draggable Slot Markers Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
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
