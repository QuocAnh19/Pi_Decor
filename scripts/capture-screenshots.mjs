#!/usr/bin/env node
import { execSync, spawn } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { chromium } from "@playwright/test";

/**
 * scripts/capture-screenshots.mjs
 * ───────────────────────────────
 * Tự động chụp các màn hình công khai và quản trị cho tài liệu hướng dẫn:
 * - Kích thước viewport tiêu chuẩn: 1280x800
 * - Che thông tin dữ liệu cá nhân (SĐT, Email) bằng lớp bảo vệ
 * - Lưu ảnh vào docs/user-guide/img/ với tên tệp cố định
 */

const OUT_DIR = path.resolve("docs/user-guide/img");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function resolveDbUrl() {
  let dbUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  let dbDirectUrl = process.env.DATABASE_URL_DIRECT;
  const envFile = path.resolve("apps/api/.env");
  if (!dbUrl && fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    const mUrl = content.match(/^DATABASE_URL\s*=\s*(.+)$/m);
    const mDirect = content.match(/^DATABASE_URL_DIRECT\s*=\s*(.+)$/m);
    if (mUrl && mUrl[1]?.trim()) dbUrl = mUrl[1].trim();
    if (mDirect && mDirect[1]?.trim()) dbDirectUrl = mDirect[1].trim();
  }
  const finalDbUrl = dbUrl || "postgres://postgres:postgres@localhost:5432/pidecor_test";
  return { dbUrl: finalDbUrl, dbDirectUrl: dbDirectUrl || finalDbUrl };
}

function checkPortListening(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => resolve(true));
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForHttp(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await new Promise((res) => {
        const req = http.get(url, (response) => res(response.statusCode >= 200 && response.statusCode < 400));
        req.on("error", () => res(false));
        req.setTimeout(1500, () => { req.destroy(); res(false); });
      });
      if (ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Quá thời gian chờ service tại ${url}`);
}

async function main() {
  console.log("=== BẮT ĐẦU CHỤP ẢNH MÀN HÌNH HƯỚNG DẪN (SCREENSHOTS) ===");
  const { dbUrl, dbDirectUrl } = resolveDbUrl();

  // 1. Chuẩn bị cơ sở dữ liệu test
  console.log("[1/4] Chuẩn bị cơ sở dữ liệu mẫu...");
  const env = {
    ...process.env,
    DATABASE_URL: dbUrl,
    DATABASE_URL_DIRECT: dbDirectUrl,
    ADMIN_EMAIL: "admin@pidecor.vn",
    ADMIN_PASSWORD: "AdminSecretPassword123!",
    NODE_ENV: "test",
    JWT_SECRET: "e2e_jwt_secret_key_minimum_32_characters_long",
    JWT_EXPIRES_IN: "1h",
  };
  execSync("node apps/api/database/migrate.js", { env, stdio: "ignore" });
  execSync("node apps/api/src/utils/seed.js --reset-password", { env, stdio: "ignore" });

  // 2. Khởi động API và Web nếu chưa chạy
  console.log("[2/4] Kiểm tra các dịch vụ máy chủ...");
  const spawnedProcesses = [];
  const apiRunning = await checkPortListening(4000);
  if (!apiRunning) {
    console.log("  → Khởi động API Server trên port 4000...");
    const apiProc = spawn("node", ["apps/api/src/server.js"], { env, stdio: "ignore" });
    spawnedProcesses.push(apiProc);
    await waitForHttp("http://localhost:4000/api/health");
  }

  const webRunning = await checkPortListening(5173);
  if (!webRunning) {
    console.log("  → Khởi động Web Preview trên port 5173...");
    const webProc = spawn("npx", ["vite", "preview", "--port", "5173"], {
      cwd: path.resolve("apps/web"),
      env: { ...process.env, VITE_API_URL: "http://localhost:4000" },
      stdio: "ignore",
      shell: true,
    });
    spawnedProcesses.push(webProc);
    await waitForHttp("http://localhost:5173");
  }

  // 3. Khởi chạy Playwright Chromium
  console.log("[3/4] Mở trình duyệt Playwright và chụp ảnh...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "vi-VN",
  });
  const page = await context.newPage();

  // Chặn tile OpenStreetMap và ảnh Cloudinary ngoài luồng nếu mạng yếu
  await page.route("**/tile.openstreetmap.org/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"),
    });
  });

  async function maskSensitiveData() {
    await page.evaluate(() => {
      // Che số điện thoại & email cá nhân trong toàn bộ phần tử
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.nodeValue;
        if (/0\d{9,10}/.test(text) || /@\S+\.\S+/.test(text)) {
          node.nodeValue = text
            .replace(/0\d{9,10}/g, "090 •••• 888")
            .replace(/[\w.-]+@[\w.-]+\.\w+/g, "khach••••@gmail.com");
        }
      }
    });
  }

  async function snap(filename, url, beforeSnap) {
    console.log(`  📸 Đang chụp: ${filename} (${url})`);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    if (beforeSnap) await beforeSnap();
    await maskSensitiveData();
    await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: false });
  }

  try {
    // A. Màn hình công khai
    await snap("01-homepage.png", "http://localhost:5173/");
    await snap("02-studio.png", "http://localhost:5173/studio");

    // B. Màn hình đăng nhập quản trị
    await snap("03-admin-login.png", "http://localhost:5173/admin/login");

    // Đăng nhập admin
    await page.fill('input[type="email"]', "admin@pidecor.vn");
    await page.fill('input[type="password"]', "AdminSecretPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.includes("/admin/login") && u.pathname.startsWith("/admin"), { timeout: 15000 });

    // C. Màn hình quản trị
    await snap("04-admin-dashboard.png", "http://localhost:5173/admin/dashboard");
    await snap("05-admin-leads.png", "http://localhost:5173/admin/leads");

    // Mở chi tiết lead / ngăn kéo báo giá
    await snap("06-admin-lead-detail.png", "http://localhost:5173/admin/leads", async () => {
      const firstRow = page.locator("tbody tr").first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await page.waitForTimeout(600);
      }
    });

    await snap("07-admin-projects.png", "http://localhost:5173/admin/projects");
    await snap("08-admin-venues.png", "http://localhost:5173/admin/venues");
    await snap("09-admin-services.png", "http://localhost:5173/admin/services");
    await snap("10-admin-materials.png", "http://localhost:5173/admin/materials");
    await snap("11-admin-testimonials.png", "http://localhost:5173/admin/testimonials");
    await snap("12-admin-studio.png", "http://localhost:5173/admin/studio");
    await snap("13-admin-settings.png", "http://localhost:5173/admin/settings");

    console.log(`[4/4] Hoàn tất chụp ${13} ảnh màn hình vào ${OUT_DIR}!`);
  } finally {
    await browser.close();
    for (const proc of spawnedProcesses) {
      try {
        proc.kill();
      } catch {}
    }
  }
}

main().catch((err) => {
  console.error("Lỗi khi chụp ảnh màn hình:", err);
  process.exit(1);
});
