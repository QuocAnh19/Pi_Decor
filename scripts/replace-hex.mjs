import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientSrcDir = path.join(rootDir, "client", "src");
const todoFile = path.join(rootDir, "docs", "TOKENS_TODO.md");

// Bảng ánh xạ giá trị hex chuẩn (chữ thường 6 ký tự) -> tên biến CSS
const HEX_TO_TOKEN = {
  "#ffffff": "--color-surface",
  "#0b1120": "--color-surface-dark",
  "#fbf7f1": "--color-paper",
  "#f4eee3": "--color-paper-dim",
  "#271620": "--color-ink",
  "#6e6259": "--color-ink-muted",
  "#9c9186": "--color-ink-faint",
  "#e7ded0": "--color-line",
  "#a15c2e": "--color-accent",
  "#874c25": "--color-accent-hover",
  "#f1e4d8": "--color-accent-subtle",
  "#f8e9e7": "--color-blush",
  "#f1dedb": "--color-blush-dim",
  "#3b141f": "--color-plum",
  "#5c2433": "--color-plum-light",
  "#e7b6bb": "--color-material-rose",
  "#afc49c": "--color-material-sage",
  "#c99f6f": "--color-material-sand",
  "#b98ac9": "--color-material-lavender",
  "#e7be79": "--color-material-champagne",
  "#8a9bae": "--color-material-smoke",
  "#e59a6b": "--color-kids-accent",
  "#f6ddc6": "--color-kids-accent-dim",
  "#4f6b63": "--color-event-accent",
  "#dbe6e0": "--color-event-accent-dim",
  "#b4586b": "--color-danger",
  "#f7e4e6": "--color-danger-subtle",
  "#6e8f5c": "--color-success",
  "#e7eee1": "--color-success-subtle",
  "#b98a3e": "--color-warning",
  "#f5ead6": "--color-warning-subtle",
};

function normalizeHex(hex) {
  let clean = hex.toLowerCase();
  if (clean.length === 4) {
    clean = "#" + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
  }
  return clean;
}

function findModuleScssFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findModuleScssFiles(fullPath));
    } else if (entry.name.endsWith(".module.scss")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = findModuleScssFiles(clientSrcDir);
let totalHexCountBefore = 0;
let replacedCount = 0;
const unmatchedList = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  const lines = content.split(/\r?\n/);
  let fileModified = false;

  const newLines = lines.map((line, idx) => {
    const lineNum = idx + 1;
    // Bỏ qua dòng comment thuần túy
    if (line.trim().startsWith("//")) return line;

    // Tách phần code và phần comment phía sau nếu có
    const commentIdx = line.indexOf("//");
    let codePart = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx !== -1 ? line.slice(commentIdx) : "";

    // Tìm tất cả mã hex trong codePart
    const matches = [...codePart.matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)];
    if (matches.length === 0) return line;

    totalHexCountBefore += matches.length;

    for (const match of matches) {
      const rawHex = match[0];
      const normHex = normalizeHex(rawHex);

      if (HEX_TO_TOKEN[normHex]) {
        const tokenVar = `var(${HEX_TO_TOKEN[normHex]})`;
        // Thay thế chính xác mã hex đó
        codePart = codePart.replaceAll(rawHex, tokenVar);
        replacedCount++;
        fileModified = true;
      } else {
        unmatchedList.push({
          file: relPath,
          line: lineNum,
          raw: rawHex,
          norm: normHex,
          context: line.trim(),
        });
      }
    }

    return codePart + commentPart;
  });

  if (fileModified) {
    fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
  }
}

// Ghi danh sách chưa khớp ra docs/TOKENS_TODO.md
let todoContent = `# Các mã Hex viết cứng chưa khớp Token chuẩn (\`docs/TOKENS_TODO.md\`)\n\n`;
todoContent += `Tài liệu này được tự động tạo bởi \`scripts/replace-hex.mjs\`.\n`;
todoContent += `Tổng số vị trí chưa khớp: **${unmatchedList.length}**.\n\n`;
todoContent += `| File & Dòng | Mã Hex | Bối cảnh mã nguồn |\n`;
todoContent += `| :--- | :--- | :--- |\n`;

for (const item of unmatchedList) {
  const escapedContext = item.context.replace(/\|/g, "\\|");
  todoContent += `| \`${item.file}:${item.line}\` | \`${item.raw}\` | \`${escapedContext}\` |\n`;
}

fs.writeFileSync(todoFile, todoContent, "utf8");

console.log("=== BÁO CÁO THAY THẾ MÃ HEX ===");
console.log(`- Tổng số mã hex ban đầu trong *.module.scss: ${totalHexCountBefore}`);
console.log(`- Số mã hex đã được thay thế bằng var(--token): ${replacedCount}`);
console.log(`- Số mã hex còn lại (không khớp, đã ghi vào docs/TOKENS_TODO.md): ${unmatchedList.length}`);
