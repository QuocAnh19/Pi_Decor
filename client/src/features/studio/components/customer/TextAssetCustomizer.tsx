import React, { useState, useEffect, useRef } from 'react'
import { Asset } from '../../types'
import { Input, Select } from '../../../../components/ui'

export interface TextAssetCustomizerProps {
  onApply: (asset: Asset) => void
  existingAsset?: Asset | null
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
  { id: 'great-vibes', name: 'Great Vibes (Uốn lượn cổ điển)', family: "'Great Vibes', cursive" },
  { id: 'alex-brush', name: 'Alex Brush (Script nét thanh nét đậm)', family: "'Alex Brush', cursive" },
  { id: 'pinyon-script', name: 'Pinyon Script (Hoàng gia uốn lượn quý phái)', family: "'Pinyon Script', cursive" },
  { id: 'parisienne', name: 'Parisienne (Phong cách Pháp tinh tế)', family: "'Parisienne', cursive" },
  { id: 'doulaise', name: 'Monsieur La Doulaise (Calligraphy bay bổng)', family: "'Monsieur La Doulaise', cursive" },
  { id: 'dancing-script', name: 'Dancing Script (Tự nhiên lãng mạn)', family: "'Dancing Script', cursive" },
  { id: 'playfair', name: 'Playfair Display (Serif cổ điển sang trọng)', family: "'Playfair Display', serif" },
  { id: 'cinzel', name: 'Cinzel (Serif La Mã đẳng cấp)', family: "'Cinzel', serif" },
  { id: 'cormorant', name: 'Cormorant Garamond (Serif quý tộc thanh mảnh)', family: "'Cormorant Garamond', serif" },
  { id: 'montserrat', name: 'Montserrat (Sans-serif hiện đại)', family: "'Montserrat', sans-serif" }
]

