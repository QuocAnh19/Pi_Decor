#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * scripts/generate-notice.mjs
 * ───────────────────────────
 * Tự động tạo tệp NOTICE ở thư mục gốc liệt kê các thông báo bản quyền bắt buộc
 * của toàn bộ các thư viện bên thứ ba sử dụng trong môi trường production (apps/web & apps/api).
 * Đáp ứng điều khoản ghi nhận của các giấy phép MIT, Apache-2.0, BSD, ISC, OFL-1.1...
 */

console.log("[notice] Đang thu thập thông tin bản quyền các thư viện production...");

const lockPath = "package-lock.json";
if (!existsSync(lockPath)) {
  console.error("✗ Không tìm thấy package-lock.json");
  process.exit(1);
}

const lock = JSON.parse(readFileSync(lockPath, "utf8"));

function getDirectDependencies(manifestPath) {
  if (!existsSync(manifestPath)) return [];
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return Object.keys(manifest.dependencies || {}).filter(
    (name) => name !== "@pidecor/shared"
  );
}

function collectAllProductionDeps() {
  const prodDeps = new Set();
  const queue = [
    ...getDirectDependencies("apps/web/package.json"),
    ...getDirectDependencies("apps/api/package.json"),
    ...getDirectDependencies("packages/shared/package.json"),
  ];

  while (queue.length > 0) {
    const depName = queue.shift();
    if (prodDeps.has(depName)) continue;
    prodDeps.add(depName);

    const key = `node_modules/${depName}`;
    const pkgData = lock.packages?.[key];
    if (pkgData?.dependencies) {
      for (const child of Object.keys(pkgData.dependencies)) {
        queue.push(child);
      }
    }
  }

  return Array.from(prodDeps).sort();
}

const candidateDirs = (dep) => [
  join("node_modules", dep),
  join("apps/web/node_modules", dep),
  join("apps/api/node_modules", dep),
];

const LICENSE_FILENAMES = [
  "LICENSE",
  "LICENSE.md",
  "LICENSE.txt",
  "LICENCE",
  "license",
  "license.md",
  "license.txt",
  "NOTICE",
  "NOTICE.md",
];

function findPackageInfo(dep) {
  let pkgJson = null;
  let licenseText = "";
  let licenseFilePath = null;

  for (const dir of candidateDirs(dep)) {
    const jsonPath = join(dir, "package.json");
    if (!pkgJson && existsSync(jsonPath)) {
      try {
        pkgJson = JSON.parse(readFileSync(jsonPath, "utf8"));
      } catch {
        // bỏ qua
      }
    }
    if (!licenseFilePath) {
      for (const lf of LICENSE_FILENAMES) {
        const lp = join(dir, lf);
        if (existsSync(lp)) {
          licenseFilePath = lp;
          try {
            licenseText = readFileSync(lp, "utf8").trim();
          } catch {
            // bỏ qua
          }
          break;
        }
      }
    }
    if (pkgJson && licenseFilePath) break;
  }

  return { pkgJson, licenseText, licenseFilePath };
}

function formatAuthor(author) {
  if (!author) return "";
  if (typeof author === "string") return author;
  let res = author.name || "";
  if (author.email) res += ` <${author.email}>`;
  if (author.url) res += ` (${author.url})`;
  return res.trim();
}

function formatLicenseName(pkgJson) {
  if (!pkgJson) return "UNKNOWN";
  if (typeof pkgJson.license === "string") return pkgJson.license;
  if (pkgJson.license?.type) return pkgJson.license.type;
  if (Array.isArray(pkgJson.licenses)) {
    return pkgJson.licenses.map((l) => (typeof l === "string" ? l : l.type || "")).filter(Boolean).join(" OR ");
  }
  return "UNKNOWN";
}

function formatRepository(pkgJson) {
  if (!pkgJson?.repository) return "";
  if (typeof pkgJson.repository === "string") return pkgJson.repository;
  return pkgJson.repository.url || "";
}

const prodList = collectAllProductionDeps();
const noticeSections = [];
const licenseStats = {};

for (const dep of prodList) {
  const { pkgJson, licenseText } = findPackageInfo(dep);
  const version = pkgJson?.version || lock.packages?.[`node_modules/${dep}`]?.version || "";
  const licenseName = formatLicenseName(pkgJson);
  const author = formatAuthor(pkgJson?.author);
  const repo = formatRepository(pkgJson);

  licenseStats[licenseName] = (licenseStats[licenseName] || 0) + 1;

  let body = "";
  if (licenseText) {
    body = licenseText;
  } else if (author) {
    body = `Copyright (c) ${author}\nLicensed under the ${licenseName} license.`;
  } else {
    body = `Licensed under the ${licenseName} license.`;
  }

  const section = [
    "--------------------------------------------------------------------------------",
    `Package:    ${dep}@${version}`,
    `License:    ${licenseName}`,
    author ? `Author:     ${author}` : null,
    repo ? `Repository: ${repo}` : null,
    "--------------------------------------------------------------------------------",
    body,
  ]
    .filter((line) => line !== null)
    .join("\n");

  noticeSections.push(section);
}

const header = [
  "================================================================================",
  "Pi Decor — Third-Party Software Notices and Information",
  "================================================================================",
  "This product includes software components developed by third parties and",
  "licensed under permissive open-source licenses, including MIT, Apache-2.0,",
  "BSD-2-Clause, BSD-3-Clause, ISC, OFL-1.1, and others.",
  "",
  "The following acknowledgments, copyright notices, and license terms are",
  "provided in compliance with the respective open-source license agreements.",
  "",
  "Summary of Production Dependency Licenses:",
  ...Object.entries(licenseStats)
    .sort((a, b) => b[1] - a[1])
    .map(([lic, count]) => `  - ${lic}: ${count} package(s)`),
  "",
  "================================================================================",
  "",
].join("\n");

const finalNoticeContent = header + noticeSections.join("\n\n") + "\n";
writeFileSync("NOTICE", finalNoticeContent, "utf8");

console.log(`✓ Đã tạo thành công tệp NOTICE với ${prodList.length} thư viện sản xuất.`);
