/**
 * SVG Curtain Color Utilities
 * Functions for converting hex/HSL colors, extracting colors from SVG,
 * swapping colors via colorMap, and generating CSS variables or tint filters.
 */

/**
 * Converts hex color to HSL object
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  }
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Converts HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * Derives a shadow variant (darker) from a base hex color
 */
export function deriveShadowColor(hex: string): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, Math.min(s + 10, 100), Math.max(l - 20, 5));
}

/**
 * Derives a highlight variant (lighter) from a base hex color
 */
export function deriveHighlightColor(hex: string): string {
  const { h, s, l } = hexToHSL(hex);
  return hslToHex(h, Math.max(s - 10, 0), Math.min(l + 20, 95));
}

/**
 * METHOD A: Swap hardcoded fill/stroke colors in SVG string using a colorMap.
 * Use when SVG uses hardcoded hex colors.
 */
export function swapSVGColors(svgStr: string, colorMap: Record<string, string>): string {
  let result = svgStr;
  for (const [from, to] of Object.entries(colorMap)) {
    const f = from.replace("#", "").toLowerCase();
    // Match fill="#XXXXXX", stroke="#XXXXXX", fill:#XXXXXX, stroke:#XXXXXX (case-insensitive)
    result = result
      .replace(new RegExp(`fill="#${f}"`, "gi"), `fill="${to}"`)
      .replace(new RegExp(`stroke="#${f}"`, "gi"), `stroke="${to}"`)
      .replace(new RegExp(`fill:#${f}`, "gi"), `fill:${to}`)
      .replace(new RegExp(`stroke:#${f}`, "gi"), `stroke:${to}`)
      .replace(new RegExp(`stop-color="#${f}"`, "gi"), `stop-color="${to}"`)
      .replace(new RegExp(`stop-color:#${f}`, "gi"), `stop-color:${to}`);
  }
  return result;
}

/**
 * METHOD B: Extract all unique fill/stroke hex colors from an SVG string.
 * Used to build colorMap when admin uploads a new SVG.
 */
export function extractSVGColors(svgStr: string): string[] {
  const hexPattern = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
  const matches = svgStr.match(hexPattern) ?? [];
  return [...new Set(matches.map((c) => c.toLowerCase()))];
}

/**
 * METHOD C (RECOMMENDED): Build inline CSS variables string from a base color.
 * Use when SVG is designed with var(--curtain-main) etc.
 */
export function buildCurtainCSSVars(baseHex: string): string {
  const { h, s, l } = hexToHSL(baseHex);
  return [
    `--curtain-main:${baseHex}`,
    `--curtain-shadow:${deriveShadowColor(baseHex)}`,
    `--curtain-highlight:${deriveHighlightColor(baseHex)}`,
    `--curtain-deep:${hslToHex(h, s, l)}`,
  ].join(";");
}

/**
 * Builds an SVG <filter> string that replaces all colors with a flat tint.
 * Fallback method when SVG uses hardcoded colors and no colorMap is available.
 */
export function buildTintFilter(hex: string, filterId: string): string {
  return `<filter id="${filterId}" color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
    <feFlood flood-color="${hex}" result="flood"/>
    <feComposite in="flood" in2="SourceAlpha" operator="in"/>
  </filter>`;
}

/**
 * Builds an SVG <filter> using feBlend multiply mode.
 * Preserves curtain shading and fabric folds while applying the target color tint.
 */
export function buildMultiplyFilter(hex: string, filterId: string): string {
  return `<filter id="${filterId}" color-interpolation-filters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
    <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" result="lumMap"/>
    <feFlood flood-color="${hex}" result="targetColor"/>
    <feBlend in="targetColor" in2="lumMap" mode="multiply" result="coloredFolds"/>
    <feBlend in="coloredFolds" in2="SourceGraphic" mode="soft-light" result="preservedFolds"/>
    <feComposite in="preservedFolds" in2="SourceAlpha" operator="in"/>
  </filter>`;
}

/**
 * Builds an SVG <filter> specifically tailored for bitmap/raster PNG images
 * (such as SVGs generated by removing background from PNG curtain photos).
 * Uses Rec.709 luminance mapping + soft-light blending to preserve 100% of the
 * original curtain's fabric folds, highlights, shadows, and brightness.
 */
