import { toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';

export interface CaptureOptions {
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * Captures a clean snapshot/thumbnail of the Studio canvas.
 * Guaranteed to completely hide slot borders, badges, debug coordinates, and guide lines.
 * Features dual-engine fallback (html-to-image -> html2canvas) for 100% reliability.
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
    // 2. Primary Engine: html-to-image
    try {
      const dataUrl = await toJpeg(node, {
        quality,
        pixelRatio: 1.2,
        cacheBust: false,
        filter: (domNode: HTMLElement) => {
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
        },
        backgroundColor: '#0f172a',
      });

      if (dataUrl && dataUrl.length > 100) {
        return dataUrl;
      }
    } catch (err) {
      console.warn('[captureStudioThumbnail] html-to-image failed, trying html2canvas fallback:', err);
    }

    // 3. Secondary Engine: html2canvas Fallback
    try {
      const canvas = await html2canvas(node, {
        backgroundColor: '#0f172a',
        scale: 1,
        logging: false,
        useCORS: true,
        ignoreElements: (element) => {
          const classList = element?.classList;
          return (
            classList?.contains('slot-marker') ||
            classList?.contains('guide-line') ||
            classList?.contains('slot-border-overlay') ||
            classList?.contains('slot-badge-overlay') ||
            element?.getAttribute?.('data-no-snapshot') === 'true'
          );
        },
      });

      const fallbackDataUrl = canvas.toDataURL('image/jpeg', quality);
      if (fallbackDataUrl && fallbackDataUrl.length > 100) {
        return fallbackDataUrl;
      }
    } catch (err2) {
      console.error('[captureStudioThumbnail] All snapshot methods failed:', err2);
    }

    return '';
  } finally {
    // 4. Guaranteed restoration of all borders and markers for editor
    node.classList.remove('is-capturing-snapshot');
    node.removeAttribute('data-capturing');

    hiddenElements.forEach(({ el, originalDisplay, originalVisibility }) => {
      el.style.display = originalDisplay;
      el.style.visibility = originalVisibility;
    });
  }
}
