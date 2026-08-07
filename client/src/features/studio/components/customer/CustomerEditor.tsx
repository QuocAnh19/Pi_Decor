import React, { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'

import { seedTemplates, seedSlots, seedAssets } from '../../data/seed/templates'
import { curtainRules } from '../../rules/curtainRules'
import { useSlotDnD } from '../../hooks/useSlotDnD'
import { SVGCanvas } from '../shared/SVGCanvas'
import { SlotMarker } from '../admin/SlotMarker'
import { AssetPicker } from './AssetPicker'
import { DraggableAsset } from './DraggableAsset'
import { SaveBar } from './SaveBar'
import { svgToNormalized } from '../../utils/coordinates'
import { Asset, SlotDefinition, SlotConfig } from '../../types'

export interface CustomerEditorProps {
  templateId?: string
  overrideSlots?: SlotDefinition[]
  overrideSlotConfig?: SlotConfig
  overrideRules?: any[]
}

export const CustomerEditor: React.FC<CustomerEditorProps> = ({
  templateId = 'tpl-classic-01',
  overrideSlots,
  overrideSlotConfig,
  overrideRules
}) => {
  // Load published template data from localStorage if available, fallback to seed data
  const publishedKey = `pidecor_published_${templateId}`
  const publishedData = React.useMemo(() => {
    try {
      const saved = localStorage.getItem(publishedKey)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse published template data:', e)
    }
    return null
  }, [publishedKey])

  const template = publishedData?.template || seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  const initialSlots: SlotDefinition[] = overrideSlots || publishedData?.slots || seedSlots
  const assets: Asset[] = seedAssets
  const rules = overrideRules || publishedData?.rules || curtainRules
  const initialConfig = overrideSlotConfig || publishedData?.slotConfig || {}

  // Editable slot positions & dimensions for customer canvas fine-tuning
  const [editableSlots, setEditableSlots] = useState<SlotDefinition[]>(() => initialSlots)

  useEffect(() => {
    setEditableSlots(initialSlots)
  }, [initialSlots])

  const handleSlotMove = (slotId: string, normX: number, normY: number) => {
    setEditableSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s))
    )
  }

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setEditableSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s))
    )
  }

  const {
    slotConfig,
    activeAsset,
    setActiveAsset,
    assignAsset,
    assignColor,
    resetConfig,
    lockedSlots,
    isDirty
  } = useSlotDnD(editableSlots, rules, template.id, initialConfig)

  const [activeSlotKey, setActiveSlotKey] = useState<string | undefined>('drape-main')

  // Ref & dimensions tracking for responsive canvas overlay placement
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) {
        const aspectHeight = Math.round(rect.width * (600 / 800))
        setDimensions({ width: rect.width, height: aspectHeight })
      }
    }

    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  // Dnd Sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 6 }
    })
  )

  const [dragDelta, setDragDelta] = useState<{ x: number; y: number } | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const slotId = event.active.id as string
    const targetSlot = editableSlots.find((s) => s.id === slotId)
    if (targetSlot) {
      setActiveSlotKey(targetSlot.slotKey)
    }
    const draggedAsset = event.active.data.current?.asset as Asset | undefined
    if (draggedAsset) {
      setActiveAsset(draggedAsset)
    }
    setDragDelta(null)
  }

  const handleDragMove = (event: any) => {
    setDragDelta(event.delta)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event
    setDragDelta(null)
    setActiveAsset(null)

    // Handle Slot Marker dragging (customer fine-tuning slot position on canvas)
    const activeSlotData = active.data.current?.slot as SlotDefinition | undefined
    if (activeSlotData && (delta.x !== 0 || delta.y !== 0) && dimensions.width > 0) {
      const startPxX = activeSlotData.normX * dimensions.width
      const startPxY = activeSlotData.normY * dimensions.height
      const endPxX = startPxX + delta.x
      const endPxY = startPxY + delta.y
      const newNorm = svgToNormalized(endPxX, endPxY, dimensions.width, dimensions.height)
      handleSlotMove(activeSlotData.id, newNorm.x, newNorm.y)
      return
    }

    if (!over) return

    const draggedAsset = active.data.current?.asset as Asset | undefined
    const slotKey = over.id as string
    const targetSlot = editableSlots.find((s) => s.slotKey === slotKey)

    if (!draggedAsset || !targetSlot) return
    if (draggedAsset.assetType !== targetSlot.slotType) {
      return
    }
    if (lockedSlots.has(slotKey)) {
      return
    }

    assignAsset(slotKey, draggedAsset)
    setActiveSlotKey(slotKey)
  }

  // Handle asset click from AssetPicker
  const handleAssetClick = (asset: Asset, targetSlotKey?: string) => {
    const slotToAssign = targetSlotKey || activeSlotKey
    if (!slotToAssign) return

    const targetSlot = editableSlots.find((s) => s.slotKey === slotToAssign)
    if (!targetSlot) return

    if (asset.assetType !== targetSlot.slotType) {
      const suitableSlot = editableSlots.find((s) => s.slotType === asset.assetType && !lockedSlots.has(s.slotKey))
      if (suitableSlot) {
        assignAsset(suitableSlot.slotKey, asset)
        setActiveSlotKey(suitableSlot.slotKey)
      } else {
        alert(`Mẫu '${asset.name}' không phù hợp với slot đang chọn (${targetSlot.label})`)
      }
      return
    }

    if (lockedSlots.has(slotToAssign)) {
      alert(`Slot ${targetSlot.label} đang bị khóa bởi quy tắc rèm đỏ đô!`)
      return
    }

    assignAsset(slotToAssign, asset)
    setActiveSlotKey(slotToAssign)
  }

  const selectedSlot = editableSlots.find((s) => s.slotKey === activeSlotKey)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          padding: '12px 20px',
          gap: '12px',
          boxSizing: 'border-box'
        }}
      >
        {/* Header Bar */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid #334155'
          }}
        >
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Playfair Display', serif", color: '#ffffff' }}>
              📌 {template.name}
            </h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
              Trình thiết kế phông cưới • Click chọn hoặc kéo thả trực tiếp để tùy chỉnh vị trí & kích thước
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={resetConfig}
              style={{
                padding: '6px 12px',
                backgroundColor: '#334155',
                color: '#cbd5e1',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🔄 Đặt lại
            </button>

            <SaveBar
              onSaveDraft={() => console.log('Draft saved to localStorage')}
              onSaveFinal={() => console.log('Final design saved:', slotConfig)}
              onExportPDF={() => console.log('Export PDF triggered')}
              isDirty={isDirty}
            />
          </div>
        </header>

        {/* Main Work Area: 3-Column Layout (Left Slots Sidebar | Center Demo Canvas | Right Customizer Inspector) */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 340px', gap: '16px', flex: 1, alignItems: 'start' }}>
          {/* Left Column: Component Slots List (Layers Sidebar) */}
          <div
            className="no-scrollbar"
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'sticky',
              top: '12px',
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto'
            }}
          >
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧩</span> Thành Phần Phông
              </h3>
              <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                Click để tùy chỉnh chi tiết
              </p>
            </div>

            {editableSlots.map((slot) => {
              const isSelected = slot.slotKey === activeSlotKey
              const state = slotConfig[slot.slotKey]
              const hasAsset = Boolean(state?.asset)
              const icon = slot.slotType === 'drape' ? '🪟' : slot.slotType === 'drape_detail' ? '🎗️' : slot.slotType === 'flower' ? '🌸' : '✍️'

              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlotKey(slot.slotKey)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    gap: '4px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: isSelected ? '#0f172a' : '#1e293b',
                    color: isSelected ? '#38bdf8' : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                    <span style={{ fontSize: '14px' }}>{icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: isSelected ? '700' : '600', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {slot.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: hasAsset ? '#6ee7b7' : '#94a3b8', paddingLeft: '20px' }}>
                    {hasAsset ? `✓ ${state?.asset?.name}` : '• Mẫu mặc định'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Center Column: Canvas Container & Interactive Slot Overlays */}
          <div
            ref={canvasContainerRef}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              aspectRatio: '800 / 600',
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #334155',
              margin: '0 auto'
            }}
          >
            {/* SVG Canvas Base */}
            <SVGCanvas
              template={template}
              slots={editableSlots}
              slotConfig={slotConfig}
              width={dimensions.width}
              height={dimensions.height}
              dragState={dragDelta && selectedSlot ? { slotId: selectedSlot.id, delta: dragDelta } : null}
            />

            {/* Interactive Slot Overlay Markers */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            >
              {editableSlots.map((slot: SlotDefinition) => {
                const isSelected = slot.slotKey === activeSlotKey

                return (
                  <SlotMarker
                    key={slot.id}
                    slot={slot}
                    canvasWidth={dimensions.width}
                    canvasHeight={dimensions.height}
                    isSelected={isSelected}
                    onClick={() => setActiveSlotKey(slot.slotKey)}
                    onResize={handleSlotUpdate}
                    showDebugCoords={false}
                  />
                )
              })}
            </div>
          </div>

          {/* Right Column: Sidebar Customization Controls & Asset Picker */}
          <div className="no-scrollbar" style={{ position: 'sticky', top: '12px', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
            <AssetPicker
              assets={assets}
              activeSlotKey={activeSlotKey}
              slots={editableSlots}
              slotConfig={slotConfig}
              onAssetClick={handleAssetClick}
              onApplyColor={(hex, filterMode, saturation) => {
                if (activeSlotKey) {
                  assignColor(activeSlotKey, hex, filterMode, saturation)
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Drag Overlay */}
      <DragOverlay>
        {activeAsset ? (
          <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left' }}>
            <DraggableAsset asset={activeAsset} isBeingDragged />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
