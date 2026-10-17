#!/usr/bin/env node
/**
 * Script kiểm tra mức độ sẵn sàng triển khai sản phẩm (Launch Readiness Gate).
 * 
 * Kiểm tra:
 *   (a) Mọi biến VITE_BUSINESS_* bắt buộc đã được khai báo.
 *   (b) Bản build web (apps/web/dist) không còn chuỗi "[TODO" hay "[chưa cấu hình]".
 *   (c) VITE_PRIVACY_POLICY_REVIEWED=true (đã rà soát pháp lý chính sách bảo mật).
 *   (d) Nếu LICENSE/LICENSE.md đã có thì không còn placeholder "<TÊN CHỦ SỞ HỮU>".
 *   (e) VITE_API_URL không trỏ về localhost.
 * 
 * Cờ hỗ trợ:
 *   --soft: Chỉ in cảnh báo, không thoát lỗi mã 1 (dùng cho CI / staging).
 *   --strict: Thoát mã 1 nếu phát hiện bất kỳ cảnh báo/lỗi nào (dùng trước production release).
 * 
 * Tuyệt đối không in giá trị bí mật ra console.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const args = process.argv.slice(2);
const isStrict = args.includes("--strict");
const isSoft = args.includes("--soft");

// Nạp các biến môi trường từ apps/web/.env nếu chưa có trong process.env
function loadWebEnv() {
  const envMap = { ...process.env };
  const envPaths = [resolve("apps/web/.env"), resolve(".env")];
  for (const p of envPaths) {
    if (existsSync(p)) {
      try {
        const content = readFileSync(p, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!envMap[key]) {
              envMap[key] = val;
            }
          }
        }
      } catch {
        // bỏ qua nếu lỗi đọc file
      }
    }
  }
  return envMap;
}

const env = loadWebEnv();

const REQUIRED_BUSINESS_VARS = [
  "VITE_BUSINESS_NAME",
  "VITE_BUSINESS_TELEPHONE",
  "VITE_BUSINESS_EMAIL",
  "VITE_BUSINESS_STREET_ADDRESS",
  "VITE_BUSINESS_LOCALITY",
  "VITE_BUSINESS_REGION",
  "VITE_BUSINESS_COUNTRY",
  "VITE_BUSINESS_OPENING_HOURS",
  "VITE_BUSINESS_DATA_PROTECTION_EMAIL",
];

const failures = [];
const passes = [];

console.log("\n==================================================================");
console.log("       PI DECOR — LAUNCH READINESS VERIFICATION GATE");
console.log(`       Chế độ: ${isStrict ? "🔴 STRICT (Production Gate)" : "🟡 SOFT (Warning Only)"}`);
console.log("==================================================================\n");

// 1. (a) Kiểm tra các biến VITE_BUSINESS_* bắt buộc
console.log("1. Kiểm tra biến môi trường doanh nghiệp (VITE_BUSINESS_*):");
const missingVars = [];
for (const varName of REQUIRED_BUSINESS_VARS) {
  const val = env[varName];
  if (!val || !val.trim()) {
    missingVars.push(varName);
  }
}
if (missingVars.length === 0) {
  passes.push("(a) Đầy đủ các biến VITE_BUSINESS_* bắt buộc.");
  console.log("  ✓ Toàn bộ các biến VITE_BUSINESS_* đã được cấu hình hợp lệ.");
} else {
  const msg = `(a) Thiếu ${missingVars.length} biến VITE_BUSINESS_* bắt buộc: ${missingVars.join(", ")}`;
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

// 2. (b) Kiểm tra bản build web không còn "[TODO" hay "[chưa cấu hình]"
console.log("\n2. Kiểm tra bản build tĩnh web (apps/web/dist):");
const distDir = resolve("apps/web/dist");
if (!existsSync(distDir)) {
  failures.push("(b) Thư mục apps/web/dist chưa tồn tại (cần chạy build trước).");
  console.log("  ✗ apps/web/dist chưa tồn tại. Vui lòng chạy build web trước khi kiểm tra.");
} else {
  const forbiddenPatterns = ["[TODO", "[chưa cấu hình]"];
  const matchedFiles = [];

  function scanDir(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(js|html|css|json)$/i.test(entry)) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          for (const pat of forbiddenPatterns) {
            if (content.includes(pat)) {
              matchedFiles.push({ file: fullPath, pattern: pat });
            }
          }
        } catch {
          // bỏ qua lỗi file nhị phân
        }
      }
    }
  }

  scanDir(distDir);

  if (matchedFiles.length === 0) {
    passes.push("(b) Bản build không chứa chuỗi cấm [TODO hoặc [chưa cấu hình].");
    console.log("  ✓ Bản build sạch, không chứa chuỗi [TODO hoặc [chưa cấu hình].");
  } else {
    const sample = matchedFiles.map((m) => `[${m.pattern}] tại ${m.file}`).join("; ");
    const msg = `(b) Bản build chứa ${matchedFiles.length} vị trí placeholder: ${sample}`;
    failures.push(msg);
    console.log(`  ✗ ${msg}`);
  }
}

// 3. (c) Kiểm tra VITE_PRIVACY_POLICY_REVIEWED
console.log("\n3. Kiểm tra rà soát pháp lý chính sách bảo mật:");
const privacyReviewed = (env.VITE_PRIVACY_POLICY_REVIEWED || "").toLowerCase() === "true";
if (privacyReviewed) {
  passes.push("(c) VITE_PRIVACY_POLICY_REVIEWED=true.");
  console.log("  ✓ Chính sách bảo mật đã được xác nhận rà soát pháp lý (VITE_PRIVACY_POLICY_REVIEWED=true).");
} else {
  const msg = "(c) VITE_PRIVACY_POLICY_REVIEWED chưa bật 'true' (Chính sách bảo mật vẫn ở dạng bản nháp).";
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}

// 4. (d) Kiểm tra LICENSE không còn placeholder "<TÊN CHỦ SỞ HỮU>"
console.log("\n4. Kiểm tra placeholder trong tệp bản quyền (LICENSE):");
const licenseFiles = ["LICENSE", "LICENSE.md", "LICENSE.txt"];
let foundLicense = false;
let licenseHasPlaceholder = false;

for (const lf of licenseFiles) {
  const p = resolve(lf);
  if (existsSync(p)) {
    foundLicense = true;
    const content = readFileSync(p, "utf-8");
    if (content.includes("<TÊN CHỦ SỞ HỮU>") || content.includes("<TEN CHU SO HUU>")) {
      licenseHasPlaceholder = true;
    }
  }
}

if (!foundLicense) {
  passes.push("(d) Chưa có tệp LICENSE, bỏ qua kiểm tra placeholder.");
  console.log("  - Chưa có tệp LICENSE ở thư mục gốc (bỏ qua).");
} else if (licenseHasPlaceholder) {
  const msg = "(d) Tệp LICENSE chứa placeholder '<TÊN CHỦ SỞ HỮU>' chưa được thay thế.";
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
} else {
  passes.push("(d) Tệp LICENSE hợp lệ, không chứa placeholder.");
  console.log("  ✓ Tệp LICENSE hợp lệ, không chứa placeholder.");
}

// 5. (e) Kiểm tra VITE_API_URL không trỏ về localhost
console.log("\n5. Kiểm tra địa chỉ API Production (VITE_API_URL):");
const apiUrl = env.VITE_API_URL || "";
if (!apiUrl) {
  const msg = "(e) VITE_API_URL chưa được cấu hình.";
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
} else if (/localhost|127\.0\.0\.1/i.test(apiUrl)) {
  const msg = "(e) VITE_API_URL đang trỏ về máy chủ cục bộ (localhost/127.0.0.1). Cần đổi sang domain production.";
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
} else {
  passes.push("(e) VITE_API_URL hợp lệ, không trỏ localhost.");
  console.log("  ✓ VITE_API_URL trỏ về domain chính thức.");
}

console.log("\n------------------------------------------------------------------");
console.log(`KẾT QUẢ: ${passes.length} tiêu chí đạt | ${failures.length} tiêu chí chưa đạt.`);
console.log("------------------------------------------------------------------");

if (failures.length > 0) {
  if (isStrict) {
    console.log("\n❌ [LAUNCH GATE THẤT BẠI] Các tiêu chí bắt buộc chưa hoàn tất để sẵn sàng Go-Live:");
    failures.forEach((f) => console.log(`   - ${f}`));
    console.log("\nVui lòng cấu hình đầy đủ biến môi trường và build lại trước khi deploy.\n");
    process.exit(1);
  } else {
    console.log("\n⚠️  [CẢNH BÁO TIỀN TRIỂN KHAI (--soft)]: Có các tiêu chí chưa đạt:");
    failures.forEach((f) => console.log(`   - ${f}`));
    console.log("\nHệ thống tiếp tục chạy vì đang ở chế độ kiểm tra mềm (--soft).\n");
    process.exit(0);
  }
} else {
  console.log("\n🎉 [SẴN SÀNG TRIỂN KHAI] Toàn bộ tiêu chí kiểm tra sẵn sàng Go-Live đã đạt chuẩn!\n");
  process.exit(0);
}