export const COLOR_PRESETS = [
  {
    id: 'gold-3d',
    name: 'Vàng Ánh Kim 3D',
    grad1: '#FDF0A6',
    grad2: '#D4AF37',
    grad3: '#AA771C',
    grad4: '#FFD700',
    dateColor: '#FDF0A6'
  },
  {
    id: 'rosegold-3d',
    name: 'Hồng Rose Gold 3D',
    grad1: '#FFE4E1',
    grad2: '#E8C5C8',
    grad3: '#B76E79',
    grad4: '#FFB6C1',
    dateColor: '#FFE4E1'
  },
  {
    id: 'silver-3d',
    name: 'Trắng Bạc Ép Kim',
    grad1: '#FFFFFF',
    grad2: '#E2E8F0',
    grad3: '#94A3B8',
    grad4: '#CBD5E1',
    dateColor: '#E2E8F0'
  },
  {
    id: 'red-velvet',
    name: 'Đỏ Nhung Nổi',
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

  return `<svg viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
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
  <text x="${line1.posX}" y="${line1.posY}" text-anchor="middle" dominant-baseline="middle" font-family="${line1.fontFamily}" font-size="${line1.fontSize}px" letter-spacing="${line1.letterSpacing}" fill="url(#customGoldGrad)" class="line1-style">${line1.text}</text>

  <!-- Dòng 2: Tên Cô Dâu -->
  <text x="${line2.posX}" y="${line2.posY}" text-anchor="middle" dominant-baseline="middle" font-family="${line2.fontFamily}" font-size="${line2.fontSize}px" fill="url(#customGoldGrad)" filter="url(#custom3dShadow)" class="line2-style">${line2.text}</text>

  <!-- Dòng 3: Tên Chú Rể -->
  <text x="${line3.posX}" y="${line3.posY}" text-anchor="middle" dominant-baseline="middle" font-family="${line3.fontFamily}" font-size="${line3.fontSize}px" fill="url(#customGoldGrad)" filter="url(#custom3dShadow)" class="line3-style">${line3.text}</text>

  <!-- Dòng 4: Ngày Tháng -->
  <text x="${line4.posX}" y="${line4.posY}" text-anchor="middle" dominant-baseline="middle" font-family="${line4.fontFamily}" font-size="${line4.fontSize}px" letter-spacing="${line4.letterSpacing}" fill="${colorPreset.dateColor}" class="line4-style" opacity="0.95">${line4.text}</text>
</svg>`
}

export function parseWeddingInfo(existingAsset?: Asset | null) {
  if (!existingAsset) return null;
  const svgData = existingAsset.svgData || "";

  const textMatches = Array.from(svgData.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi));

  let title: string | undefined;
  let bride: string | undefined;
  let groom: string | undefined;
  let date: string | undefined;

  let y1 = 55, y2 = 160, y3 = 275, y4 = 365;
  let x1 = 300, x2 = 300, x3 = 300, x4 = 300;

  if (textMatches.length >= 4) {
    title = textMatches[0][1]?.replace(/<[^>]+>/g, "").trim();
    bride = textMatches[1][1]?.replace(/<[^>]+>/g, "").trim();
    groom = textMatches[2][1]?.replace(/<[^>]+>/g, "").trim();
    date = textMatches[3][1]?.replace(/<[^>]+>/g, "").trim();

    const extractAttr = (tag: string, attr: string) => {
      const m = tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
      return m ? m[1] : null;
    };

    const t0 = textMatches[0][0];
    const t1 = textMatches[1][0];
    const t2 = textMatches[2][0];
    const t3 = textMatches[3][0];

    const parsedX1 = extractAttr(t0, "x"); if (parsedX1) x1 = parseFloat(parsedX1);
    const parsedX2 = extractAttr(t1, "x"); if (parsedX2) x2 = parseFloat(parsedX2);
    const parsedX3 = extractAttr(t2, "x"); if (parsedX3) x3 = parseFloat(parsedX3);
    const parsedX4 = extractAttr(t3, "x"); if (parsedX4) x4 = parseFloat(parsedX4);

    const parsedY1 = extractAttr(t0, "y"); if (parsedY1) y1 = parseFloat(parsedY1);
    const parsedY2 = extractAttr(t1, "y"); if (parsedY2) y2 = parseFloat(parsedY2);
    const parsedY3 = extractAttr(t2, "y"); if (parsedY3) y3 = parseFloat(parsedY3);
    const parsedY4 = extractAttr(t3, "y"); if (parsedY4) y4 = parseFloat(parsedY4);
  } else if (textMatches.length >= 2) {
    const combinedNames = textMatches[0][1]?.replace(/<[^>]+>/g, "").trim();
    if (combinedNames && combinedNames.includes("&")) {
      const parts = combinedNames.split("&");
      bride = parts[0]?.trim();
      groom = parts[1]?.trim();
    }
    date = textMatches[1][1]?.replace(/<[^>]+>/g, "").trim();
  }

  // Fallback: parse name
  if (!bride && existingAsset.name && existingAsset.name.includes(":")) {
    const parts = existingAsset.name.split(":");
    title = parts[0]?.trim();
    const rest = parts[1]?.trim() || "";
    if (rest.includes("&")) {
      const names = rest.split("&");
      bride = names[0]?.trim();
      groom = names[1]?.trim();
    }
  }

  return {
    title,
    bride,
    groom,
    date,
    x1, x2, x3, x4,
    y1, y2, y3, y4,
  };
}

