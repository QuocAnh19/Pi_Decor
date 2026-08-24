import React, { useState, useEffect, useRef } from 'react'
import { Asset, SlotType } from '../../types'

export interface DrapeColorPalette {
  id: string
  name: string
  primaryHex: string
  highlightHex: string
  shadowHex: string
}

export const DRAPE_COLOR_PALETTES: DrapeColorPalette[] = [
  {
    id: 'burgundy-royal',
    name: 'Đỏ Đô Hoàng Gia',
    primaryHex: '#991b1b',
    highlightHex: '#ef4444',
    shadowHex: '#450a0a'
  },
  {
    id: 'pearl-white',
    name: 'Trắng Sữa Ngọc Trai',
    primaryHex: '#fef3c7',
    highlightHex: '#ffffff',
    shadowHex: '#e5e7eb'
  },
  {
    id: 'champagne-gold',
    name: 'Vàng Champagne',
    primaryHex: '#d97706',
    highlightHex: '#fde047',
    shadowHex: '#78350f'
  },
  {
    id: 'blush-pink',
    name: 'Hồng Phấn Pastel',
    primaryHex: '#f43f5e',
    highlightHex: '#fbcfe8',
    shadowHex: '#881337'
  },
  {
    id: 'sapphire-blue',
    name: 'Xanh Navy Cổ Vịt',
    primaryHex: '#1d4ed8',
    highlightHex: '#60a5fa',
    shadowHex: '#1e3a8a'
  },
  {
    id: 'emerald-green',
    name: 'Xanh Lục Bảo',
    primaryHex: '#047857',
    highlightHex: '#34d399',
    shadowHex: '#064e3b'
  },
  {
    id: 'rose-gold',
    name: 'Hồng Rose Gold',
    primaryHex: '#be185d',
    highlightHex: '#f472b6',
    shadowHex: '#831843'
  },
  {
    id: 'lavender-purple',
    name: 'Tím Thạch Anh',
    primaryHex: '#a21caf',
    highlightHex: '#f0abfc',
    shadowHex: '#581c87'
  },
  {
    id: 'terracotta-orange',
    name: 'Cam Đất Terracotta',
    primaryHex: '#c2410c',
    highlightHex: '#ffedd5',
    shadowHex: '#7c2d12'
  },
  {
    id: 'smokey-grey',
    name: 'Ghi Xám Khói',
    primaryHex: '#64748b',
    highlightHex: '#cbd5e1',
    shadowHex: '#1e293b'
  }
]

export const DRAPE_STYLES = [
  { id: 'vertical-classic', name: 'Rèm Lụa Rủ Thẳng (Classic Vertical)' },
  { id: 'royal-swag', name: 'Vắt Cong Hoàng Gia (Royal Swag)' },
  { id: 'rect-block', name: 'Rèm Vắt Dạng Khối (Rect-Block)' },
  { id: 'sheer-wave', name: 'Màn Voan Sương Bay (Sheer Wave)' }
]

export interface DrapeColorCustomizerProps {
  slotType: SlotType
  activeAsset?: Asset | null
  onApply: (asset: Asset) => void
}

