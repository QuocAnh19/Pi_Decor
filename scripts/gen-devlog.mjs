import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

export function generateDevlog() {
  console.log("[gen-devlog] Đang đọc lịch sử commit từ git log...");
  const rawLog = execSync('git log --format="%cd|%h|%s" --date=short', {
    cwd: rootDir,
    encoding: "utf-8",
  });

  const lines = rawLog.trim().split("\n").filter(Boolean);
  const commitsByDate = new Map();

  for (const line of lines) {
    const parts = line.split("|");
    const date = parts[0];
    const hash = parts[1];
    const subject = parts.slice(2).join("|");

    if (!commitsByDate.has(date)) {
      commitsByDate.set(date, []);
    }
    commitsByDate.get(date).push({ hash, subject });
  }

  const outputLines = [
    "# Nhật Ký Phát Triển Pi Decor (DEVLOG.md)",
    "",
    "> Khung nhật ký phát triển được sinh tự động từ lịch sử commit Git thông qua script `node scripts/gen-devlog.mjs`.",
    "> Mỗi ngày bao gồm danh sách các commit thực tế kèm mục trống để chủ dự án bổ sung lý do nghiệp vụ, thách thức và quyết định.",
    "",
    "## Mục Lục Ngày Phát Triển",
    "",
  ];

  for (const date of commitsByDate.keys()) {
    outputLines.push(`- [${date}](#${date.replace(/-/g, "")}) — ${commitsByDate.get(date).length} commit(s)`);
  }

  outputLines.push("", "---", "");

  for (const [date, commits] of commitsByDate.entries()) {
    const anchor = date.replace(/-/g, "");
    outputLines.push(`### <a id="${anchor}"></a>${date}`);
    outputLines.push("");
    outputLines.push("#### Danh sách commit");
    for (const c of commits) {
      // Escape ký tự markdown nhạy cảm trong subject nếu có
      const cleanSubject = c.subject.replace(/([\\`*_])/g, "\\$1");
      outputLines.push(`- [\`${c.hash}\`](https://github.com/QuocAnh19/Pi_Decor/commit/${c.hash}) — ${cleanSubject}`);
    }
    outputLines.push("");
    outputLines.push("#### Ghi chú / Lý do / Khó khăn (Chủ dự án ghi chú)");
    outputLines.push("<!-- [Chủ dự án điền ghi chú bối cảnh, lý do kỹ thuật hoặc khó khăn gặp phải trong ngày này] -->");
    outputLines.push("");
    outputLines.push("---");
    outputLines.push("");
  }

  const targetFile = path.join(rootDir, "docs", "DEVLOG.md");
  fs.writeFileSync(targetFile, outputLines.join("\n"), "utf-8");
  console.log(`[gen-devlog] ✓ Đã sinh thành công ${targetFile} (${commitsByDate.size} ngày).`);
}

// Chạy trực tiếp qua CLI
const isDirectCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectCli) {
  try {
    generateDevlog();
    process.exit(0);
  } catch (err) {
    console.error("[gen-devlog] Lỗi khi sinh devlog:", err);
    process.exit(1);
  }
}