export const TextAssetCustomizer: React.FC<TextAssetCustomizerProps> = ({
  onApply,
  existingAsset,
  initialTitle = 'LỄ VU QUY',
  initialBride = 'Phương Anh',
  initialGroom = 'Đức Dũng',
  initialDate = '19 • 03 • 2026'
}) => {
  const parsed = parseWeddingInfo(existingAsset);

  const [activeLineTab, setActiveLineTab] = useState<1 | 2 | 3 | 4>(2) // Default to bride line

  const [line1, setLine1] = useState<LineSettings>({
    text: parsed?.title || initialTitle,
    fontFamily: ARTISTIC_FONTS[6].family, // Playfair Display
    fontSize: 20,
    letterSpacing: '0.18em',
    posY: parsed?.y1 ?? 55,
    posX: parsed?.x1 ?? 300
  })

  const [line2, setLine2] = useState<LineSettings>({
    text: parsed?.bride || initialBride,
    fontFamily: ARTISTIC_FONTS[0].family, // Great Vibes
    fontSize: 76,
    letterSpacing: '0em',
    posY: parsed?.y2 ?? 160,
    posX: parsed?.x2 ?? 300
  })

  const [line3, setLine3] = useState<LineSettings>({
    text: parsed?.groom || initialGroom,
    fontFamily: ARTISTIC_FONTS[0].family, // Great Vibes
    fontSize: 76,
    letterSpacing: '0em',
    posY: parsed?.y3 ?? 275,
    posX: parsed?.x3 ?? 300
  })

  const [line4, setLine4] = useState<LineSettings>({
    text: parsed?.date || initialDate,
    fontFamily: ARTISTIC_FONTS[9].family, // Montserrat
    fontSize: 18,
    letterSpacing: '0.25em',
    posY: parsed?.y4 ?? 365,
    posX: parsed?.x4 ?? 300
  })

  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0])

  const hasUserEdited = useRef(false)

  // Sync state when a different existingAsset is selected, if user hasn't edited yet
  useEffect(() => {
    const currentParsed = parseWeddingInfo(existingAsset);
    if (currentParsed && !hasUserEdited.current) {
      if (currentParsed.title) setLine1((prev) => ({ ...prev, text: currentParsed.title!, posY: currentParsed.y1, posX: currentParsed.x1 }));
      if (currentParsed.bride) setLine2((prev) => ({ ...prev, text: currentParsed.bride!, posY: currentParsed.y2, posX: currentParsed.x2 }));
      if (currentParsed.groom) setLine3((prev) => ({ ...prev, text: currentParsed.groom!, posY: currentParsed.y3, posX: currentParsed.x3 }));
      if (currentParsed.date) setLine4((prev) => ({ ...prev, text: currentParsed.date!, posY: currentParsed.y4, posX: currentParsed.x4 }));
    }
  }, [existingAsset]);

  // Live real-time update ONLY when user actively interacts with inputs/sliders
  useEffect(() => {
    if (!hasUserEdited.current) {
      return;
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

  // Handle font change: synchronize Bride & Groom fonts together while keeping positions strictly unchanged
  const handleFontFamilyChange = (newFont: string) => {
    hasUserEdited.current = true
    if (activeLineTab === 2 || activeLineTab === 3) {
      setLine2((prev) => ({ ...prev, fontFamily: newFont }))
      setLine3((prev) => ({ ...prev, fontFamily: newFont }))
    } else if (activeLineTab === 1) {
      setLine1((prev) => ({ ...prev, fontFamily: newFont }))
    } else if (activeLineTab === 4) {
      setLine4((prev) => ({ ...prev, fontFamily: newFont }))
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e7ded0',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(39, 22, 32, 0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e7ded0', paddingBottom: '10px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#271620', margin: 0 }}>
          Tùy Chỉnh Chữ &amp; Font Từng Dòng
        </h4>
        <span style={{ fontSize: '10px', backgroundColor: '#f1e4d8', color: '#a15c2e', border: '1px solid rgba(161, 92, 46, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
          Live Customizer
        </span>
      </div>

      {/* Preset Title Selector Buttons */}
      <div>
        <label style={{ fontSize: '11px', color: '#6e6259', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          Tên Lễ Nhanh (Dòng 1):
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {EVENT_TITLES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                hasUserEdited.current = true
                setLine1((prev) => ({ ...prev, text: t }))
                setActiveLineTab(1)
              }}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '600',
                border: line1.text === t ? '1px solid #a15c2e' : '1px solid #e7ded0',
                borderRadius: '6px',
                backgroundColor: line1.text === t ? '#a15c2e' : '#fbf7f1',
                color: line1.text === t ? '#ffffff' : '#6e6259',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Line Tab Selector Buttons */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f4eee3', padding: '4px', borderRadius: '8px', border: '1px solid #e7ded0' }}>
        {[
          { id: 1, label: 'Dòng 1 (Lễ)' },
          { id: 2, label: 'Dòng 2 (Cô Dâu)' },
          { id: 3, label: 'Dòng 3 (Chú Rể)' },
          { id: 4, label: 'Dòng 4 (Ngày)' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveLineTab(tab.id as 1 | 2 | 3 | 4)}
            style={{
              flex: 1,
              padding: '6px 2px',
              fontSize: '11px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: activeLineTab === tab.id ? '#a15c2e' : 'transparent',
              color: activeLineTab === tab.id ? '#ffffff' : '#6e6259',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeLineTab === tab.id ? '0 1px 3px rgba(161, 92, 46, 0.25)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Line Inspector Controls */}
      <div style={{ backgroundColor: '#fbf7f1', padding: '14px', borderRadius: '10px', border: '1px solid #e7ded0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#271620' }}>
          Điều chỉnh: <span style={{ color: '#a15c2e' }}>{activeLine.title}</span>
        </div>

        {/* Text Input */}
        <div>
          <Input
            label="Nội dung chữ:"
            type="text"
            value={activeLine.data.text}
            onChange={(e) => {
              hasUserEdited.current = true
              activeLine.set((prev) => ({ ...prev, text: e.target.value }))
            }}
          />
        </div>

        {/* Font Family Dropdown */}
        <div>
          <Select
            label={
              activeLineTab === 2 || activeLineTab === 3
                ? "Font Chữ Nghệ Thuật (Đồng bộ Cô Dâu & Chú Rể):"
                : "Font Chữ Nghệ Thuật (10 Kiểu Hot):"
            }
            value={activeLine.data.fontFamily}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            options={ARTISTIC_FONTS.map((f) => ({ value: f.family, label: f.name }))}
          />
        </div>

        {/* Line Position Y Slider (Individual Height / Line Gap) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', color: '#a15c2e', fontWeight: '600' }}>
              Vị trí Y (Độ cao / Khoảng cách dòng): {activeLine.data.posY}px
            </label>
          </div>
          <input
            type="range"
            min="10"
            max="420"
            value={activeLine.data.posY}
            onChange={(e) => {
              hasUserEdited.current = true
              activeLine.set((prev) => ({ ...prev, posY: parseInt(e.target.value) || 0 }))
            }}
            style={{ width: '100%', accentColor: '#a15c2e' }}
          />
        </div>

        {/* Line Position X Slider (Individual Horizontal Offset) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <label style={{ fontSize: '11px', color: '#6e6259' }}>
              Vị trí X (Trái / Phải): {activeLine.data.posX}px
            </label>
            <button
              type="button"
              onClick={() => {
                hasUserEdited.current = true
                activeLine.set((prev) => ({ ...prev, posX: 300 }))
              }}
              style={{ padding: '2px 8px', fontSize: '10px', backgroundColor: '#ffffff', color: '#a15c2e', border: '1px solid #e7ded0', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
            >
              Căn Giữa (300)
            </button>
          </div>
          <input
            type="range"
            min="50"
            max="550"
            value={activeLine.data.posX}
            onChange={(e) => {
              hasUserEdited.current = true
              activeLine.set((prev) => ({ ...prev, posX: parseInt(e.target.value) || 300 }))
            }}
            style={{ width: '100%', accentColor: '#a15c2e' }}
          />
        </div>

        {/* Font Size & Letter Spacing */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6e6259', display: 'block', marginBottom: '2px' }}>
              Cỡ chữ (Size: {activeLine.data.fontSize}px):
            </label>
            <input
              type="range"
              min="12"
              max="110"
              value={activeLine.data.fontSize}
              onChange={(e) => {
                hasUserEdited.current = true
                activeLine.set((prev) => ({ ...prev, fontSize: parseInt(e.target.value) || 20 }))
              }}
              style={{ width: '100%', accentColor: '#a15c2e' }}
            />
          </div>

          <div>
            <Input
              label="Khoảng cách chữ (Spacing):"
              type="text"
              placeholder="0em hoặc 0.18em"
              value={activeLine.data.letterSpacing}
              onChange={(e) => {
                hasUserEdited.current = true
                activeLine.set((prev) => ({ ...prev, letterSpacing: e.target.value }))
              }}
            />
          </div>
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <label style={{ fontSize: '11px', color: '#6e6259', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
          Phối Màu &amp; Hiệu Ứng 3D Ánh Kim:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                hasUserEdited.current = true
                setSelectedColor(c)
              }}
              style={{
                padding: '8px 10px',
                fontSize: '11px',
                fontWeight: '600',
                border: selectedColor.id === c.id ? '2px solid #a15c2e' : '1px solid #e7ded0',
                borderRadius: '8px',
                backgroundColor: selectedColor.id === c.id ? '#fdf7f5' : '#fbf7f1',
                color: '#271620',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: selectedColor.id === c.id ? '0 2px 6px rgba(161, 92, 46, 0.12)' : 'none'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
