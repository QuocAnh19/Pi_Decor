import { Asset, SlotType } from "../../types";
import {
  swapSVGColors,
  buildCurtainCSSVars,
  buildTintFilter,
  buildBitmapTintFilter,
  recolorSVGString,
} from "../../utils/svgColorUtils";

export interface AssetRendererProps {
  asset: Asset;
  slotType: SlotType;
  slotKey?: string; // for unique filter IDs
  colorOverride?: string; // primary hex color
  colorMap?: Record<string, string>; // optional per-color swap map
  filterMode?: "multiply_blend" | "flat_tint" | "color_map";
  colorSaturation?: number; // 0 to 200 (default 100)
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function AssetRenderer({
  asset,
  slotType,
  slotKey,
  colorOverride,
  colorMap,
  filterMode,
  colorSaturation = 100,
  width = "100%",
  height = "100%",
  className = "",
}: AssetRendererProps) {
  const isStretch = slotType === "drape" || slotType === "drape_detail";
  const preserveAspectRatio = isStretch ? "none" : "xMidYMid meet";
  const objectFit = isStretch ? "fill" : "contain";

  // Case 1: Inline SVG string content
  if (asset.svgData && asset.svgData.trim().startsWith("<")) {
    // Extract viewBox from SVG string if available, fallback to 0 0 800 600
    const viewBoxMatch = asset.svgData.match(/viewBox=["']([^"']+)["']/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 800 600";

    // Extract inner content inside <svg> ... </svg>
    let innerContent = asset.svgData;
    if (asset.svgData.includes("<svg")) {
      innerContent = asset.svgData.replace(/<svg[^>]*>/i, "").replace(/<\/svg>/i, "");
    }

    const isTextAsset =
      slotType === "text_name" ||
      slotType === "text_date" ||
      asset.tags?.includes("custom-artistic-text") ||
      asset.tags?.includes("text_name");

    // Direct attribute & raster image recoloring engine (Skip for text assets to preserve 3D gold gradients & custom fonts)
    if (colorOverride && !isTextAsset) {
      if (asset.svgData.includes("var(--curtain-")) {
        innerContent = `<g style="${buildCurtainCSSVars(colorOverride)}">${innerContent}</g>`;
      } else {
        // 1. Recolor vector attributes if present
        innerContent = recolorSVGString(innerContent, colorOverride, colorMap, colorSaturation);

        // 2. Wrap with bitmap tint filter to recolor embedded raster PNG <image> elements (from background removal)
        const filterId = `bitmap-tint-${slotKey ?? "x"}`;
        const bitmapDefs = buildBitmapTintFilter(colorOverride, filterId, colorSaturation);

        if (filterMode === "flat_tint") {
          const flatId = `flat-${slotKey ?? "x"}`;
          innerContent = `<defs>${buildTintFilter(colorOverride, flatId)}</defs><g filter="url(#${flatId})">${innerContent}</g>`;
        } else {
          innerContent = `<defs>${bitmapDefs}</defs><g filter="url(#${filterId})">${innerContent}</g>`;
        }
      }
    } else if (colorMap && Object.keys(colorMap).length > 0 && !isTextAsset) {
      innerContent = swapSVGColors(innerContent, colorMap);
    }

    return (
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        preserveAspectRatio={preserveAspectRatio}
        className={className}
        style={{ display: "block", overflow: "visible", width, height }}
        dangerouslySetInnerHTML={{ __html: innerContent }}
      />
    );
  }

  // Case 2: Thumbnail or Image URL (Raster PNG/JPG from Cloudinary / Uploads)
  const imageSrc =
    asset.thumbnail ||
    (asset as unknown as { image_url?: string; imageUrl?: string }).image_url ||
    (asset as unknown as { imageUrl?: string }).imageUrl;

  if (imageSrc) {
    const filterId = `img-filter-${slotKey ?? "x"}`;
    const filterDefs = colorOverride
      ? buildBitmapTintFilter(colorOverride, filterId, colorSaturation)
      : "";

    return (
      <div style={{ position: "relative", width, height }}>
        {colorOverride && (
          <svg
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <defs dangerouslySetInnerHTML={{ __html: filterDefs }} />
          </svg>
        )}
        <img
          src={imageSrc}
          alt={asset.name}
          className={className}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            display: "block",
            filter: colorOverride ? `url(#${filterId})` : "none",
          }}
          draggable={false}
        />
      </div>
    );
  }

  // Case 3: Color asset (colorHex)
  if (asset.colorHex || colorOverride) {
    const activeColor = colorOverride || asset.colorHex;
    return (
      <div
        className={className}
        style={{
          width,
          height,
          backgroundColor: activeColor,
          borderRadius: slotType === "color_accent" ? "50%" : "4px",
          opacity: 0.9,
        }}
      />
    );
  }

  // Fallback text rendering
  return (
    <div
      className={className}
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "12px",
        fontWeight: "bold",
        textAlign: "center",
        padding: "4px",
      }}
    >
      {asset.name}
    </div>
  );
}
