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

import { seedTemplates, seedSlots, seedAssets, seedPublishedSlotConfig } from '../../data/seed/templates'
import { curtainRules } from '../../rules/curtainRules'
import { useSlotDnD } from '../../hooks/useSlotDnD'
import { SVGCanvas } from '../shared/SVGCanvas'
import { SlotMarker } from '../admin/SlotMarker'
import { AssetPicker } from './AssetPicker'
import { DraggableAsset } from './DraggableAsset'
import { SaveBar } from './SaveBar'
import { SaveDesignModal } from './SaveDesignModal'
import { TemplateSelectorModal } from './TemplateSelectorModal'
import { AddSlotModal } from '../admin/AddSlotModal'
import { svgToNormalized } from '../../utils/coordinates'
import { Asset, SlotDefinition, SlotConfig } from '../../types'
import { api } from '../../../../lib/api'
import { toStudioSlot, toStudioTemplate, toStudioRule } from '../../utils/adapters'
import { Template } from '../../types'

export interface CustomerEditorProps {
  templateId?: string
  overrideSlots?: SlotDefinition[]
  overrideSlotConfig?: SlotConfig
  overrideRules?: any[]
  onBackToGallery?: () => void
}

export const CustomerEditor: React.FC<CustomerEditorProps> = ({
  templateId = 'tpl-classic-01',
  overrideSlots,
  overrideSlotConfig,
  overrideRules,
  onBackToGallery
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templateId)
  const [templateState, setTemplateState] = useState<Template>(
    () => seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]
  )
  const [mode, setMode] = useState<'published' | 'scratch'>('published')
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false)
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false)
  const [initialClickNorm, setInitialClickNorm] = useState<{ normX: number; normY: number } | undefined>(undefined)

  const initialSlots: SlotDefinition[] = overrideSlots || seedSlots
  const assets: Asset[] = seedAssets
  const [rulesState, setRulesState] = useState<any[]>(() => overrideRules || curtainRules)

  // Get admin published slot configuration (or seed default)
  const adminPresetConfig: SlotConfig = overrideSlotConfig || seedPublishedSlotConfig

  // Editable slot positions & dimensions for customer canvas fine-tuning
  const [editableSlots, setEditableSlots] = useState<SlotDefinition[]>(() => initialSlots)

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

  // Add new Slot for customer
  const handleAddSlot = (slotData: Omit<SlotDefinition, 'id' | 'templateId'>) => {
    const newSlot: SlotDefinition = {
      ...slotData,
      id: `slot-${crypto.randomUUID().slice(0, 8)}`,
      templateId: templateState.id
    }
    setEditableSlots((prev) => [...prev, newSlot])
    setActiveSlotKey(newSlot.slotKey)
  }

  // Initial config based on mode selection: admin preset vs blank scratch
  const initialConfig = mode === 'published' ? adminPresetConfig : {}

  const {
    slotConfig,
    activeAsset,
    setActiveAsset,
    assignAsset,
    assignColor,
    resetConfig,
    setWholeConfig,
    lockedSlots,
    isDirty
  } = useSlotDnD(editableSlots, rulesState, templateState.id, initialConfig)

  const [activeSlotKey, setActiveSlotKey] = useState<string | undefined>('drape-main')

  useEffect(() => {
    if (templateId) {
      setSelectedTemplateId(templateId)
    }
  }, [templateId])

  // Load published template data & slot config from API when available
  useEffect(() => {
    api
      .getStudioTemplates()
      .then(async (rows) => {
        if (rows.length > 0) {
          const matched = rows.find((r) => r.id === selectedTemplateId) || rows[0];

          if (matched) {
            setTemplateState(toStudioTemplate(matched));

            if (matched.default_config && Object.keys(matched.default_config).length > 0) {
              setWholeConfig(matched.default_config as SlotConfig);
            }

            try {
              const sRows = await api.getStudioSlotDefinitions(matched.id);
              if (sRows.length > 0) {
                setEditableSlots(sRows.map(toStudioSlot));
              }
            } catch {}

            try {
              const rRows = await api.getStudioSlotRules(matched.id);
              if (rRows.length > 0) {
                setRulesState(rRows.map(toStudioRule));
              }
            } catch {}
          }
        }
      })
      .catch((err) => console.warn('Could not load studio templates for customer editor:', err));
  }, [selectedTemplateId]);

  // Handle Mode & Template selection from modal
  const handleSelectOption = (chosenMode: 'published' | 'scratch', chosenTplId: string) => {
    setMode(chosenMode)
    setSelectedTemplateId(chosenTplId)
    setIsSelectorOpen(false)

    // Always reset slot positions & sizes back to clean initial template layout
    setEditableSlots(initialSlots)

    if (chosenMode === 'published') {
      const pubKey = `pidecor_published_${chosenTplId}`
      let targetAdminConfig = seedPublishedSlotConfig
      try {
        const savedPub = localStorage.getItem(pubKey)
        if (savedPub) {
          const parsed = JSON.parse(savedPub)
          if (parsed.slotConfig) targetAdminConfig = parsed.slotConfig
        }
      } catch (e) {
        console.warn('Failed to parse published template on mode select', e)
      }
      setWholeConfig(targetAdminConfig)
    } else {
      // Clear everything back to initial blank state for new design from scratch
      resetConfig()
    }
  }

  // Double click canvas to add slot at click position
  const handleDoubleClickCanvas = (normX: number, normY: number) => {
    setInitialClickNorm({ normX, normY })
    setIsAddSlotOpen(true)
  }

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
      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        templates={seedTemplates}
        selectedTemplateId={selectedTemplateId}
        hasPublishedData={true}
        publishedTemplateName={templateState.name}
        onSelectOption={handleSelectOption}
      />

      {/* Add Slot Modal for Customer */}
      <AddSlotModal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        onAdd={handleAddSlot}
        existingSlots={editableSlots}
        existingSlotKeys={editableSlots.map((s) => s.slotKey)}
        initialNormPos={initialClickNorm}
      />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {onBackToGallery && (
              <button
                type="button"
                onClick={onBackToGallery}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Chọn Mẫu Khác
              </button>
            )}

            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Fraunces', serif", color: '#ffffff', margin: 0 }}>
                📌 {templateState.name}
              </h1>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', margin: 0 }}>
                Trình thiết kế phông cưới • Click chọn hoặc kéo thả trực tiếp để tùy chỉnh vị trí &amp; kích thước
              </p>
            </div>

            {/* Current Mode Badge Indicator */}
            <div
              style={{
                backgroundColor: mode === 'published' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                border: mode === 'published' ? '1px solid #38bdf8' : '1px solid #fbbf24',
                color: mode === 'published' ? '#38bdf8' : '#fbbf24',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{mode === 'published' ? '🌟 Mẫu Admin Xuất Bản' : '🎨 Tự Thiết Kế Mới'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Choose Template / Mode Button */}
            <button
              onClick={() => setIsSelectorOpen(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>📂</span> Đổi Mẫu / Chế Độ
            </button>

            {/* Switch Mode Actions */}
            {mode === 'published' ? (
              <button
                onClick={() => {
                  setMode('scratch')
                  setEditableSlots(initialSlots)
                  resetConfig()
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#334155',
                  color: '#cbd5e1',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                title="Đưa mọi thứ về trạng thái ban đầu lúc chưa set để tự thiết kế mới"
              >
                🧹 Xóa Hết (Tự Thiết Kế Mới)
              </button>
            ) : (
              <button
                onClick={() => {
                  setMode('published')
                  setEditableSlots(initialSlots)
                  setWholeConfig(adminPresetConfig)
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#334155',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                title="Tải lại toàn bộ thiết kế trọn bộ mà admin đã set sẵn"
              >
                ✨ Khôi Phục Mẫu Admin
              </button>
            )}

            <SaveBar
              onSaveDraft={() => console.log('Draft saved to localStorage')}
              onSaveFinal={() => setIsSaveModalOpen(true)}
              onExportPDF={() => console.log('Export PDF triggered')}
              isDirty={isDirty}
            />
          </div>
        </header>

        {/* Save Design Modal */}
        <SaveDesignModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          slotConfig={slotConfig}
        />

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
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <span>🧩</span> Thành Phần Phông
                </h3>
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', margin: 0 }}>
                  Click tùy chỉnh hoặc thêm slot
                </p>
              </div>

              {/* Customer Add Slot Button */}
              <button
                onClick={() => {
                  setInitialClickNorm(undefined)
                  setIsAddSlotOpen(true)
                }}
                style={{
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title="Thêm vị trí/slot mới vào thiết kế"
              >
                ➕ Thêm Slot
              </button>
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
                    {hasAsset ? `✓ ${state?.asset?.name}` : '• Chưa chọn mẫu (Trống)'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Center Column: Canvas Container & Interactive Slot Overlays */}
          <div
            ref={canvasContainerRef}
            onDoubleClick={(e) => {
              if (canvasContainerRef.current) {
                const rect = canvasContainerRef.current.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const clickY = e.clientY - rect.top
                const normX = Math.round((clickX / rect.width) * 100) / 100
                const normY = Math.round((clickY / rect.height) * 100) / 100
                handleDoubleClickCanvas(normX, normY)
              }
            }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              aspectRatio: '800 / 600',
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #334155',
              margin: '0 auto',
              cursor: 'crosshair'
            }}
            title="Nhấp kép vào canvas để thêm Slot mới tại vị trí con trỏ"
          >
            {/* SVG Canvas Base */}
            <SVGCanvas
              template={templateState}
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
                height: '100%',
                pointerEvents: 'none'
              }}
            >
              {editableSlots.map((slot: SlotDefinition) => {
                const isSelected = slot.slotKey === activeSlotKey

                return (
                  <div key={slot.id} style={{ pointerEvents: 'auto' }}>
                    <SlotMarker
                      slot={slot}
                      canvasWidth={dimensions.width}
                      canvasHeight={dimensions.height}
                      isSelected={isSelected}
                      onClick={() => setActiveSlotKey(slot.slotKey)}
                      onResize={handleSlotUpdate}
                      showDebugCoords={false}
                    />
                  </div>
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
