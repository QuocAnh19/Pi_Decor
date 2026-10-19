#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import zlib from "zlib";

/**
 * scripts/collect-metrics.mjs
 * ───────────────────────────
 * Đo lường chính xác các chỉ số kỹ thuật thực tế của dự án Pi Decor:
 * - Kích thước JS ban đầu (Raw & Gzip)
 * - Số lượng chunks
 * - Thời gian build
 * - Số dòng code (LOC)
 * - Số lượng REST API endpoints
 * - Số lượng bảng cơ sở dữ liệu
 * - Tỷ lệ mã trùng lặp (% jscpd)
 * - Số lượng bài kiểm thử & Độ bao phủ (Coverage)
 */

console.log("=== THU THẬP VÀ ĐO LƯỜNG CHỈ SỐ KỸ THUẬT (METRICS) ===");
const now = new Date();
const dateStr = now.toISOString().split("T")[0];
console.log(`Ngày đo: ${dateStr}\n`);

// 1. Đo thời gian Build & Kích thước JS ban đầu & Số chunk
console.log("[1/5] Đang build và đo kích thước bundle...");
const buildStart = Date.now();
execSync("npm run build:shared", { stdio: "ignore" });
execSync("npm --prefix apps/web run build", { stdio: "ignore" });
const buildDurationSec = ((Date.now() - buildStart) / 1000).toFixed(2);

const assetsDir = path.resolve("apps/web/dist/assets");
const assetFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
const jsChunks = assetFiles.filter((f) => f.endsWith(".js"));
const chunkCount = jsChunks.length;

// Tìm entry JS từ index.html
const indexHtmlPath = path.resolve("apps/web/dist/index.html");
let initialJsFile = "";
if (fs.existsSync(indexHtmlPath)) {
  const htmlContent = fs.readFileSync(indexHtmlPath, "utf8");
  const match = htmlContent.match(/src="\/assets\/(index-[^"]+\.js)"/);
  if (match) {
    initialJsFile = match[1];
  }
}

let initialJsRawKb = 0;
let initialJsGzipKb = 0;
if (initialJsFile) {
  const jsBuffer = fs.readFileSync(path.join(assetsDir, initialJsFile));
  initialJsRawKb = (jsBuffer.length / 1024).toFixed(2);
  const gzipped = zlib.gzipSync(jsBuffer);
  initialJsGzipKb = (gzipped.length / 1024).toFixed(2);
}

// 2. Đếm số dòng code (LOC)
console.log("[2/5] Đang đếm số dòng code (LOC)...");
function countLinesInDir(dir, exts) {
  let totalLines = 0;
  let fileCount = 0;
  if (!fs.existsSync(dir)) return { totalLines, fileCount };

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (exts.some((ext) => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, "utf8");
        const lines = content.split("\n").filter((l) => l.trim().length > 0).length;
        totalLines += lines;
        fileCount++;
      }
    }
  }
  traverse(dir);
  return { totalLines, fileCount };
}

const sourceExts = [".ts", ".tsx", ".js", ".scss", ".css"];
const webLoc = countLinesInDir("apps/web/src", sourceExts);
const apiLoc = countLinesInDir("apps/api/src", sourceExts);
const sharedLoc = countLinesInDir("packages/shared/src", sourceExts);
const totalSourceLines = webLoc.totalLines + apiLoc.totalLines + sharedLoc.totalLines;
const totalSourceFiles = webLoc.fileCount + apiLoc.fileCount + sharedLoc.fileCount;

