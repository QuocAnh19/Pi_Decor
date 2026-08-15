import React from 'react'
import { Template, SlotDefinition, SlotConfig, Asset } from '../../types'
import { normalizedToSVG } from '../../utils/coordinates'
import { AssetRenderer } from './AssetRenderer'

export interface SVGCanvasProps {
  template: Template
  slots: SlotDefinition[]
  slotConfig: SlotConfig
  width?: number
  height?: number
  className?: string
  dragState?: { slotId: string; delta: { x: number; y: number } } | null
  showBorders?: boolean
}

export const SVGCanvas: React.FC<SVGCanvasProps> = ({
  template,
  slots,
  slotConfig,
  width = 800,
  height = 600,
  className = '',
  dragState = null,
  showBorders = false
}) => {
  const VIEWPORT_WIDTH = 800
  const VIEWPORT_HEIGHT = 600

  // Sort slots by zIndex / sortOrder before rendering
  const sortedSlots = [...slots].sort((a, b) => {
    if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex
    return a.sortOrder - b.sortOrder
  })

  // Calculate scale factor if screen pixel width differs from logical 800px SVG space
  const scaleX = width > 0 ? VIEWPORT_WIDTH / width : 1
  const scaleY = height > 0 ? VIEWPORT_HEIGHT / height : 1

  return (
    <div
      className={`svg-canvas-container ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <svg
        viewBox={`0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        {/* Render Base Template Layer */}
        <g
          id="template-svg-base"
          dangerouslySetInnerHTML={{ __html: template.svgBase }}
        />

        {/* Render Slots & Assets */}
        {sortedSlots.map((slot) => {
          let centerPos = normalizedToSVG(slot.normX, slot.normY, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)

          // Real-time live asset movement while dragging slot in Admin
          if (dragState && dragState.slotId === slot.id) {
            centerPos = {
              x: centerPos.x + dragState.delta.x * scaleX,
              y: centerPos.y + dragState.delta.y * scaleY
            }
          }

          const slotWidth = (slot.normWidth ?? 0.2) * VIEWPORT_WIDTH
          const slotHeight = (slot.normHeight ?? 0.2) * VIEWPORT_HEIGHT

          const x = centerPos.x - slotWidth / 2
          const y = centerPos.y - slotHeight / 2

          const state = slotConfig[slot.slotKey] || slotConfig[slot.id]
          const isLocked = Boolean(state?.locked)
          const isDrape = slot.slotType === "drape" || slot.slotType === "drape_detail"
          const activeColorOverride = (isDrape ? (state?.colorOverride || state?.colorHex) : undefined) || undefined

          // Resolve asset object: Use state.asset, state.customAsset, or synthesize from material/color overrides
          const resolvedAsset: Asset | undefined =
            state?.asset ||
            state?.customAsset ||
            (state?.materialImage || state?.materialId || state?.colorHex || (isDrape && state?.colorOverride)
              ? {
                  id: state.materialId || state.assetId || 'custom-mat',
                  name: slot.label,
                  assetType: slot.slotType,
                  thumbnail: state.materialImage || undefined,
                  colorHex: state.colorHex || (isDrape ? state.colorOverride : undefined),
                }
              : undefined)
          const hasAsset = Boolean(resolvedAsset)

          const mirrorTransform = slot.mirrorX
            ? `translate(${centerPos.x}, ${centerPos.y}) scale(-1, 1) translate(${-centerPos.x}, ${-centerPos.y})`
            : undefined

          return (
            <g key={slot.id} id={`slot-group-${slot.slotKey}`} transform={mirrorTransform}>
              {/* Layer 1: Asset Rendering (bottom layer) */}
              {hasAsset && resolvedAsset && (
                <foreignObject
                  x={x}
                  y={y}
                  width={slotWidth}
                  height={slotHeight}
                  style={{ overflow: 'visible', pointerEvents: 'none' }}
                >
                  <AssetRenderer
                    asset={resolvedAsset}
                    slotType={slot.slotType}
                    slotKey={slot.slotKey}
                    colorOverride={activeColorOverride}
                    colorMap={state?.colorMap}
                    filterMode={state?.filterMode}
                    colorSaturation={state?.colorSaturation}
                  />
                </foreignObject>
              )}

              {/* Layer 2: Slot Border Overlay (Rendered ONLY if showBorders is true) */}
              {showBorders && (
                <rect
                  x={x}
                  y={y}
                  width={slotWidth}
                  height={slotHeight}
                  rx={6}
                  ry={6}
                  fill={hasAsset ? 'none' : 'rgba(255, 255, 255, 0.04)'}
                  stroke={isLocked ? '#ef4444' : hasAsset ? 'rgba(56, 189, 248, 0.4)' : 'rgba(148, 163, 184, 0.5)'}
                  strokeWidth={hasAsset ? 1 : 1.5}
                  strokeDasharray={hasAsset ? 'none' : '6 4'}
                  style={{ transition: 'all 0.2s ease', pointerEvents: 'none' }}
                />
              )}

              {/* Layer 3: Label & Status Badge (Rendered ONLY if showBorders is true & slot is empty or locked) */}
              {showBorders && (!hasAsset || isLocked) && (
                <g transform={`translate(${centerPos.x}, ${centerPos.y})`} style={{ pointerEvents: 'none' }}>
                  <rect
                    x={-slotWidth / 2 + 10}
                    y={-14}
                    width={slotWidth - 20}
                    height={28}
                    rx={14}
                    fill="rgba(15, 23, 42, 0.8)"
                    stroke={isLocked ? '#ef4444' : '#475569'}
                    strokeWidth={1}
                  />

                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill={isLocked ? '#fca5a5' : '#cbd5e1'}
                    fontSize={12}
                    fontWeight={600}
                    fontFamily="'Inter', sans-serif"
                  >
                    {isLocked && '🔒 '}
                    {hasAsset ? (resolvedAsset?.name ?? slot.label) : slot.label}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
