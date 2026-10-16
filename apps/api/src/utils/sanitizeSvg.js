import DOMPurify from "isomorphic-dompurify";

/**
 * Loại bỏ @import và các url() trỏ ra ngoài trong thẻ <style>.
 * Chỉ giữ lại url(#id) tham chiếu nội bộ và data:image/(png|jpeg|webp|gif).
 * @param {string} css
 * @returns {string}
 */
function sanitizeCssText(css) {
  if (!css) return "";

  // 1. Loại bỏ toàn bộ @import
  let cleaned = css.replace(/@import\s+[^;]+;?/gi, "");

  // 2. Loại bỏ url() trỏ ra ngoài
  cleaned = cleaned.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (_match, _quote, urlContent) => {
    const trimmed = urlContent.trim();
    if (trimmed.startsWith("#")) {
      return `url(${trimmed})`;
    }
    if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(trimmed)) {
      return `url(${trimmed})`;
    }
    return "none";
  });

  return cleaned;
}

// Cấu hình DOMPurify hooks một lần khi tải module
DOMPurify.addHook("uponSanitizeElement", (node) => {
  const tagName = node.nodeName ? node.nodeName.toLowerCase() : "";

  // Dọn dẹp an toàn nội dung thẻ style
  if (tagName === "style") {
    node.textContent = sanitizeCssText(node.textContent);
  }

  // Chặn animation lén kích hoạt hoặc gán javascript: vào href
  if (tagName === "set" || tagName === "animate") {
    const attrName = (node.getAttribute("attributeName") || "").toLowerCase();
    if (attrName.startsWith("on") || attrName === "href" || attrName === "xlink:href") {
      const toVal = node.getAttribute("to") || "";
      const valVal = node.getAttribute("values") || "";
      const checkVal = (toVal + " " + valVal).toLowerCase();
      if (
        checkVal.includes("javascript:") ||
        (!toVal.startsWith("#") && !toVal.startsWith("data:image/"))
      ) {
        node.parentNode?.removeChild(node);
      }
    }
  }
});

DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  const attrName = (data.attrName || "").toLowerCase();
  const attrVal = (data.attrValue || "").trim();

  // Chặn toàn bộ inline event handler
  if (attrName.startsWith("on")) {
    data.keepAttr = false;
    return;
  }

  // href và xlink:href chỉ cho phép anchor nội bộ "#id" hoặc data URI ảnh
  if (attrName === "href" || attrName === "xlink:href") {
    const isLocalAnchor = attrVal.startsWith("#");
    const isDataImage = /^data:image\/(png|jpeg|webp|gif);base64,/i.test(attrVal);
    if (!isLocalAnchor && !isDataImage) {
      data.keepAttr = false;
    }
  }
});

/**
 * Làm sạch chuỗi SVG chống Stored XSS bằng DOMPurify.
 * Hỗ trợ cả tài liệu SVG hoàn chỉnh lẫn đoạn trích (SVG fragment như <g>...</g>).
 * @param {string} svgString
 * @returns {string}
 */
export function sanitizeSvg(svgString) {
  if (typeof svgString !== "string" || !svgString.trim()) return "";

  const trimmed = svgString.trim();
  const isFragment = !trimmed.toLowerCase().startsWith("<svg");

  // DOMPurify chỉ phân giải đúng các thẻ đồ họa SVG khi chúng nằm trong thẻ <svg>
  const input = isFragment ? `<svg xmlns="http://www.w3.org/2000/svg">${trimmed}</svg>` : trimmed;

  let cleaned = DOMPurify.sanitize(input, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ["use"],
    ADD_ATTR: ["href", "xlink:href"],
    FORBID_TAGS: ["script", "foreignObject", "iframe", "embed", "object"],
  });

  // Bỏ thẻ wrapper giả lập nếu đầu vào ban đầu là fragment
  if (isFragment) {
    cleaned = cleaned.replace(/^<svg[^>]*>/i, "").replace(/<\/svg>$/i, "");
  }

  return cleaned.trim();
}
