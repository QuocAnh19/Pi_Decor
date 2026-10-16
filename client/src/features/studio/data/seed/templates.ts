import { Template, SlotDefinition, Asset, SlotRule, SlotConfig } from "../../types";
import { extractSVGColors } from "../../utils/svgColorUtils";
import { seedAssets } from "./seedAssets";

export { seedAssets };

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