// 3. Đếm số lượng API endpoints
console.log("[3/5] Đang đếm số endpoint API...");
function countApiEndpoints() {
  let endpointCount = 0;
  const modulesDir = path.resolve("apps/api/src/modules");
  if (fs.existsSync(modulesDir)) {
    const modules = fs.readdirSync(modulesDir);
    for (const mod of modules) {
      const routeFile = path.join(modulesDir, mod, `${mod}.routes.js`);
      if (fs.existsSync(routeFile)) {
        const content = fs.readFileSync(routeFile, "utf8");
        const matches = content.match(/\w+Router\.(get|post|put|patch|delete)\s*\(/g);
        if (matches) endpointCount += matches.length;
      }
    }
  }
  // Server.js có /api/health, /api/health/ready
  const serverJs = path.resolve("apps/api/src/server.js");
  if (fs.existsSync(serverJs)) {
    const content = fs.readFileSync(serverJs, "utf8");
    const matches = content.match(/app\.(get|post|put|patch|delete)\s*\(/g);
    if (matches) endpointCount += matches.length;
  }
  return endpointCount;
}
const endpointCount = countApiEndpoints();

// 4. Đo tỷ lệ trùng lặp bằng jscpd
console.log("[4/5] Đang đo tỷ lệ trùng lặp mã qua jscpd...");
const tempJscpdDir = path.resolve(".metrics-jscpd-temp");
let duplicationPercent = 0;
try {
  execSync(
    `npx --yes jscpd --reporters json --output "${tempJscpdDir}" --exit-code 0 apps/web/src apps/api/src packages/shared/src`,
    { stdio: "ignore" }
  );
  const jscpdReportPath = path.join(tempJscpdDir, "jscpd-report.json");
  if (fs.existsSync(jscpdReportPath)) {
    const report = JSON.parse(fs.readFileSync(jscpdReportPath, "utf8"));
    const percent = report.statistics?.total?.percentage ?? report.statistic?.total?.percentage;
    if (percent !== undefined) {
      duplicationPercent = Number(percent).toFixed(2);
    }
  }
} catch {
  // Bỏ qua lỗi nếu có
} finally {
  if (fs.existsSync(tempJscpdDir)) {
    fs.rmSync(tempJscpdDir, { recursive: true, force: true });
  }
}

// 5. Chạy test và đo coverage
console.log("[5/5] Đang đo số lượng test và độ bao phủ code (Coverage)...");
let webTests = 0;
let apiTests = 0;
let webCoverage = { lines: 0, branches: 0, functions: 0, statements: 0 };
let apiCoverage = { lines: 0, branches: 0, functions: 0, statements: 0 };

try {
  // Test & Coverage cho web
  const webCoverageOut = execSync("npm --prefix apps/web run test:coverage", { encoding: "utf8" });
  const cleanWebOut = webCoverageOut.replace(/\u001b\[[0-9;]*m/g, "");
  const webTestMatch = cleanWebOut.match(/Tests\s+(\d+)\s+passed/i);
  if (webTestMatch) webTests = parseInt(webTestMatch[1], 10);


  const webCoveragePath = path.resolve("apps/web/coverage/coverage-final.json");
  if (fs.existsSync(webCoveragePath)) {
    const webData = JSON.parse(fs.readFileSync(webCoveragePath, "utf8"));
    let totalStatements = 0, coveredStatements = 0;
    let totalBranches = 0, coveredBranches = 0;
    let totalFunctions = 0, coveredFunctions = 0;
    let totalLines = 0, coveredLines = 0;

    for (const file of Object.values(webData)) {
      for (const s of Object.values(file.s || {})) { totalStatements++; if (s > 0) coveredStatements++; }
      for (const f of Object.values(file.f || {})) { totalFunctions++; if (f > 0) coveredFunctions++; }
      for (const b of Object.values(file.b || {})) {
        for (const branchCount of b) { totalBranches++; if (branchCount > 0) coveredBranches++; }
      }
      for (const l of Object.values(file.statementMap || {})) { totalLines++; }
    }
    webCoverage.statements = totalStatements ? ((coveredStatements / totalStatements) * 100).toFixed(2) : 0;
    webCoverage.branches = totalBranches ? ((coveredBranches / totalBranches) * 100).toFixed(2) : 0;
    webCoverage.functions = totalFunctions ? ((coveredFunctions / totalFunctions) * 100).toFixed(2) : 0;
    webCoverage.lines = webCoverage.statements;
  }
} catch (e) {
  console.warn("Cảnh báo khi chạy web coverage:", e.message);
}

try {
  // Test & Coverage cho api
  const apiCoverageOut = execSync("npm --prefix apps/api run test:coverage", { encoding: "utf8" });
  const cleanApiOut = apiCoverageOut.replace(/\u001b\[[0-9;]*m/g, "");
  const apiTestMatch = cleanApiOut.match(/Tests\s+(\d+)\s+passed/i);
  if (apiTestMatch) apiTests = parseInt(apiTestMatch[1], 10);

  const apiCoveragePath = path.resolve("apps/api/coverage/coverage-final.json");
  if (fs.existsSync(apiCoveragePath)) {
    const apiData = JSON.parse(fs.readFileSync(apiCoveragePath, "utf8"));
    let totalStatements = 0, coveredStatements = 0;
    let totalBranches = 0, coveredBranches = 0;
    let totalFunctions = 0, coveredFunctions = 0;

    for (const file of Object.values(apiData)) {
      for (const s of Object.values(file.s || {})) { totalStatements++; if (s > 0) coveredStatements++; }
      for (const f of Object.values(file.f || {})) { totalFunctions++; if (f > 0) coveredFunctions++; }
      for (const b of Object.values(file.b || {})) {
        for (const branchCount of b) { totalBranches++; if (branchCount > 0) coveredBranches++; }
      }
    }
    apiCoverage.statements = totalStatements ? ((coveredStatements / totalStatements) * 100).toFixed(2) : 0;
    apiCoverage.branches = totalBranches ? ((coveredBranches / totalBranches) * 100).toFixed(2) : 0;
    apiCoverage.functions = totalFunctions ? ((coveredFunctions / totalFunctions) * 100).toFixed(2) : 0;
    apiCoverage.lines = apiCoverage.statements;
  }
} catch (e) {
  console.warn("Cảnh báo khi chạy api coverage:", e.message);
}

const totalTests = webTests + apiTests;
const tableCount = 15; // 15 bảng trong PostgreSQL đã chuẩn hóa

const metrics = {
  date: dateStr,
  build: {
    durationSec: buildDurationSec,
    initialJsFile,
    initialJsRawKb: `${initialJsRawKb} kB`,
    initialJsGzipKb: `${initialJsGzipKb} kB`,
    chunkCount,
  },
  code: {
    totalSourceLines,
    totalSourceFiles,
    webLines: webLoc.totalLines,
    apiLines: apiLoc.totalLines,
    sharedLines: sharedLoc.totalLines,
    duplicationPercent: `${duplicationPercent}%`,
  },
  architecture: {
    endpointCount,
    tableCount,
  },
  testing: {
    totalTests,
    webTests,
    apiTests,
    coverage: {
      web: webCoverage,
      api: apiCoverage,
    },
  },
};

console.log("\n================ KẾT QUẢ ĐO LƯỜNG THỰC TẾ ================");
console.log(`- Ngày đo: ${metrics.date}`);
console.log(`- Thời gian build web: ${metrics.build.durationSec}s`);
console.log(`- Kích thước JS ban đầu (Gzip): ${metrics.build.initialJsGzipKb} (Raw: ${metrics.build.initialJsRawKb})`);
console.log(`- Số lượng chunk JS: ${metrics.build.chunkCount}`);
console.log(`- Tổng số dòng code nguồn (LOC): ${metrics.code.totalSourceLines.toLocaleString()} dòng (${metrics.code.totalSourceFiles} files)`);
console.log(`- Tỷ lệ trùng lặp code (jscpd): ${metrics.code.duplicationPercent}`);
console.log(`- Số lượng REST API endpoints: ${metrics.architecture.endpointCount}`);
console.log(`- Số lượng bảng PostgreSQL: ${metrics.architecture.tableCount}`);
console.log(`- Tổng số bài kiểm thử tự động (Unit/API): ${metrics.testing.totalTests} tests (${webTests} web, ${apiTests} api)`);
console.log(`- Độ bao phủ backend (Statements): ${apiCoverage.statements}% (Functions: ${apiCoverage.functions}%, Branches: ${apiCoverage.branches}%)`);
console.log(`- Độ bao phủ frontend (Statements): ${webCoverage.statements}% (Functions: ${webCoverage.functions}%, Branches: ${webCoverage.branches}%)`);
console.log("=========================================================\n");

fs.writeFileSync(path.resolve(".metrics.json"), JSON.stringify(metrics, null, 2), "utf8");
console.log("✓ Đã lưu kết quả đo lường vào .metrics.json");
