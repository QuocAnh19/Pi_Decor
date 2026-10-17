import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDbUrl(): { dbUrl: string; dbDirectUrl: string } {
  let dbUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  let dbDirectUrl = process.env.DATABASE_URL_DIRECT;

  if (!dbUrl) {
    const envFile = path.resolve(__dirname, "../apps/api/.env");
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, "utf8");
      const urlMatch = content.match(/^DATABASE_URL\s*=\s*(.+)$/m);
      const directMatch = content.match(/^DATABASE_URL_DIRECT\s*=\s*(.+)$/m);
      if (urlMatch && urlMatch[1]?.trim()) dbUrl = urlMatch[1].trim();
      if (directMatch && directMatch[1]?.trim()) dbDirectUrl = directMatch[1].trim();
    }
  }

  const finalDbUrl = dbUrl || "postgres://postgres:postgres@localhost:5432/pidecor_test";
  const finalDirectUrl = dbDirectUrl || finalDbUrl;
  return { dbUrl: finalDbUrl, dbDirectUrl: finalDirectUrl };
}

export default async function globalSetup() {
  console.log("\n[E2E Setup] Đang khởi tạo cơ sở dữ liệu test e2e...");
  const rootDir = path.resolve(__dirname, "..");
  const { dbUrl, dbDirectUrl } = resolveDbUrl();

  const env = {
    ...process.env,
    DATABASE_URL: dbUrl,
    DATABASE_URL_DIRECT: dbDirectUrl,
    ADMIN_EMAIL: "admin@pidecor.vn",
    ADMIN_PASSWORD: "AdminSecretPassword123!",
    NODE_ENV: "test",
    JWT_EXPIRES_IN: "3s",
    JWT_REFRESH_EXPIRES_IN: "7d",
  };

  try {
    // 1. Chạy migrate
    execSync("node apps/api/database/migrate.js", { cwd: rootDir, env, stdio: "inherit" });
    // 2. Chạy seed (kèm --reset-password để đồng bộ mật khẩu test)
    execSync("node apps/api/src/utils/seed.js --reset-password", { cwd: rootDir, env, stdio: "inherit" });
    console.log("[E2E Setup] Cơ sở dữ liệu test e2e đã sẵn sàng!\n");
  } catch (err) {
    console.error("[E2E Setup] Thất bại khi thiết lập DB:", err);
    throw err;
  }
}
