#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, resolve } from "path";

/**
 * scripts/check-doc-links.mjs
 * ───────────────────────────
 * Kiểm tra tính toàn vẹn của tài liệu:
 * 1. Các liên kết tương đối giữa các tệp markdown [nhãn](duong-dan).
 * 2. Các đường dẫn tệp/thư mục mã nguồn được nhắc đến trong dấu backtick `path/to/file`.
 * Báo lỗi và dừng với exit code 1 nếu phát hiện liên kết hỏng.
 */

console.log("[docs] Đang kiểm tra liên kết và đường dẫn trong toàn bộ tài liệu...");

function getAllMarkdownFiles(dir) {
  let results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllMarkdownFiles(fullPath));
    } else if (entry.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

const docsFiles = getAllMarkdownFiles("docs");
// Thêm cả các tài liệu chuẩn ở root
for (const rootDoc of [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CHANGELOG.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
]) {
  if (existsSync(rootDoc)) {
    docsFiles.push(rootDoc);
  }
}

let hasError = false;
let checkedLinksCount = 0;
let checkedCodePathsCount = 0;

for (const docFile of docsFiles) {
  const content = readFileSync(docFile, "utf8");
  const docDir = dirname(docFile);

  // 1. Kiểm tra markdown links: [label](target)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawTarget = match[2].trim();

    // Bỏ qua external links, mailto, anchor nội bộ
    if (
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("#") ||
      rawTarget.startsWith("conversation://") ||
      rawTarget.startsWith("file:///")
    ) {
      continue;
    }

    // Loại bỏ anchor hash nếu có (ví dụ: file.md#section)
    const targetFilePart = rawTarget.split("#")[0];
    if (!targetFilePart) continue;

    checkedLinksCount++;
    const resolvedPath = resolve(docDir, targetFilePart);
    if (!existsSync(resolvedPath)) {
      console.error(
        `✗ [Lỗi Liên Kết] Trong ${docFile}: Liên kết tới '${rawTarget}' không tồn tại trên đĩa!`
      );
      hasError = true;
    }
  }

  // 2. Kiểm tra các đường dẫn tệp/thư mục mã nguồn trong dấu `
  const codeRegex = /`([^`\n]+)`/g;
  while ((match = codeRegex.exec(content)) !== null) {
    const code = match[1].trim();

    // Chỉ kiểm tra các chuỗi có hình dạng đường dẫn tệp trong repo
    const isRepoPath =
      code.startsWith("apps/") ||
      code.startsWith("packages/") ||
      code.startsWith("docs/") ||
      code.startsWith(".github/") ||
      code.startsWith("scripts/") ||
      code.startsWith("database/");

    if (!isRepoPath) continue;

    // Bỏ qua tên nhánh mẫu trong quy ước đặt tên nhánh
    if (
      code.startsWith("feat/") ||
      code.startsWith("fix/") ||
      code.startsWith("refactor/") ||
      code.startsWith("chore/") ||
      code === "docs/api-guide"
    ) {
      continue;
    }

    // Bỏ qua placeholder có chứa ký tự đại diện (*), tham số động hoặc regex
    if (
      code.includes("*") ||
      code.includes("<") ||
      code.includes(">") ||
      code.includes("...") ||
      code.includes("$") ||
      code.includes(":")
    ) {
      continue;
    }

    // Chuẩn hóa bỏ dấu gạch chéo cuối nếu có (thư mục)
    const cleanPath = code.endsWith("/") ? code.slice(0, -1) : code;

    checkedCodePathsCount++;
    if (!existsSync(cleanPath)) {
      console.error(
        `✗ [Lỗi Đường Dẫn Mã Nguồn] Trong ${docFile}: Đường dẫn '${code}' không tồn tại trong repository!`
      );
      hasError = true;
    }
  }
}

console.log(
  `✓ Đã kiểm tra ${checkedLinksCount} liên kết markdown và ${checkedCodePathsCount} đường dẫn mã nguồn qua ${docsFiles.length} tệp tài liệu.`
);

if (hasError) {
  console.error("✗ Phát hiện liên kết hoặc đường dẫn hỏng trong tài liệu. Vui lòng khắc phục!");
  process.exit(1);
} else {
  console.log("✓ Toàn bộ liên kết và đường dẫn tài liệu đều hợp lệ!");
}
