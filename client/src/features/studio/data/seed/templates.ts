import { Template, SlotDefinition, Asset, SlotRule, SlotConfig } from "../../types";
import { extractSVGColors } from "../../utils/svgColorUtils";

/**
 * Standardize Asset helper for future SVG uploads:
 * When adding a new curtain SVG asset to the system, run `prepareAssetWithColors(asset)`
 * to automatically extract dominantColors for colorMap swapping.
 */
export function prepareAssetWithColors(asset: Asset): Asset {
  if (asset.svgData && !asset.dominantColors) {
    asset.dominantColors = extractSVGColors(asset.svgData);
  }
  return asset;
}

export const seedTemplates: Template[] = [
  {
    id: "tpl-classic-01",
    name: "Phông basic",
    category: "co-dien",
    isActive: true,
    thumbnail:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=300",
    svgBase: `
  <g id="background-frame">
    <defs>
      <!-- Gradient chính: Tối góc trái chuyển sang sáng góc phải -->
      <linearGradient id="bg-studio-gradient" x1="0%" y1="30%" x2="100%" y2="20%">
        <stop offset="0%" stop-color="#1e2022" />
        <stop offset="35%" stop-color="#3c3f44" />
        <stop offset="70%" stop-color="#8a8d93" />
        <stop offset="100%" stop-color="#e2e5ea" />
      </linearGradient>

      <!-- Vệt sáng mềm (Spotlight) phía trên bên phải -->
      <radialGradient id="bg-spotlight" cx="85%" cy="15%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>

      <!-- Gradient bóng đổ mặt sàn phía dưới -->
      <linearGradient id="floor-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0b0c0d" stop-opacity="0.9" />
        <stop offset="40%" stop-color="#1f2124" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#70747a" stop-opacity="0.3" />
      </linearGradient>
    </defs>

    <!-- 1. Nền chuyển sắc chính -->
    <rect x="0" y="0" width="800" height="600" fill="url(#bg-studio-gradient)" />

    <!-- 2. Điểm tụ sáng (Spotlight highlight) góc phải -->
    <rect x="0" y="0" width="800" height="600" fill="url(#bg-spotlight)" />

    <!-- 3. Vệt đường chân trời/sàn tối -->
    <rect x="0" y="495" width="800" height="15" fill="#0d0e10" opacity="0.85" />

    <!-- 4. Mặt sàn phản chiếu phía dưới cùng -->
    <rect x="0" y="510" width="800" height="90" fill="url(#floor-shadow)" />
  </g>
`,
  },
];

export const seedSlots: SlotDefinition[] = [
  {
    id: "slot-drape-main",
    templateId: "tpl-classic-01",
    slotKey: "drape-main",
    label: "Rèm Nền Chính",
    slotType: "drape",
    normX: 0.5,
    normY: 0.45,
    normWidth: 0.75,
    normHeight: 0.7,
    allowScale: false,
    allowRotate: false,
    mirrorX: false,
    zIndex: 1,
    sortOrder: 1,
    required: true,
  },
  {
    id: "slot-drape-detail",
    templateId: "tpl-classic-01",
    slotKey: "drape-detail",
    label: "Chi Tiết Rèm Lớp Phủ",
    slotType: "drape_detail",
    normX: 0.5,
    normY: 0.2,
    normWidth: 0.65,
    normHeight: 0.22,
    allowScale: false,
    allowRotate: false,
    mirrorX: false,
    zIndex: 2,
    sortOrder: 2,
  },
  {
    id: "slot-flower-left",
    templateId: "tpl-classic-01",
    slotKey: "flower-left",
    label: "Cụm Hoa Trang Trí Góc Trái",
    slotType: "flower",
    normX: 0.16,
    normY: 0.25,
    normWidth: 0.2,
    normHeight: 0.3,
    allowScale: true,
    allowRotate: true,
    mirrorX: false,
    zIndex: 3,
    sortOrder: 3,
  },
  {
    id: "slot-flower-right",
    templateId: "tpl-classic-01",
    slotKey: "flower-right",
    label: "Cụm Hoa Trang Trí Góc Phải",
    slotType: "flower",
    normX: 0.84,
    normY: 0.25,
    normWidth: 0.2,
    normHeight: 0.3,
    allowScale: true,
    allowRotate: true,
    mirrorX: true,
    zIndex: 3,
    sortOrder: 4,
  },
  {
    id: "slot-name-text",
    templateId: "tpl-classic-01",
    slotKey: "name-text",
    label: "Tên Cô Dâu & Chú Rể",
    slotType: "text_name",
    normX: 0.5,
    normY: 0.55,
    normWidth: 0.45,
    normHeight: 0.15,
    allowScale: true,
    allowRotate: false,
    mirrorX: false,
    zIndex: 4,
    sortOrder: 5,
    required: true,
  },
];