export function recolorSVGAsset(
  baseSvg: string,
  targetColorHex: string,
  hueRotate: number = 0,
  saturate: number = 100,
  brightness: number = 100
): string {
  if (!baseSvg) return baseSvg

  // Clean existing injected SVG filter style to prevent duplication
  let result = baseSvg.replace(/style=["'][^"']*filter:[^"']*["']/gi, '')

  // Replace gradient stop-color values
  result = result.replace(/stop-color=["']([^"']+)["']/gi, `stop-color="${targetColorHex}"`)
  result = result.replace(/stop-color:[^;"]+/gi, `stop-color:${targetColorHex}`)

  // Replace primary fill values (except none and url references)
  result = result.replace(/fill=["']([^"']+)["']/gi, (match, fillVal) => {
    if (fillVal === 'none' || fillVal.startsWith('url(')) return match
    return `fill="${targetColorHex}"`
  })

  // Replace stroke values
  result = result.replace(/stroke=["']([^"']+)["']/gi, (match, strokeVal) => {
    if (strokeVal === 'none' || strokeVal.startsWith('url(')) return match
    return `stroke="${targetColorHex}"`
  })

  // Inject CSS filter for hue-rotate, saturate, brightness
  if (hueRotate !== 0 || saturate !== 100 || brightness !== 100) {
    const filterCss = `filter: hue-rotate(${hueRotate}deg) saturate(${saturate}%) brightness(${brightness}%);`
    if (result.includes('<svg')) {
      result = result.replace(/<svg([^>]*)>/i, `<svg$1 style="${filterCss}">`)
    }
  }

  return result
}

export const DrapeColorCustomizer: React.FC<DrapeColorCustomizerProps> = ({
  slotType,
  activeAsset,
  onApply
}) => {
  const [selectedPalette, setSelectedPalette] = useState<DrapeColorPalette>(DRAPE_COLOR_PALETTES[0])
  const [customHexColor, setCustomHexColor] = useState<string>('#991b1b')
  const [selectedStyle, setSelectedStyle] = useState<string>(
    slotType === 'drape_detail' ? 'royal-swag' : 'vertical-classic'
  )
  const [opacity, setOpacity] = useState<number>(0.92)
  const [shadowDepth, setShadowDepth] = useState<number>(0.7)

  // SVG Filters for custom uploaded asset
  const [hueRotate, setHueRotate] = useState<number>(0)
  const [saturate, setSaturate] = useState<number>(100)
  const [brightness, setBrightness] = useState<number>(100)

  // Preserve original SVG data before any recoloring transformations
  const originalSvgRef = useRef<string | null>(null)

  useEffect(() => {
    if (activeAsset?.svgData) {
      if (!originalSvgRef.current || (activeAsset.id && !activeAsset.id.startsWith('asset-drape-recolored-'))) {
        originalSvgRef.current = activeAsset.svgData
      }
    }
  }, [activeAsset?.id, activeAsset?.svgData])

  const hasUploadedAsset = Boolean(activeAsset?.svgData || originalSvgRef.current)

  // Clean display name by stripping away any repetitive trailing (#hex) brackets
  const rawName = activeAsset ? activeAsset.name : selectedPalette.name
  const cleanDisplayName = rawName.replace(/\s*\(#[a-fA-F0-9]{3,8}\)/gi, '').trim()

  // Core generator for procedural SVG drape
  const generateProceduralSVG = (activeHex: string): string => {
    const p = selectedPalette
    const gradId = `drape-grad-${Date.now()}`
    const shadowOpacity = shadowDepth.toFixed(2)

    let paths = ''
    if (selectedStyle === 'vertical-classic') {
      paths = `
        <rect x="100" y="60" width="600" height="480" fill="url(#${gradId})" opacity="${opacity}" rx="4" />
        <path d="M 160 60 L 170 540" stroke="${p.shadowHex}" stroke-width="6" opacity="${shadowOpacity}" />
        <path d="M 240 60 L 250 540" stroke="${p.shadowHex}" stroke-width="8" opacity="${shadowOpacity}" />
        <path d="M 320 60 L 325 540" stroke="${p.shadowHex}" stroke-width="6" opacity="${shadowOpacity}" />
        <path d="M 400 60 L 400 540" stroke="${p.shadowHex}" stroke-width="9" opacity="${shadowOpacity}" />
        <path d="M 480 60 L 475 540" stroke="${p.shadowHex}" stroke-width="6" opacity="${shadowOpacity}" />
        <path d="M 560 60 L 550 540" stroke="${p.shadowHex}" stroke-width="8" opacity="${shadowOpacity}" />
        <path d="M 640 60 L 630 540" stroke="${p.shadowHex}" stroke-width="6" opacity="${shadowOpacity}" />
      `
    } else if (selectedStyle === 'royal-swag') {
      paths = `
        <path d="M 120 70 Q 400 280 680 70 L 680 180 Q 400 380 120 180 Z" fill="url(#${gradId})" opacity="${opacity}" />
        <path d="M 150 90 Q 400 290 650 90" stroke="${p.shadowHex}" stroke-width="5" fill="none" opacity="${shadowOpacity}" />
        <path d="M 190 120 Q 400 320 610 120" stroke="${p.shadowHex}" stroke-width="5" fill="none" opacity="${shadowOpacity}" />
        <path d="M 230 150 Q 400 350 570 150" stroke="${p.shadowHex}" stroke-width="4" fill="none" opacity="${shadowOpacity}" />
      `
    } else if (selectedStyle === 'rect-block') {
      paths = `
        <path d="M 140 70 L 660 70 L 660 210 Q 400 240 140 210 Z" fill="url(#${gradId})" opacity="${opacity}" />
        <path d="M 200 70 L 200 215" stroke="${p.shadowHex}" stroke-width="4" opacity="${shadowOpacity}" />
        <path d="M 300 70 L 300 225" stroke="${p.shadowHex}" stroke-width="5" opacity="${shadowOpacity}" />
        <path d="M 400 70 L 400 230" stroke="${p.shadowHex}" stroke-width="6" opacity="${shadowOpacity}" />
        <path d="M 500 70 L 500 225" stroke="${p.shadowHex}" stroke-width="5" opacity="${shadowOpacity}" />
        <path d="M 600 70 L 600 215" stroke="${p.shadowHex}" stroke-width="4" opacity="${shadowOpacity}" />
      `
    } else {
      paths = `
        <path d="M 100 70 C 250 160, 350 30, 500 120 C 600 180, 700 80, 700 70 L 700 520 C 600 480, 500 530, 350 470 C 200 520, 100 480, 100 520 Z" fill="url(#${gradId})" opacity="${opacity}" />
      `
    }

    return `
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${activeHex}" stop-opacity="1" />
            <stop offset="50%" stop-color="${activeHex}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${p.shadowHex}" stop-opacity="1" />
          </linearGradient>
        </defs>
        ${paths}
      </svg>
    `
  }

  // Instant user action handler for explicit color clicks & slider tweaks
  const handleApplyColor = (targetHex: string, palette?: DrapeColorPalette) => {
    if (palette) setSelectedPalette(palette)
    setCustomHexColor(targetHex)

    const baseSvg = originalSvgRef.current || activeAsset?.svgData
    const svgData = baseSvg
      ? recolorSVGAsset(baseSvg, targetHex, hueRotate, saturate, brightness)
      : generateProceduralSVG(targetHex)

    const customAsset: Asset = {
      id: `asset-drape-recolored-${Date.now()}`,
      assetType: slotType === 'drape_detail' ? 'drape_detail' : 'drape',
      name: `${cleanDisplayName} (${targetHex})`,
      colorHex: targetHex,
      tags: ['recolored-drape', palette?.id || 'custom'],
      isActive: true,
      svgData
    }

    onApply(customAsset)
  }

  const handleFilterChange = (h: number, s: number, b: number) => {
    setHueRotate(h)
    setSaturate(s)
    setBrightness(b)

    const activeHex = customHexColor || selectedPalette.primaryHex
    const baseSvg = originalSvgRef.current || activeAsset?.svgData
    const svgData = baseSvg
      ? recolorSVGAsset(baseSvg, activeHex, h, s, b)
      : generateProceduralSVG(activeHex)

    const customAsset: Asset = {
      id: `asset-drape-recolored-${Date.now()}`,
      assetType: slotType === 'drape_detail' ? 'drape_detail' : 'drape',
      name: `${cleanDisplayName} (${activeHex})`,
      colorHex: activeHex,
      tags: ['recolored-drape', selectedPalette.id],
      isActive: true,
      svgData
    }

    onApply(customAsset)
  }

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        padding: '14px',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
          🎨 Bộ Đổi Màu Rèm (SVG Filter & Tint)
        </h4>
        <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '600' }}>
          {slotType === 'drape_detail' ? 'Lớp Phủ / Chi Tiết' : 'Rèm Nền Chính'}
        </span>
      </div>

      {/* Target Asset Status */}
      {hasUploadedAsset ? (
        <div style={{ padding: '6px 10px', backgroundColor: '#1e293b', borderRadius: '6px', fontSize: '11px', color: '#e2e8f0', border: '1px solid #334155' }}>
          📦 Đang đổi màu rèm custom: <strong style={{ color: '#f43f5e' }}>{cleanDisplayName}</strong>
        </div>
      ) : (
        /* Style Selector for Procedural Drapes */
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Kiểu Dáng & Độ Rủ Vắt Rèm:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            {DRAPE_STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStyle(st.id)}
                style={{
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: selectedStyle === st.id ? '2px solid #e11d48' : '1px solid #334155',
                  backgroundColor: selectedStyle === st.id ? '#1e293b' : '#0f172a',
                  color: selectedStyle === st.id ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Color Swatches */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '11px', color: '#94a3b8' }}>
            Bảng Màu Đổi Nhanh:
          </label>
          {/* Custom Hex Color Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tự chọn:</span>
            <input
              type="color"
              value={customHexColor}
              onChange={(e) => handleApplyColor(e.target.value)}
              style={{ width: '24px', height: '24px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {DRAPE_COLOR_PALETTES.map((p) => {
            const isSelected = customHexColor === p.primaryHex
            return (
              <button
                key={p.id}
                onClick={() => handleApplyColor(p.primaryHex, p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: p.primaryHex,
                    border: '1px solid rgba(255,255,255,0.3)',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '11px', fontWeight: isSelected ? '700' : '400' }}>
                  {p.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* SVG Filters (Hue-rotate, Saturation, Brightness) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #334155', paddingTop: '8px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <span>🎨 Xoay Vòng Màu (Hue Rotate):</span>
            <span style={{ color: '#38bdf8', fontWeight: '700' }}>{hueRotate}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={hueRotate}
            onChange={(e) => handleFilterChange(parseInt(e.target.value), saturate, brightness)}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <span>✨ Độ Rực Màu (Saturation):</span>
            <span style={{ color: '#38bdf8', fontWeight: '700' }}>{saturate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={saturate}
            onChange={(e) => handleFilterChange(hueRotate, parseInt(e.target.value), brightness)}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
            <span>☀️ Độ Sáng / Tối (Brightness):</span>
            <span style={{ color: '#38bdf8', fontWeight: '700' }}>{brightness}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => handleFilterChange(hueRotate, saturate, parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        {!hasUploadedAsset && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                <span>🌫️ Độ Mờ & Màn Voan (Opacity):</span>
                <span style={{ color: '#38bdf8', fontWeight: '700' }}>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                <span>🌑 Độ Nếp Gấp (Fold Shadow):</span>
                <span style={{ color: '#38bdf8', fontWeight: '700' }}>{Math.round(shadowDepth * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={shadowDepth}
                onChange={(e) => setShadowDepth(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
              />
            </div>
          </>
        )}
      </div>

      {/* Live Status Indicator */}
      <div
        style={{
          padding: '6px 10px',
          backgroundColor: '#1e293b',
          color: '#10b981',
          border: '1px solid #10b981',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
        ⚡ Đã Tự Động Cập Nhật Màu Live Lên Demo
      </div>
    </div>
  )
}
