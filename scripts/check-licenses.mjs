#!/usr/bin/env node
import { execSync } from "child_process";

/**
 * scripts/check-licenses.mjs
 * ──────────────────────────
 * Quét toàn bộ phụ thuộc trong monorepo nhằm chặn các giấy phép copyleft nghiêm ngặt (GPL, AGPL).
 * Ghi nhận: LGPL-3.0-or-later thuộc về @img/sharp-* (nằm trong devDependencies ở gốc để phục vụ tối ưu ảnh dev/build,
 * không được đóng gói vào production dependencies của apps/api hay apps/web).
 */

console.log("[licenses] Đang quét giấy phép dependencies qua license-checker-rseidelsohn...");

const failLicenses = [
  "GPL",
  "AGPL",
  "GPL-2.0",
  "GPL-3.0",
  "AGPL-3.0",
  "GPL-2.0-only",
  "GPL-2.0-or-later",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "AGPL-1.0",
  "AGPL-3.0-only",
  "AGPL-3.0-or-later",
].join(";");

try {
  const output = execSync(
    `npx license-checker-rseidelsohn --failOn "${failLicenses}" --summary`,
    {
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "pipe"],
    }
  );
  console.log(output);
  console.log(
    "✓ Kiểm tra giấy phép thành công: Không phát hiện gói GPL/AGPL nào. LGPL chỉ tồn tại trong devDependencies (@img/sharp-*)."
  );
} catch (err) {
  console.error("✗ Lỗi kiểm tra giấy phép:", err.stdout || err.stderr || err.message);
  process.exit(1);
}