export function buildBitmapTintFilter(
  hex: string,
  filterId: string,
  saturation: number = 100
): string {
  // Deep, dense wedding curtain color saturation (1.45x baseline boost)
  const satVal = ((saturation / 100) * 1.45).toFixed(2);
  return `<filter id="${filterId}" color-interpolation-filters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
    <!-- Step 1: Standard Rec.709 Luminance extraction for fabric shadow fold mask -->
    <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" result="lumMap"/>
    <!-- Step 2: Ultra-Deep Shadow fold transfer: deepen dark shadow folds & accentuate 3D fabric contrast -->
    <feComponentTransfer in="lumMap" result="deepShadowFolds">
      <feFuncR type="linear" slope="0.70" intercept="0.02"/>
      <feFuncG type="linear" slope="0.70" intercept="0.02"/>
      <feFuncB type="linear" slope="0.70" intercept="0.02"/>
    </feComponentTransfer>
    <!-- Step 3: Pure rich target wedding color flood -->
    <feFlood flood-color="${hex}" result="targetColor"/>
    <!-- Step 4: Multiply target color onto ultra-deep dark shadow folds for dramatic 3D fabric depth -->
    <feBlend in="targetColor" in2="deepShadowFolds" mode="multiply" result="coloredFolds"/>
    <!-- Step 5: Adjust color saturation intensity for deep, rich wedding venue tone -->
    <feColorMatrix in="coloredFolds" type="saturate" values="${satVal}" result="saturatedFolds"/>
    <!-- Step 6: Clip strictly to original transparent PNG alpha mask -->
    <feComposite in="saturatedFolds" in2="SourceAlpha" operator="in"/>
  </filter>`;
}

/**
 * Direct SVG Attribute Recoloring Engine with Deep Wedding Color Compression.
 * Replaces all fill, stroke, and stop-color attributes in an SVG string with target hex color
 * maintaining dark shadow folds while eliminating pale washed-out highlights.
 */
export function recolorSVGString(
  svgStr: string,
  targetHex: string,
  colorMap?: Record<string, string>,
  saturation: number = 100
): string {
  let result = svgStr;

  if (colorMap && Object.keys(colorMap).length > 0) {
    result = swapSVGColors(result, colorMap);
    return result;
  }

  const { h: targetH, s: rawTargetS } = hexToHSL(targetHex);
  // Boost target saturation (+40%) for dense, deep wedding venue colors
  const targetS = Math.min(Math.max(Math.round(rawTargetS * 1.4 * (saturation / 100)), 0), 100);

  // Replace fill, stroke, and stop-color attributes while preserving dark shadow folds
  result = result
    .replace(/fill=["'](#[0-9A-Fa-f]{3,6})["']/gi, (_match, origHex) => {
      const lower = origHex.toLowerCase();
      if (lower === "#none" || lower === "none" || lower === "#transparent") return _match;
      const { l: origL } = hexToHSL(origHex);
      // Compress lightness range (max 60%) to eliminate pale washed-out white while keeping deep shadow contrast
      const deepL = Math.max(Math.min(Math.round(origL * 0.75), 60), 4);
      const newHex = hslToHex(targetH, targetS, deepL);
      return `fill="${newHex}"`;
    })
    .replace(/stroke=["'](#[0-9A-Fa-f]{3,6})["']/gi, (_match, origHex) => {
      const lower = origHex.toLowerCase();
      if (lower === "#none" || lower === "none" || lower === "#transparent") return _match;
      const { l: origL } = hexToHSL(origHex);
      // Deepen dark shadow fold stroke lines (max 45% lightness reduction)
      const deepL = Math.max(Math.round(origL * 0.45), 3);
      const newHex = hslToHex(targetH, targetS, deepL);
      return `stroke="${newHex}"`;
    })
    .replace(/stop-color=["'](#[0-9A-Fa-f]{3,6})["']/gi, (_match, origHex) => {
      const { l: origL } = hexToHSL(origHex);
      const deepL = Math.max(Math.min(Math.round(origL * 0.75), 60), 4);
      const newHex = hslToHex(targetH, targetS, deepL);
      return `stop-color="${newHex}"`;
    });

  return result;
}
