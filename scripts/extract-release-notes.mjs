#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";

/**
 * scripts/extract-release-notes.mjs
 * ─────────────────────────────────
 * Trích xuất ghi chú phát hành từ CHANGELOG.md cho phiên bản (tag) tương ứng.
 * Được dùng trong workflow .github/workflows/release.yml.
 */

const tag = process.argv[2] || process.env.TAG_NAME || "";
const outputFile = process.argv[3] || "RELEASE_NOTES.md";

if (!tag) {
  console.error("✗ Thiếu tham số tag (ví dụ: v1.0.0)");
  process.exit(1);
}

const version = tag.replace(/^v/, "");
const changelog = readFileSync("CHANGELOG.md", "utf8");
const lines = changelog.split(/\r?\n/);

let inSection = false;
const sectionLines = [];
const targetHeader1 = `## [${version}]`;
const targetHeader2 = `## [v${version}]`;

for (const line of lines) {
  if (line.startsWith(targetHeader1) || line.startsWith(targetHeader2)) {
    inSection = true;
    continue;
  }
  if (inSection) {
    if (line.startsWith("## [")) {
      break;
    }
    sectionLines.push(line);
  }
}

const extracted = sectionLines.join("\n").trim();
const notes = extracted.length > 0
  ? extracted
  : `Bản phát hành chính thức ${tag} của hệ thống Pi Decor.`;

writeFileSync(outputFile, notes + "\n", "utf8");
console.log(`✓ Đã trích xuất release notes cho ${tag} -> ${outputFile}`);
