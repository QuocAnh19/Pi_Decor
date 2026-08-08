/**
 * Server-side SVG Sanitizer to protect against Stored XSS attacks before storing
 * template background SVGs or asset SVGs in the database.
 */
export function sanitizeSvg(svgString) {
  if (typeof svgString !== "string") return "";

  let cleaned = svgString;

  // 1. Remove <script> tags and inner content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Remove inline event handlers (onload, onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 3. Neutralize javascript: URLs
  cleaned = cleaned.replace(/(href|xlink:href)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1="#"');

  // 4. Remove dangerous tags like foreignObject
  cleaned = cleaned.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "");

  return cleaned.trim();
}
