import { toJpeg, toPng } from 'html-to-image';

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
  if (typeof target === 'string') {
    node = document.querySelector(target) as HTMLElement | null;
  } else if (target instanceof HTMLElement) {
    node = target;
  }

  if (!node) {
    node = (document.getElementById('studio-canvas-stage') ||
      document.querySelector('.svg-canvas-container') ||
      document.querySelector('[data-studio-canvas="true"]')) as HTMLElement | null;
  }

  if (!node) {
    console.warn('[captureStudioThumbnail] Canvas element not found.');
    return '';
  }

  // 1. Temporarily hide all slot borders, badges, markers, and guidelines directly in DOM
  const hiddenElements: { el: HTMLElement | SVGElement; originalDisplay: string; originalVisibility: string }[] = [];
  const overlayElements = node.querySelectorAll<HTMLElement | SVGElement>(
    '.slot-border-overlay, .slot-badge-overlay, .slot-marker, .guide-line, [data-no-snapshot="true"]'
  );

  overlayElements.forEach((el) => {
    hiddenElements.push({
      el,
      originalDisplay: el.style.display,
      originalVisibility: el.style.visibility,
    });
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
  });

  node.classList.add('is-capturing-snapshot');
  node.setAttribute('data-capturing', 'true');

  try {
    const filter = (domNode: HTMLElement) => {
      const classList = domNode?.classList;
      if (
        classList?.contains('slot-marker') ||
        classList?.contains('guide-line') ||
        classList?.contains('slot-border-overlay') ||
        classList?.contains('slot-badge-overlay') ||
        domNode?.getAttribute?.('data-no-snapshot') === 'true'
      ) {
        return false;
      }
      return true;
    };

    // Primary: toJpeg
    try {
      const dataUrl = await toJpeg(node, {
        quality,
        pixelRatio: 1.2,
        cacheBust: false,
        filter,
        backgroundColor: '#0f172a',
      });

      if (dataUrl && dataUrl.length > 100) {
        return dataUrl;
      }
    } catch (jpegErr) {
      console.warn('[captureStudioThumbnail] toJpeg failed, attempting toPng fallback:', jpegErr);
    }

    // Fallback: toPng
    try {
      const pngDataUrl = await toPng(node, {
        pixelRatio: 1.2,
        cacheBust: false,
        filter,
        backgroundColor: '#0f172a',
      });

      if (pngDataUrl && pngDataUrl.length > 100) {
        return pngDataUrl;
      }
    } catch (pngErr) {
      console.error('[captureStudioThumbnail] toPng fallback also failed:', pngErr);
    }

    return '';
  } finally {
    // 2. Guaranteed restoration of all borders and markers for editor
    node.classList.remove('is-capturing-snapshot');
    node.removeAttribute('data-capturing');

    hiddenElements.forEach(({ el, originalDisplay, originalVisibility }) => {
      el.style.display = originalDisplay;
      el.style.visibility = originalVisibility;
    });
  }
}
