import React, { useState, useEffect, useRef } from 'react'
import { Asset } from '../../types'

export interface TextAssetCustomizerProps {
  onApply: (asset: Asset) => void
  initialTitle?: string
  initialBride?: string
  initialGroom?: string
  initialDate?: string
}

export const EVENT_TITLES = [
  'LỄ VU QUY',
  'LỄ TÂN HÔN',
  'LỄ THÀNH HÔN',
  'LỄ ĐÍNH HÔN',
  'LỄ BÁO HỶ'
]

export const ARTISTIC_FONTS = [
  { id: 'great-vibes', name: '🌸 Great Vibes (Uốn lượn cổ điển)', family: "'Great Vibes', cursive" },
  { id: 'alex-brush', name: '✨ Alex Brush (Script nét thanh nét đậm)', family: "'Alex Brush', cursive" },
  { id: 'pinyon-script', name: '👑 Pinyon Script (Hoàng gia uốn lượn quý phái)', family: "'Pinyon Script', cursive" },
  { id: 'parisienne', name: '🇫🇷 Parisienne (Phong cách Pháp tinh tế)', family: "'Parisienne', cursive" },
  { id: 'doulaise', name: '🖋️ Monsieur La Doulaise (Calligraphy bay bổng)', family: "'Monsieur La Doulaise', cursive" },
  { id: 'dancing-script', name: '💃 Dancing Script (Tự nhiên lãng mạn)', family: "'Dancing Script', cursive" },
  { id: 'playfair', name: '🏛️ Playfair Display (Serif cổ điển sang trọng)', family: "'Playfair Display', serif" },
  { id: 'cinzel', name: '⚜️ Cinzel (Serif La Mã đẳng cấp)', family: "'Cinzel', serif" },
  { id: 'cormorant', name: '📜 Cormorant Garamond (Serif quý tộc thanh mảnh)', family: "'Cormorant Garamond', serif" },
  { id: 'montserrat', name: '💎 Montserrat (Sans-serif hiện đại)', family: "'Montserrat', sans-serif" }
]

export const COLOR_PRESETS = [
  {
    id: 'gold-3d',
    name: '🌟 Vàng Ánh Kim 3D',
    grad1: '#FDF0A6',
    grad2: '#D4AF37',
    grad3: '#AA771C',
    grad4: '#FFD700',
    dateColor: '#FDF0A6'
  },
  {
    id: 'rosegold-3d',
    name: '🌸 Hồng Rose Gold 3D',
    grad1: '#FFE4E1',
    grad2: '#E8C5C8',
    grad3: '#B76E79',
    grad4: '#FFB6C1',
    dateColor: '#FFE4E1'
  },
  {
    id: 'silver-3d',
    name: '⚪ Trắng Bạc Ép Kim',
    grad1: '#FFFFFF',
    grad2: '#E2E8F0',
    grad3: '#94A3B8',
    grad4: '#CBD5E1',
    dateColor: '#E2E8F0'
  },
  {
    id: 'red-velvet',
    name: '🔴 Đỏ Nhung Nổi',
    grad1: '#FF6B6B',
    grad2: '#E11D48',
    grad3: '#9F1239',
    grad4: '#F43F5E',
    dateColor: '#FF6B6B'
  }
]

export interface LineSettings {
  text: string
  fontFamily: string
  fontSize: number
  letterSpacing: string
  posY: number
  posX: number
}

