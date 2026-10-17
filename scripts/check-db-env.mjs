import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

let dbUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_TEST;

if (!dbUrl) {
  const candidatePaths = [
    resolve(".env"),
    resolve("apps/api/.env"),
    resolve("../../apps/api/.env"),
  ];
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, "utf8");
      const match = content.match(/^DATABASE_URL(?:_TEST)?\s*=\s*(.+)$/m);
      if (match && match[1]?.trim()) {
        dbUrl = match[1].trim();
        break;
      }
    }
  }
}

if (!dbUrl) {
  console.error("\x1b[31m[LỖI CẤU HÌNH CƠ SỞ DỮ LIỆU]\x1b[0m");
  console.error("Không tìm thấy biến môi trường DATABASE_URL hoặc DATABASE_URL_TEST.");
  console.error("Vui lòng thực hiện các bước chuẩn bị:");
  console.error("  1. Khởi động PostgreSQL: docker compose up -d");
  console.error("  2. Sao chép file cấu hình: cp apps/api/.env.example apps/api/.env");
  console.error("  3. Thiết lập DATABASE_URL hợp lệ vào apps/api/.env hoặc export ra môi trường.");
  process.exit(1);
}
