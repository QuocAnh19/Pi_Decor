import { test, expect } from "@playwright/test";

test.describe("Visual Baseline Comparisons", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept map tiles
    await page.route("**/tile.openstreetmap.org/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          "base64"
        ),
      });
    });

    // Mock Cloudinary images to transparent 1x1 png for deterministic visual screenshots
    await page.route("**/res.cloudinary.com/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          "base64"
        ),
      });
    });
  });

  const maskLocators = (page: any) => [
    page.locator('time, [class*="date"], [class*="time"], [class*="badgeStatus"]'),
  ];

  test("Visual: Trang chủ", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("homepage.png", {
      mask: maskLocators(page),
      fullPage: false,
    });
  });

  test("Visual: /studio", async ({ page }) => {
    await page.goto("/studio");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("studio.png", {
      mask: maskLocators(page),
      fullPage: false,
    });
  });

  test("Visual: /ban-do", async ({ page }) => {
    await page.goto("/ban-do");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("map.png", {
      mask: maskLocators(page),
      fullPage: false,
    });
  });

  test("Visual: Admin Leads, Projects, Studio", async ({ page }) => {
    // Login
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@pidecor.vn");
    await page.fill('input[type="password"]', "AdminSecretPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes("/admin/login") && url.pathname.startsWith("/admin"), { timeout: 15000 });

    // 1. Admin Leads
    await page.goto("/admin/leads");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("admin-leads.png", {
      mask: maskLocators(page),
      fullPage: false,
    });

    // 2. Admin Projects
    await page.goto("/admin/projects");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("admin-projects.png", {
      mask: maskLocators(page),
      fullPage: false,
    });

    // 3. Admin Studio
    await page.goto("/admin/studio");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("admin-studio.png", {
      mask: maskLocators(page),
      fullPage: false,
    });
  });
});
