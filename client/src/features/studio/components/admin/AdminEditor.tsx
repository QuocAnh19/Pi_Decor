import React, { useState } from 'react'
import { seedTemplates, seedSlots, seedRules, seedAssets } from '../../data/seed/templates'
import { Template, SlotDefinition, SlotRule, SlotConfig, Asset, getDefaultSlotDimensions } from '../../types'
import { AdminCanvas } from './AdminCanvas'
import { SlotList } from './SlotList'
import { SlotProperties } from './SlotProperties'
import { RuleList } from './RuleList'
import { AddSlotModal } from './AddSlotModal'
import { TemplateUploader } from './TemplateUploader'
import { CustomerEditor } from '../customer/CustomerEditor'
import { extractSVGColors, hexToHSL, hslToHex } from '../../utils/svgColorUtils'

export interface AdminEditorProps {
  templateId?: string
  onBackToHome?: () => void
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  templateId = 'tpl-classic-01',
  onBackToHome
}) => {
  // Load saved draft or published template data from localStorage if available
  const draftKey = `pidecor_admin_draft_${templateId}`
  const publishedKey = `pidecor_published_${templateId}`

  const loadedSavedData = React.useMemo(() => {
    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (savedDraft) return JSON.parse(savedDraft)
      const savedPublished = localStorage.getItem(publishedKey)
      if (savedPublished) return JSON.parse(savedPublished)
    } catch (e) {
      console.warn('Failed to parse saved admin template data:', e)
    }
    return null
  }, [draftKey, publishedKey])

  const initialSeedTemplate = seedTemplates.find((t) => t.id === templateId) || seedTemplates[0]

  const [template, setTemplate] = useState<Template>(
    () => loadedSavedData?.template || initialSeedTemplate
  )
  const [slots, setSlots] = useState<SlotDefinition[]>(
    () => loadedSavedData?.slots || seedSlots
  )
  const [rules, setRules] = useState<SlotRule[]>(
    () => loadedSavedData?.rules || seedRules
  )
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(
    () => loadedSavedData?.slotConfig || {}
  )

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(slots[0]?.id || null)
  const [showGrid, setShowGrid] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
  const [initialClickNorm, setInitialClickNorm] = useState<{ normX: number; normY: number } | undefined>(undefined)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'slots' | 'rules'>('slots')

  // Auto-save working draft to localStorage
  React.useEffect(() => {
    try {
      const draftData = {
        template,
        slots,
        rules,
        slotConfig,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(draftKey, JSON.stringify(draftData))
    } catch (err) {
      // Ignore storage quota error on background draft auto-save
    }
  }, [template, slots, rules, slotConfig, draftKey])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Slot Handlers
  const handleSlotMove = (slotId: string, normX: number, normY: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, normX, normY } : s))
    )
    setIsDirty(true)
  }

  const handleSlotUpdate = (slotId: string, patch: Partial<SlotDefinition>) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, ...patch } : s))
    )
    setIsDirty(true)
  }

  const handleSlotDelete = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null)
    }
    setIsDirty(true)
    showToast('Đã xóa slot!')
  }

  const handleAddSlot = (slotData: Omit<SlotDefinition, 'id' | 'templateId'>) => {
    const newSlot: SlotDefinition = {
      ...slotData,
      id: `slot-${crypto.randomUUID().slice(0, 8)}`,
      templateId: template.id
    }
    setSlots((prev) => [...prev, newSlot])
    setSelectedSlotId(newSlot.id)
    setIsDirty(true)
    showToast(`Đã tạo slot mới '${newSlot.label}'!`)
  }

  // Double click canvas to add slot at click position
  const handleDoubleClickCanvas = (normX: number, normY: number) => {
    setInitialClickNorm({ normX, normY })
    setIsAddSlotOpen(true)
  }

  // Rule Handlers
  const handleAddRule = (ruleData: Omit<SlotRule, 'id'>) => {
    const newRule: SlotRule = {
      ...ruleData,
      id: `rule-${crypto.randomUUID().slice(0, 8)}`
    }
    setRules((prev) => [...prev, newRule])
    setIsDirty(true)
    showToast(`Đã thêm rule mới '${newRule.ruleName}'!`)
  }

  const handleUpdateRule = (ruleId: string, ruleData: Omit<SlotRule, 'id'>) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, ...ruleData } : r))
    )
    setIsDirty(true)
    showToast('Đã cập nhật rule!')
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId))
    setIsDirty(true)
    showToast('Đã xóa rule!')
  }

  // SVG Base Template Upload Handler
  const handleUploadSVG = (svgContent: string, fileName: string) => {
    setTemplate((prev) => ({
      ...prev,
      name: fileName.replace('.svg', ''),
      svgBase: svgContent
    }))
    setIsDirty(true)
    showToast(`Đã cập nhật khung phông nền SVG từ '${fileName}'!`)
  }

  // SVG Asset Upload Handler (Rèm / Hoa / Chữ...)
  const handleAddAsset = (assetData: Omit<Asset, 'id'>, assignToCurrentSlot?: boolean) => {
    const newAsset: Asset = {
      ...assetData,
      id: `asset-${crypto.randomUUID().slice(0, 8)}`
    }

    seedAssets.push(newAsset) // Add to seed assets library

    if (assignToCurrentSlot) {
      let targetSlot = slots.find((s) => s.id === selectedSlotId)

      // If selected slot does not match assetType, find another compatible slot or auto-create one
      if (!targetSlot || targetSlot.slotType !== newAsset.assetType) {
        targetSlot = slots.find((s) => s.slotType === newAsset.assetType)
      }

      // If no compatible slot exists, auto-create a new slot tailored to this assetType!
      if (!targetSlot) {
        const sameTypeSlot = slots.find((s) => s.slotType === newAsset.assetType)
        const defaultDims = getDefaultSlotDimensions(newAsset.assetType)
        const normWidth = sameTypeSlot?.normWidth ?? defaultDims.normWidth
        const normHeight = sameTypeSlot?.normHeight ?? defaultDims.normHeight

        const slotKey = `${newAsset.assetType}-${slots.length + 1}`
        const labelName = newAsset.name.replace(/^Mẫu\s+/, '')
        
        targetSlot = {
          id: `slot-${crypto.randomUUID().slice(0, 8)}`,
          templateId: template.id,
          slotKey,
          label: labelName,
          slotType: newAsset.assetType,
          normX: 0.5,
          normY: 0.5,
          normWidth,
          normHeight,
          allowScale: true,
          allowRotate: true,
          mirrorX: false,
          zIndex: sameTypeSlot?.zIndex ?? 5,
          sortOrder: slots.length + 1
        }

        setSlots((prev) => [...prev, targetSlot!])
      }

      // Select target slot so 8 corner/edge handles appear immediately!
      setSelectedSlotId(targetSlot.id)

      setSlotConfig((prev) => {
        const existing = prev[targetSlot!.slotKey]
        const colorOverride = newAsset.colorHex || existing?.colorOverride
        const filterMode = existing?.filterMode ?? 'multiply_blend'

        let colorMap = existing?.colorMap
        if (colorOverride && newAsset.svgData) {
          const originalColors = extractSVGColors(newAsset.svgData)
          colorMap = {}
          for (const orig of originalColors) {
            const { l } = hexToHSL(orig)
            if (l > 10 && l < 90) {
              const { h: newH, s: newS } = hexToHSL(colorOverride)
              const { l: origL, s: origS } = hexToHSL(orig)
              colorMap[orig] = hslToHex(newH, Math.round((origS + newS) / 2), origL)
            }
          }
        }

        return {
          ...prev,
          [targetSlot!.slotKey]: {
            ...existing,
            assetId: newAsset.id,
            asset: newAsset,
            colorOverride,
            colorMap,
            filterMode
          }
        }
      })

      setIsDirty(true)
      // Never show toast popup when assigning or customizing an asset on a slot
      return
    }

    setIsDirty(true)
    showToast(`✨ Đã thêm mẫu '${newAsset.name}' vào thư viện Asset!`)
  }

  // Admin Color Assignment Handler
  const handleAssignColor = (
    slotKey: string,
    hex: string,
    filterMode: 'multiply_blend' | 'flat_tint' | 'color_map' = 'multiply_blend',
    colorSaturation: number = 100
  ) => {
    setSlotConfig((prev) => {
      const existing = prev[slotKey]
      const asset = existing?.asset
      let colorMap: Record<string, string> | undefined

      if (asset?.svgData) {
        const originalColors = extractSVGColors(asset.svgData)
        colorMap = {}
        for (const orig of originalColors) {
          const { l } = hexToHSL(orig)
          if (l > 10 && l < 90) {
            const { h: newH, s: newS } = hexToHSL(hex)
            const { l: origL, s: origS } = hexToHSL(orig)
            colorMap[orig] = hslToHex(newH, Math.round((origS + newS) / 2), origL)
          }
        }
      }

      return {
        ...prev,
        [slotKey]: {
          ...existing,
          colorOverride: hex,
          colorMap,
          filterMode,
          colorSaturation
        }
      }
    })
    setIsDirty(true)
  }

  const handlePublish = () => {
    try {
      // Create clean, serializable slotConfig payload
      const cleanSlotConfig: SlotConfig = {}
      for (const [key, state] of Object.entries(slotConfig)) {
        if (!state) continue
        cleanSlotConfig[key] = {
          assetId: state.assetId,
          colorOverride: state.colorOverride,
          colorMap: state.colorMap,
          filterMode: state.filterMode,
          colorSaturation: state.colorSaturation,
          asset: state.asset
        }
      }

      const publishData = {
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
          svgBase: template.svgBase,
          thumbnail: template.thumbnail,
          isActive: template.isActive
        },
        slots: slots.map((s) => ({
          id: s.id,
          templateId: s.templateId,
          slotKey: s.slotKey,
          label: s.label,
          slotType: s.slotType,
          normX: s.normX,
          normY: s.normY,
          normWidth: s.normWidth,
          normHeight: s.normHeight,
          allowScale: s.allowScale,
          allowRotate: s.allowRotate,
          mirrorX: s.mirrorX,
          zIndex: s.zIndex,
          sortOrder: s.sortOrder
        })),
        rules: rules.map((r) => ({
          id: r.id,
          templateId: r.templateId,
          ruleName: r.ruleName,
          conditionSlot: r.conditionSlot,
          conditionValue: r.conditionValue,
          targetSlot: r.targetSlot,
          action: r.action,
          actionValue: r.actionValue,
          priority: r.priority
        })),
        slotConfig: cleanSlotConfig,
        publishedAt: new Date().toISOString()
      }

      const publishKey = `pidecor_published_${template.id}`
      try {
        localStorage.setItem(publishKey, JSON.stringify(publishData))
      } catch (storageErr) {
        // Fallback: Strip redundant duplicate asset binary data if browser quota is tight
        const lightweightSlotConfig: SlotConfig = {}
        for (const [key, state] of Object.entries(cleanSlotConfig)) {
          lightweightSlotConfig[key] = {
            assetId: state.assetId,
            colorOverride: state.colorOverride,
            colorMap: state.colorMap,
            filterMode: state.filterMode,
            colorSaturation: state.colorSaturation
          }
        }
        const lightweightPayload = {
          ...publishData,
          slotConfig: lightweightSlotConfig
        }
        localStorage.setItem(publishKey, JSON.stringify(lightweightPayload))
      }

      setIsDirty(false)
      showToast('🚀 Đã xuất bản (Publish) cấu hình Template & Slot mới thành công!')
    } catch (err: any) {
      console.error('Failed to publish template:', err)
      showToast(`❌ Lỗi xuất bản: ${err?.message || 'Không thể lưu cấu hình'}`)
    }
  }

  // If in Preview Mode, render real CustomerEditor for validation
  if (isPreviewMode) {
    return (
      <div style={{ position: 'relative' }}>
        {/* Floating Exit Preview Bar */}
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#e11d48',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span>👁️ Đang trong chế độ Preview (Khách Hàng)</span>
          <button
            onClick={() => setIsPreviewMode(false)}
            style={{
              backgroundColor: '#ffffff',
              color: '#e11d48',
              border: 'none',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Thoát Preview
          </button>
        </div>

        <CustomerEditor
          templateId={template.id}
          overrideSlots={slots}
          overrideSlotConfig={slotConfig}
          overrideRules={rules}
        />
      </div>
    )
  }

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) || null

  return (
    <div
      className="no-scrollbar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '20px',
        gap: '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            maxWidth: '380px',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Admin Header / Toolbar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1e293b',
          padding: '16px 24px',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              style={{
                padding: '6px 12px',
                backgroundColor: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              ← Quay lại Admin
            </button>
          )}

          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Playfair Display', serif", color: '#ffffff' }}>
              🛠️ Admin Studio Editor — {template.name}
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Đặt slot trên canvas • Snap-to-grid 10px • Upload Rèm/Hoa SVG vào Slot
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowGrid(!showGrid)}
            style={{
              padding: '8px 14px',
              backgroundColor: showGrid ? '#38bdf8' : '#334155',
              color: showGrid ? '#0f172a' : '#f8fafc',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🌐 Grid {showGrid ? 'Bật (10px)' : 'Tắt'}
          </button>

          <button
            onClick={() => setIsPreviewMode(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            👁️ Preview Khách Hàng
          </button>

          <button
            onClick={handlePublish}
            style={{
              padding: '8px 18px',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.4)',
              position: 'relative'
            }}
          >
            {isDirty && (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '6px'
                }}
              />
            )}
            🚀 Publish Template
          </button>
        </div>
      </header>

      {/* Main Admin 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '20px', flex: 1, alignItems: 'start' }}>
        {/* Left Column: Slot & Rule List Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Smart SVG File Uploader (Template Base vs Asset) */}
          <TemplateUploader
            onUploadBase={handleUploadSVG}
            onAddAsset={handleAddAsset}
          />

          {/* Sidebar Tab Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '4px', borderRadius: '8px', border: '1px solid #334155' }}>
            <button
              onClick={() => setActiveTab('slots')}
              style={{
                flex: 1,
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === 'slots' ? '#e11d48' : 'transparent',
                color: activeTab === 'slots' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Slots ({slots.length})
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              style={{
                flex: 1,
                padding: '6px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === 'rules' ? '#e11d48' : 'transparent',
                color: activeTab === 'rules' ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Rules ({rules.length})
            </button>
          </div>

          <div style={{ flex: 1 }}>
            {activeTab === 'slots' ? (
              <SlotList
                slots={slots}
                selectedSlotId={selectedSlotId}
                onSelect={(id) => setSelectedSlotId(id)}
                onAddSlot={() => {
                  setInitialClickNorm(undefined)
                  setIsAddSlotOpen(true)
                }}
              />
            ) : (
              <RuleList
                rules={rules}
                slots={slots}
                onAddRule={handleAddRule}
                onUpdateRule={handleUpdateRule}
                onDeleteRule={handleDeleteRule}
              />
            )}
          </div>
        </div>

        {/* Middle Column: Interactive Admin Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>💡 Mẹo: Kéo thả các marker để đổi vị trí (snap grid 10px). Nhấp kép canvas để thêm Slot mới.</span>
            <span>Viewport: 800 × 600</span>
          </div>

          <div style={{ flex: 1, minHeight: '520px' }}>
            <AdminCanvas
              template={template}
              slots={slots}
              slotConfig={slotConfig}
              selectedSlotId={selectedSlotId}
              showGrid={showGrid}
              onSlotSelect={(id) => setSelectedSlotId(id)}
              onSlotMove={handleSlotMove}
              onSlotUpdate={handleSlotUpdate}
              onDoubleClickEmpty={handleDoubleClickCanvas}
            />
          </div>
        </div>

        {/* Right Column: Slot Property Inspector (Sticky & Independent Scroll) */}
        <div style={{ position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 140px)' }}>
          <SlotProperties
            slot={selectedSlot}
            slotConfig={slotConfig}
            onUpdate={handleSlotUpdate}
            onDelete={handleSlotDelete}
            onAddAsset={handleAddAsset}
            onAssignColor={handleAssignColor}
          />
        </div>
      </div>

      {/* Add Slot Modal */}
      <AddSlotModal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        onAdd={handleAddSlot}
        existingSlots={slots}
        existingSlotKeys={slots.map((s) => s.slotKey)}
        initialNormPos={initialClickNorm}
      />
    </div>
  )
}