export const seedAssets: Asset[] = [
  {
    id: "asset-drape-red",
    assetType: "drape",
    name: "Rèm Nhung Đỏ Đô",
    colorHex: "#8B0000",
    tags: ["do-do", "sang-trong", "co-dien"],
    isActive: true,
    svgData: `<svg viewBox="100 80 600 420"><path d="M 100 80 Q 200 120 400 80 Q 600 120 700 80 L 700 500 Q 600 480 400 500 Q 200 480 100 500 Z" fill="#8B0000" opacity="0.9" /></svg>`,
  },
  {
    id: "asset-drape-white",
    assetType: "drape",
    name: "Rèm Lụa Trắng Sữa",
    colorHex: "#F8F8FF",
    tags: ["trang", "hien-dai", "tinh-khoi"],
    isActive: true,
    svgData: `<svg viewBox="100 80 600 420"><path d="M 100 80 Q 200 120 400 80 Q 600 120 700 80 L 700 500 Q 600 480 400 500 Q 200 480 100 500 Z" fill="#F8F8FF" opacity="0.9" /></svg>`,
  },
  {
    id: "asset-detail-rect",
    assetType: "drape_detail",
    name: "Rèm Vắt Dạng Khối (Rect-Block)",
    colorHex: "#B22222",
    tags: ["rect-block", "co-dien"],
    isActive: true,
    svgData: `<svg viewBox="140 80 520 135"><path d="M 140 80 L 660 80 L 660 200 Q 400 230 140 200 Z" fill="#B22222" opacity="0.95" /></svg>`,
  },
  {
    id: "asset-detail-swag",
    assetType: "drape_detail",
    name: "Rèm Vắt Lụa Mềm (Swag)",
    colorHex: "#DAA520",
    tags: ["vat-lua", "mem-mai"],
    isActive: true,
    svgData: `<svg viewBox="140 80 520 160"><path d="M 140 80 Q 400 240 660 80 Q 400 180 140 80 Z" fill="#DAA520" opacity="0.9" /></svg>`,
  },
  {
    id: "asset-flower-pastel",
    assetType: "flower",
    name: "Cụm Hoa Hồng & Lan Pastel",
    colorHex: "#FFB6C1",
    tags: ["hong", "pastel", "lang-man"],
    isActive: true,
    svgData: `<svg viewBox="85 105 105 110"><g opacity="0.95">
      <circle cx="140" cy="170" r="30" fill="#FFB6C1" />
      <circle cx="160" cy="150" r="25" fill="#FFC0CB" />
      <circle cx="120" cy="190" r="20" fill="#E6E6FA" />
      <path d="M 110 140 Q 90 120 120 110 Q 140 130 110 140 Z" fill="#2E8B57" />
    </g></svg>`,
  },
  {
    id: "asset-text-gold",
    assetType: "text_name",
    name: "Chữ Ép Kim Vàng Playfair",
    colorHex: "#FFD700",
    fontFamily: "Playfair Display",
    tags: ["go", "ep-kim", "sang-trong"],
    isActive: true,
    svgData: `<svg viewBox="100 275 600 70"><g text-anchor="middle">
      <text x="400" y="310" fill="#FFD700" font-family="'Playfair Display', serif" font-size="28" font-weight="700">
        Minh Tuấn &amp; Thanh Hằng
      </text>
      <text x="400" y="335" fill="#E6C200" font-family="'Inter', sans-serif" font-size="14" letter-spacing="3">
        24 • 12 • 2026
      </text>
    </g></svg>`,
  },
  {
    id: "asset-text-vuquy",
    assetType: "text_name",
    name: "Bộ Chữ Lễ Vu Quy — Phương Anh & Đức Dũng",
    colorHex: "#FFD700",
    fontFamily: "Great Vibes",
    tags: ["vu-quy", "phuong-anh", "duc-dung", "3d", "ep-kim"],
    isActive: true,
    svgData: `<svg viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&amp;family=Playfair+Display:ital,wght@0,600;1,400&amp;family=Montserrat:wght@500&amp;display=swap');
    </style>
    <linearGradient id="goldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDF0A6" />
      <stop offset="30%" stop-color="#D4AF37" />
      <stop offset="65%" stop-color="#AA771C" />
      <stop offset="100%" stop-color="#FFD700" />
    </linearGradient>
    <filter id="mdf3dShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.65"/>
      <feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="#5B4500" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Dòng 1: Tên Lễ -->
  <text x="300" y="55" text-anchor="middle" fill="url(#goldGoldGrad)" font-family="'Playfair Display', 'Cinzel', serif" font-size="20" font-weight="600" letter-spacing="0.18em">
    LỄ VU QUY
  </text>

  <!-- Dòng 2: Tên Cô Dâu -->
  <text x="300" y="160" text-anchor="middle" fill="url(#goldGoldGrad)" filter="url(#mdf3dShadow)" font-family="'Great Vibes', 'Alex Brush', cursive" font-size="76">
    Phương Anh
  </text>

  <!-- Dòng 3: Tên Chú Rể -->
  <text x="300" y="275" text-anchor="middle" fill="url(#goldGoldGrad)" filter="url(#mdf3dShadow)" font-family="'Great Vibes', 'Alex Brush', cursive" font-size="76">
    Đức Dũng
  </text>

  <!-- Dòng 4: Ngày Tháng Năm -->
  <text x="300" y="365" text-anchor="middle" fill="#FDF0A6" font-family="'Montserrat', sans-serif" font-size="18" font-weight="500" letter-spacing="0.25em" opacity="0.95">
    19.03.2026
  </text>
</svg>`,
  },
];