export function generateCustomWeddingSVG({
  line1,
  line2,
  line3,
  line4,
  colorPreset
}: {
  line1: LineSettings
  line2: LineSettings
  line3: LineSettings
  line4: LineSettings
  colorPreset: typeof COLOR_PRESETS[0]
}): string {
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@500;600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Monsieur+La+Doulaise&family=Montserrat:wght@500;600&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');`

  return `<svg viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${fontImport}
      .line1-style { font-family: ${line1.fontFamily}; font-size: ${line1.fontSize}px; letter-spacing: ${line1.letterSpacing}; }
      .line2-style { font-family: ${line2.fontFamily}; font-size: ${line2.fontSize}px; letter-spacing: ${line2.letterSpacing}; }
      .line3-style { font-family: ${line3.fontFamily}; font-size: ${line3.fontSize}px; letter-spacing: ${line3.letterSpacing}; }
      .line4-style { font-family: ${line4.fontFamily}; font-size: ${line4.fontSize}px; letter-spacing: ${line4.letterSpacing}; }
    </style>
    <linearGradient id="customGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorPreset.grad1}" />
      <stop offset="30%" stop-color="${colorPreset.grad2}" />
      <stop offset="65%" stop-color="${colorPreset.grad3}" />
      <stop offset="100%" stop-color="${colorPreset.grad4}" />
    </linearGradient>
    <filter id="custom3dShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.65"/>
      <feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="#5B4500" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Dòng 1: Tên Lễ -->
  <text x="${line1.posX}" y="${line1.posY}" text-anchor="middle" fill="url(#customGoldGrad)" class="line1-style">${line1.text}</text>

  <!-- Dòng 2: Tên Cô Dâu -->
  <text x="${line2.posX}" y="${line2.posY}" text-anchor="middle" fill="url(#customGoldGrad)" filter="url(#custom3dShadow)" class="line2-style">${line2.text}</text>

  <!-- Dòng 3: Tên Chú Rể -->
  <text x="${line3.posX}" y="${line3.posY}" text-anchor="middle" fill="url(#customGoldGrad)" filter="url(#custom3dShadow)" class="line3-style">${line3.text}</text>

  <!-- Dòng 4: Ngày Tháng -->
  <text x="${line4.posX}" y="${line4.posY}" text-anchor="middle" fill="${colorPreset.dateColor}" class="line4-style" opacity="0.95">${line4.text}</text>
</svg>`
}

