import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, devices } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveDbUrl(): { dbUrl: string; dbDirectUrl: string } {
  let dbUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  let dbDirectUrl = process.env.DATABASE_URL_DIRECT;

  if (!dbUrl) {
    const envFile = path.resolve(__dirname, "apps/api/.env");
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

const { dbUrl, dbDirectUrl } = resolveDbUrl();

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/__screenshots__",
  timeout: 45000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: process.env.CI ? 0.15 : 0.08,
      threshold: 0.2,
      animations: "disabled",
    },
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: [
    {
      command: "node apps/api/src/server.js",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        PORT: "4000",
        NODE_ENV: "test",
        DATABASE_URL: dbUrl,
        DATABASE_URL_DIRECT: dbDirectUrl,
        JWT_SECRET: "e2e_jwt_secret_key_minimum_32_characters_long",
        JWT_EXPIRES_IN: "3s",
        JWT_REFRESH_EXPIRES_IN: "7d",
        ADMIN_EMAIL: "admin@pidecor.vn",
        ADMIN_PASSWORD: "AdminSecretPassword123!",
      },
    },
    {
      command: "npm --prefix apps/web run preview -- --port 5173",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        VITE_API_URL: "http://localhost:4000",
      },
    },
  ],
});