export const seedRules: SlotRule[] = [
  {
    id: "rule-red-drape",
    templateId: "tpl-classic-01",
    ruleName: "Rèm đỏ đô bắt buộc chi tiết dạng khối",
    conditionSlot: "drape-main",
    conditionValue: { asset_tag: "do-do" },
    targetSlot: "drape-detail",
    action: "force_asset",
    actionValue: { forced_asset_tag: "rect-block" },
    priority: 10,
  },
];

export const seedPublishedSlotConfig: SlotConfig = {
  "drape-main": {
    assetId: "asset-drape-red",
    asset: seedAssets[0],
    colorOverride: "#8B0000",
    filterMode: "multiply_blend",
  },
  "drape-detail": {
    assetId: "asset-detail-rect",
    asset: seedAssets[2],
    colorOverride: "#B22222",
    filterMode: "multiply_blend",
  },
  "flower-left": {
    assetId: "asset-flower-pastel",
    asset: seedAssets[4],
    colorOverride: "#FFB6C1",
    filterMode: "multiply_blend",
  },
  "flower-right": {
    assetId: "asset-flower-pastel",
    asset: seedAssets[4],
    colorOverride: "#FFB6C1",
    filterMode: "multiply_blend",
  },
  "name-text": {
    assetId: "asset-text-vuquy",
    asset: seedAssets[6],
    colorOverride: "#FFD700",
    filterMode: "flat_tint",
  },
};