export const TextAssetCustomizer: React.FC<TextAssetCustomizerProps> = ({
  onApply,
  initialTitle = 'LỄ VU QUY',
  initialBride = 'Phương Anh',
  initialGroom = 'Đức Dũng',
  initialDate = '19 • 03 • 2026'
}) => {
  const [activeLineTab, setActiveLineTab] = useState<1 | 2 | 3 | 4>(2) // Default to bride line

  const [line1, setLine1] = useState<LineSettings>({
    text: initialTitle,
    fontFamily: ARTISTIC_FONTS[6].family, // Playfair Display
    fontSize: 20,
    letterSpacing: '0.18em',
    posY: 55,
    posX: 300
  })

  const [line2, setLine2] = useState<LineSettings>({
    text: initialBride,
    fontFamily: ARTISTIC_FONTS[0].family, // Great Vibes
    fontSize: 74,
    letterSpacing: '0em',
    posY: 165,
    posX: 300
  })

  const [line3, setLine3] = useState<LineSettings>({
    text: initialGroom,
    fontFamily: ARTISTIC_FONTS[0].family, // Great Vibes
    fontSize: 74,
    letterSpacing: '0em',
    posY: 285,
    posX: 300
  })

  const [line4, setLine4] = useState<LineSettings>({
    text: initialDate,
    fontFamily: ARTISTIC_FONTS[9].family, // Montserrat
    fontSize: 18,
    letterSpacing: '0.25em',
    posY: 380,
    posX: 300
  })

  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])

  const isFirstRender = useRef(true)

  // Live real-time update ONLY when user actually interacts with inputs/sliders
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const svgData = generateCustomWeddingSVG({
      line1,
      line2,
      line3,
      line4,
      colorPreset: selectedColor
    })

    const customAsset: Asset = {
      id: `asset-text-custom-live`,
      assetType: 'text_name',
      name: `${line1.text}: ${line2.text} & ${line3.text}`,
      colorHex: selectedColor.grad4,
      fontFamily: line2.fontFamily,
      tags: ['custom-artistic-text', line1.text.toLowerCase().replace(/\s+/g, '-')],
      isActive: true,
      svgData
    }

    onApply(customAsset)
  }, [line1, line2, line3, line4, selectedColor])

  // Get active line config and setter
  const getActiveLineData = () => {
    switch (activeLineTab) {
      case 1:
        return { data: line1, set: setLine1, title: 'Dòng 1: Tên Lễ' }
      case 2:
        return { data: line2, set: setLine2, title: 'Dòng 2: Tên Cô Dâu' }
      case 3:
        return { data: line3, set: setLine3, title: 'Dòng 3: Tên Chú Rể' }
      case 4:
        return { data: line4, set: setLine4, title: 'Dòng 4: Ngày Tháng' }
    }
  }

  const activeLine = getActiveLineData()

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #38bdf8',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#38bdf8' }}>
          ✍️ Tùy Chỉnh Vị Trí & Font Từng Dòng Live
        </h4>
        <span style={{ fontSize: '10px', backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
          Pro Customizer
        </span>
      </div>

      {/* Preset Title Selector Buttons */}
      <div>
        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
          Tên Lễ Nhanh (Dòng 1):
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {EVENT_TITLES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setLine1((prev) => ({ ...prev, text: t }))
                setActiveLineTab(1)
              }}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: '600',
                border: line1.text === t ? '1px solid #e11d48' : '1px solid #334155',
                borderRadius: '4px',
                backgroundColor: line1.text === t ? '#e11d48' : '#1e293b',
                color: line1.text === t ? '#ffffff' : '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Line Tab Selector Buttons */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '6px' }}>
        {[
          { id: 1, label: 'Dòng 1 (Lễ)' },
          { id: 2, label: 'Dòng 2 (Cô Dâu)' },
          { id: 3, label: 'Dòng 3 (Chú Rể)' },
          { id: 4, label: 'Dòng 4 (Ngày)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLineTab(tab.id as 1 | 2 | 3 | 4)}
            style={{
              flex: 1,
              padding: '6px 2px',
              fontSize: '11px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeLineTab === tab.id ? '#38bdf8' : 'transparent',
              color: activeLineTab === tab.id ? '#0f172a' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Line Inspector Controls */}
      <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
          ⚙️ Điều chỉnh: <span style={{ color: '#38bdf8' }}>{activeLine.title}</span>
        </div>

        {/* Text Input */}
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
            Nội dung chữ:
          </label>
          <input
            type="text"
            value={activeLine.data.text}
            onChange={(e) => activeLine.set((prev) => ({ ...prev, text: e.target.value }))}
            style={{ width: '100%', padding: '6px 10px', backgroundColor: '#0f172a', border: '1px solid #38bdf8', borderRadius: '6px', color: '#ffffff', fontSize: '13px', fontWeight: '600' }}
          />
        </div>

        {/* Font Family Dropdown */}
        <div>
          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
            Font Chữ Nghệ Thuật (10 Kiểu Hot):
          </label>
          <select
            value={activeLine.data.fontFamily}
            onChange={(e) => activeLine.set((prev) => ({ ...prev, fontFamily: e.target.value }))}
            style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', fontSize: '12px' }}
          >
            {ARTISTIC_FONTS.map((f) => (
              <option key={f.id} value={f.family}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Line Position Y Slider (Individual Height / Line Gap) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>
              ↕️ Vị trí Y (Độ cao / Khoảng cách dòng): {activeLine.data.posY}px
            </label>
          </div>
          <input
            type="range"
            min="10"
            max="420"
            value={activeLine.data.posY}
            onChange={(e) => activeLine.set((prev) => ({ ...prev, posY: parseInt(e.target.value) || 0 }))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Line Position X Slider (Individual Horizontal Offset) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', color: '#94a3b8' }}>
              ↔️ Vị trí X (Trái / Phải): {activeLine.data.posX}px
            </label>
            <button
              type="button"
              onClick={() => activeLine.set((prev) => ({ ...prev, posX: 300 }))}
              style={{ padding: '1px 6px', fontSize: '10px', backgroundColor: '#334155', color: '#38bdf8', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              🎯 Căn Giữa (300)
            </button>
          </div>
          <input
            type="range"
            min="50"
            max="550"
            value={activeLine.data.posX}
            onChange={(e) => activeLine.set((prev) => ({ ...prev, posX: parseInt(e.target.value) || 300 }))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Font Size & Letter Spacing */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
              Cỡ chữ (Font Size: {activeLine.data.fontSize}px):
            </label>
            <input
              type="range"
              min="12"
              max="110"
              value={activeLine.data.fontSize}
              onChange={(e) => activeLine.set((prev) => ({ ...prev, fontSize: parseInt(e.target.value) || 20 }))}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
              Khoảng cách chữ (Spacing):
            </label>
            <input
              type="text"
              placeholder="0em hoặc 0.18em"
              value={activeLine.data.letterSpacing}
              onChange={(e) => activeLine.set((prev) => ({ ...prev, letterSpacing: e.target.value }))}
              style={{ width: '100%', padding: '4px 6px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#ffffff', fontSize: '12px' }}
            />
          </div>
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
          Phối Màu & Hiệu Ứng 3D Ánh Kim:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedColor(c)}
              style={{
                padding: '6px',
                fontSize: '11px',
                fontWeight: '600',
                border: selectedColor.id === c.id ? '2px solid #38bdf8' : '1px solid #334155',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Status Indicator */}
      <div
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#1e293b',
          color: '#38bdf8',
          border: '1px solid #38bdf8',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'center',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
        ⚡ Đã Tự Động Cập Nhật Live Lên Demo
      </div>
    </div>
  )
}
