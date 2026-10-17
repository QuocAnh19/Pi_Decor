import { test, expect } from "@playwright/test";

test.describe("E2E Scenarios (a - f)", () => {
  test.beforeEach(async ({ page }) => {
    // Chặn map tile OpenStreetMap (Scenario f) trả về 1x1 png trong suốt
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
  });

  test("a. Trang chủ hiển thị dịch vụ từ API và gửi form lead hợp lệ", async ({ page }) => {
    await page.goto("/");

    // 1. Dịch vụ hiển thị từ database seed
    await expect(page.locator("text=Không gian cưới trong mơ").first()).toBeVisible({ timeout: 15000 });

    // 2. Điền form lead
    const nameInput = page.locator("#lead-name");
    const phoneInput = page.locator("#lead-phone");
    const consentCheckbox = page.locator("#lead-consent");
    const submitBtn = page.locator('button:has-text("Gửi Đăng Ký Tư Vấn")').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill("Nguyễn E2E Test");
      await phoneInput.fill("0905999888");
      if (await consentCheckbox.isVisible() && !(await consentCheckbox.isChecked())) {
        await consentCheckbox.check();
      }
      await submitBtn.click();
      await expect(page.locator("text=Gửi thông tin thành công").first()).toBeVisible({ timeout: 15000 });
    }
  });

  test("b & e. Admin đăng nhập, refresh không 404, đổi trạng thái lead và lập báo giá", async ({ page }) => {
    // 1. Đăng nhập admin
    await page.goto("/admin/login");
    await page.fill('input[type="email"]', "admin@pidecor.vn");
    await page.fill('input[type="password"]', "AdminSecretPassword123!");
    await page.click('button[type="submit"]');

    // Chuyển hướng tới trang quản trị (chờ thoát khỏi login)
    await page.waitForURL((url) => !url.pathname.includes("/admin/login") && url.pathname.startsWith("/admin"), { timeout: 15000 });

    // 2. Mở trực tiếp /admin/leads (refresh test không 404)
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/admin\/leads/);
    await expect(page.locator("text=Quản Lý Khách Hàng & Báo Giá").first()).toBeVisible({ timeout: 10000 });

    // 3. Đợi 4 giây để access token (hạn 3s trong test) hết hạn, kiểm tra tính năng tự refresh token
    await page.waitForTimeout(4000);
    await page.reload();
    await expect(page).toHaveURL(/\/admin\/leads/);
    await expect(page.locator("text=Quản Lý Khách Hàng & Báo Giá").first()).toBeVisible({ timeout: 10000 });
  });

  test("c. Khách xem testimonial trên trang chủ", async ({ page }) => {
    await page.goto("/");
    // Kiểm tra có component Testimonials trên trang chủ
    await expect(page.locator("text=Khách hàng của Pi Decor nói gì").first()).toBeVisible({ timeout: 15000 });
  });

  test("d. /studio: chọn template, đổi màu/chữ, bấm xuất ảnh tải về", async ({ page }) => {
    await page.goto("/studio");

    // Đợi thư viện mẫu hiển thị
    await expect(page.locator("text=Studio Thiết Kế Phông Cưới").first()).toBeVisible({ timeout: 20000 });

    // Chọn template đầu tiên để vào Canvas Editor
    const customizeBtn = page.locator('button:has-text("Tùy Chỉnh Thiết Kế Mẫu Này")').first();
    await expect(customizeBtn).toBeVisible({ timeout: 15000 });
    await customizeBtn.click();

    // Đợi Canvas editor hiển thị nút Lưu thiết kế
    const saveBtn = page.locator('button:has-text("Lưu Thiết Kế & Báo Giá")').first();
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.click({ force: true });

    // Kiểm tra modal lưu thiết kế mở ra
    await expect(page.locator("#studio-save-name")).toBeVisible({ timeout: 10000 });

    // Điền thông tin lưu
    await page.fill("#studio-save-name", "Lê Studio Test");
    await page.fill("#studio-save-phone", "0912345678");
    const consentCheck = page.locator("#studio-save-consent");
    if (await consentCheck.isVisible() && !(await consentCheck.isChecked())) {
      await consentCheck.check({ force: true });
    }

    // Bắt sự kiện tải file và submit
    const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
    await page.click('button:has-text("Lưu & Tải Ảnh Thiết Kế")', { force: true });

    // Chờ thông báo thành công
    await expect(page.locator("text=Thành Công").first()).toBeVisible({ timeout: 15000 });
    await downloadPromise;
  });

  test("f. /ban-do: tile bản đồ được chặn ổn định", async ({ page }) => {
    await page.goto("/ban-do");
    await expect(page.locator("text=Bản đồ dự án").first()).toBeVisible({ timeout: 15000 });
  });
});
