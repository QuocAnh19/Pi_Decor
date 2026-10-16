import type { Asset } from "../types";

export const EVENT_TITLES = ["LỄ VU QUY", "LỄ TÂN HÔN", "LỄ THÀNH HÔN", "LỄ ĐÍNH HÔN", "LỄ BÁO HỶ"];

export const ARTISTIC_FONTS = [
  { id: "great-vibes", name: "Great Vibes (Uốn lượn cổ điển)", family: "'Great Vibes', cursive" },
  {
    id: "alex-brush",
    name: "Alex Brush (Script nét thanh nét đậm)",
    family: "'Alex Brush', cursive",
  },
  {
    id: "pinyon-script",
    name: "Pinyon Script (Hoàng gia uốn lượn quý phái)",
    family: "'Pinyon Script', cursive",
  },
  {
    id: "parisienne",
    name: "Parisienne (Phong cách Pháp tinh tế)",
    family: "'Parisienne', cursive",
  },
  {
    id: "doulaise",
    name: "Monsieur La Doulaise (Calligraphy bay bổng)",
    family: "'Monsieur La Doulaise', cursive",
  },
  {
    id: "dancing-script",
    name: "Dancing Script (Tự nhiên lãng mạn)",
    family: "'Dancing Script', cursive",
  },
  {
    id: "playfair",
    name: "Playfair Display (Serif cổ điển sang trọng)",
    family: "'Playfair Display', serif",
  },
  { id: "cinzel", name: "Cinzel (Serif La Mã đẳng cấp)", family: "'Cinzel', serif" },
  {
    id: "cormorant",
    name: "Cormorant Garamond (Serif quý tộc thanh mảnh)",
    family: "'Cormorant Garamond', serif",
  },
  {
    id: "montserrat",
    name: "Montserrat (Sans-serif hiện đại)",
    family: "'Montserrat', sans-serif",
  },
];

export const COLOR_PRESETS = [
  {
    id: "gold-3d",
    name: "Vàng Ánh Kim 3D",
    grad1: "#FDF0A6",
    grad2: "#D4AF37",
    grad3: "#AA771C",
    grad4: "#FFD700",
    dateColor: "#FDF0A6",
  },
  {
    id: "rosegold-3d",
    name: "Hồng Rose Gold 3D",
    grad1: "#FFE4E1",
    grad2: "#E8C5C8",
    grad3: "#B76E79",
    grad4: "#FFB6C1",
    dateColor: "#FFE4E1",
  },
  {
    id: "silver-3d",
    name: "Trắng Bạc Ép Kim",
    grad1: "#FFFFFF",
    grad2: "#E2E8F0",
    grad3: "#94A3B8",
    grad4: "#CBD5E1",
    dateColor: "#E2E8F0",
  },
  {
    id: "red-velvet",
    name: "Đỏ Nhung Nổi",
    grad1: "#FF6B6B",
    grad2: "#E11D48",
    grad3: "#9F1239",
    grad4: "#F43F5E",
    dateColor: "#FF6B6B",
  },
];

export interface LineSettings {
  text: string;
  fontFamily: string;
  fontSize: number;
  letterSpacing: string;
  posY: number;
  posX: number;
}

/**
 * Tạo chuỗi SVG bảng tên cưới từ cấu hình 4 dòng và hiệu ứng màu ánh kim.
 */
export function generateCustomWeddingSVG({
  line1,
  line2,
  line3,
  line4,
  colorPreset,
}: {
  line1: LineSettings;
  line2: LineSettings;
  line3: LineSettings;
  line4: LineSettings;
  colorPreset: (typeof COLOR_PRESETS)[0];
}): string {
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@600;700&family=Cormorant+Garamond:wght@500;600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Monsieur+La+Doulaise&family=Montserrat:wght@500;600&family=Parisienne&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');`;

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
</svg>`;
}

/**
 * Tách nội dung chữ và toạ độ 4 dòng từ SVG của asset chữ có sẵn.
 */
export function parseWeddingInfo(existingAsset?: Asset | null) {
  if (!existingAsset) return null;
  const svgData = existingAsset.svgData || "";

  const textMatches = Array.from(svgData.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi));

  let title: string | undefined;
  let bride: string | undefined;
  let groom: string | undefined;
  let date: string | undefined;

  let y1 = 55,
    y2 = 160,
    y3 = 275,
    y4 = 365;
  let x1 = 300,
    x2 = 300,
    x3 = 300,
    x4 = 300;

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

    const parsedX1 = extractAttr(t0, "x");
    if (parsedX1) x1 = parseFloat(parsedX1);
    const parsedX2 = extractAttr(t1, "x");
    if (parsedX2) x2 = parseFloat(parsedX2);
    const parsedX3 = extractAttr(t2, "x");
    if (parsedX3) x3 = parseFloat(parsedX3);
    const parsedX4 = extractAttr(t3, "x");
    if (parsedX4) x4 = parseFloat(parsedX4);

    const parsedY1 = extractAttr(t0, "y");
    if (parsedY1) y1 = parseFloat(parsedY1);
    const parsedY2 = extractAttr(t1, "y");
    if (parsedY2) y2 = parseFloat(parsedY2);
    const parsedY3 = extractAttr(t2, "y");
    if (parsedY3) y3 = parseFloat(parsedY3);
    const parsedY4 = extractAttr(t3, "y");
    if (parsedY4) y4 = parseFloat(parsedY4);
  } else if (textMatches.length >= 2) {
    const combinedNames = textMatches[0][1]?.replace(/<[^>]+>/g, "").trim();
    if (combinedNames && combinedNames.includes("&")) {
      const parts = combinedNames.split("&");
      bride = parts[0]?.trim();
      groom = parts[1]?.trim();
    }
    date = textMatches[1][1]?.replace(/<[^>]+>/g, "").trim();
  }

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
    x1,
    x2,
    x3,
    x4,
    y1,
    y2,
    y3,
    y4,
  };
}
