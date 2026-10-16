export interface CaptureOptions {
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * Captures a clean snapshot/thumbnail of the Studio canvas.
 * Guaranteed to completely hide slot borders, badges, debug coordinates, and guide lines.
 * Uses html-to-image for optimal SVG rendering, sharp quality, and lightweight bundle size.
 */
export async function captureStudioThumbnail(
  target?: HTMLElement | string | null,
  options: CaptureOptions = {}
): Promise<string> {
  const { quality = 0.85 } = options;

  let node: HTMLElement | null = null;
  if (typeof target === "string") {
    node = document.querySelector(target) as HTMLElement | null;
  } else if (target instanceof HTMLElement) {
    node = target;
  }

  if (!node) {
    node = (document.getElementById("studio-canvas-stage") ||
      document.querySelector(".svg-canvas-container") ||
      document.querySelector('[data-studio-canvas="true"]')) as HTMLElement | null;
  }

  if (!node) {
    console.warn("[captureStudioThumbnail] Canvas element not found.");
    return "";
  }

  // 1. Temporarily hide all slot borders, badges, markers, and guidelines directly in DOM
  const hiddenElements: {
    el: HTMLElement | SVGElement;
    originalDisplay: string;
    originalVisibility: string;
  }[] = [];
  const overlayElements = node.querySelectorAll<HTMLElement | SVGElement>(
    '.slot-border-overlay, .slot-badge-overlay, .slot-marker, .guide-line, [data-no-snapshot="true"]'
  );

  overlayElements.forEach((el) => {
    hiddenElements.push({
      el,
      originalDisplay: el.style.display,
      originalVisibility: el.style.visibility,
    });
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
  });

  node.classList.add("is-capturing-snapshot");
  node.setAttribute("data-capturing", "true");

  try {
    const filter = (domNode: HTMLElement) => {
      const classList = domNode?.classList;
      if (
        classList?.contains("slot-marker") ||
        classList?.contains("guide-line") ||
        classList?.contains("slot-border-overlay") ||
        classList?.contains("slot-badge-overlay") ||
        domNode?.getAttribute?.("data-no-snapshot") === "true"
      ) {
        return false;
      }
      return true;
    };

    const { toJpeg, toPng } = await import("html-to-image");

    // Primary: toJpeg
    try {
      const dataUrl = await toJpeg(node, {
        quality,
        pixelRatio: 1.2,
        cacheBust: false,
        filter,
        backgroundColor: "#0f172a",
      });

      if (dataUrl && dataUrl.length > 100) {
        return dataUrl;
      }
    } catch (jpegErr) {
      console.warn("[captureStudioThumbnail] toJpeg failed, attempting toPng fallback:", jpegErr);
    }

    // Fallback: toPng
    try {
      const pngDataUrl = await toPng(node, {
        pixelRatio: 1.2,
        cacheBust: false,
        filter,
        backgroundColor: "#0f172a",
      });

      if (pngDataUrl && pngDataUrl.length > 100) {
        return pngDataUrl;
      }
    } catch (pngErr) {
      console.error("[captureStudioThumbnail] toPng fallback also failed:", pngErr);
    }

    return "";
  } finally {
    // 2. Guaranteed restoration of all borders and markers for editor
    node.classList.remove("is-capturing-snapshot");
    node.removeAttribute("data-capturing");

    hiddenElements.forEach(({ el, originalDisplay, originalVisibility }) => {
      el.style.display = originalDisplay;
      el.style.visibility = originalVisibility;
    });
  }
}

export interface BrandingInfo {
  customerName?: string;
  phone?: string;
  weddingDate?: string;
  templateName?: string;
  hotline?: string;
  address?: string;
  website?: string;
}

/**
 * Composites Pi Decor branding, hotline, website, and customer wedding details
 * onto the captured snapshot, producing an elegant branded high-resolution image.
 */
export async function generateBrandedDesignImage(
  baseImageSrc: string,
  info: BrandingInfo = {}
): Promise<string> {
  const {
    customerName = "",
    weddingDate = "",
    templateName = "Phối cảnh tiệc cưới",
    hotline = "0789 241 260",
    address = "372 Trần Đại Nghĩa, Đà Nẵng",
    website = "pidecor.vn",
  } = info;

  return new Promise((resolve) => {
    const img = new Image();
    if (!baseImageSrc.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(baseImageSrc);
        return;
      }

      const imgWidth = Math.max(img.width || 1200, 1000);
      const imgHeight = Math.max(img.height || 750, 600);

      // Footer banner height proportionally
      const footerHeight = Math.max(96, Math.round(imgHeight * 0.14));
      const totalHeight = imgHeight + footerHeight;

      canvas.width = imgWidth;
      canvas.height = totalHeight;

      // 1. Draw original design image
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

      // 2. Draw luxury footer banner background
      const gradient = ctx.createLinearGradient(0, imgHeight, imgWidth, totalHeight);
      gradient.addColorStop(0, "#271620");
      gradient.addColorStop(0.5, "#3b141f");
      gradient.addColorStop(1, "#271620");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, imgHeight, imgWidth, footerHeight);

      // 3. Draw golden accent line on top of banner
      ctx.fillStyle = "#a15c2e";
      const lineThickness = Math.max(3, Math.round(imgWidth * 0.003));
      ctx.fillRect(0, imgHeight, imgWidth, lineThickness);

      // 4. Subtle gold highlight line
      ctx.fillStyle = "rgba(241, 228, 216, 0.2)";
      ctx.fillRect(0, imgHeight + lineThickness, imgWidth, 1);

      // 5. Typography sizing based on canvas width
      const scale = imgWidth / 1200;
      const padX = Math.round(36 * scale);

      // Left Column: Brand Name & Customer info
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Brand Title
      ctx.fillStyle = "#fbf7f1";
      ctx.font = `bold ${Math.round(20 * scale)}px "Fraunces", Georgia, serif`;
      ctx.fillText("PI DECOR", padX, imgHeight + Math.round(footerHeight * 0.2));

      // Subtitle details
      ctx.fillStyle = "#f1dedb";
      ctx.font = `500 ${Math.round(13 * scale)}px "Be Vietnam Pro", sans-serif`;
      const subtitleParts = [
        templateName ? `Mẫu: ${templateName}` : null,
        customerName ? `Khách hàng: ${customerName}` : null,
        weddingDate ? `Ngày tiệc: ${weddingDate}` : null,
      ].filter(Boolean);
      const subtitle = subtitleParts.join("  •  ");
      ctx.fillText(
        subtitle || "Thiết kế không gian cưới tương tác",
        padX,
        imgHeight + Math.round(footerHeight * 0.56)
      );

      // Right Column: Hotline & Contact info
      const rightX = imgWidth - padX;
      ctx.textAlign = "right";

      // Hotline & Zalo
      ctx.fillStyle = "#e59a6b";
      ctx.font = `bold ${Math.round(16 * scale)}px "Be Vietnam Pro", sans-serif`;
      ctx.fillText(
        `Hotline / Zalo: ${hotline}`,
        rightX,
        imgHeight + Math.round(footerHeight * 0.2)
      );

      // Website & Address
      ctx.fillStyle = "#f1dedb";
      ctx.font = `normal ${Math.round(12 * scale)}px "Be Vietnam Pro", sans-serif`;
      ctx.fillText(
        `Website: ${website}  •  ${address}`,
        rightX,
        imgHeight + Math.round(footerHeight * 0.58)
      );

      // 6. Subtle Watermark Badge on Top-Right of the canvas image
      const tagPadX = imgWidth - Math.round(20 * scale);
      const tagPadY = Math.round(20 * scale);
      const tagWidth = Math.round(150 * scale);
      const tagHeight = Math.round(34 * scale);

      ctx.fillStyle = "rgba(39, 22, 32, 0.72)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(tagPadX - tagWidth, tagPadY, tagWidth, tagHeight, 8 * scale);
      } else {
        ctx.rect(tagPadX - tagWidth, tagPadY, tagWidth, tagHeight);
      }
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${Math.round(12 * scale)}px "Be Vietnam Pro", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Pi Decor", tagPadX - tagWidth / 2, tagPadY + tagHeight / 2);

      try {
        const result = canvas.toDataURL("image/jpeg", 0.94);
        resolve(result);
      } catch {
        resolve(baseImageSrc);
      }
    };

    img.onerror = () => {
      resolve(baseImageSrc);
    };

    img.src = baseImageSrc;
  });
}
