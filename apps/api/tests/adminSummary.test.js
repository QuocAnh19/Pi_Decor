import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { generateTestAdminToken, seedTestAdmin } from "./helpers.js";

describe("Admin Summary Integration Tests", () => {
  let token;

  beforeEach(async () => {
    await seedTestAdmin();
    token = generateTestAdminToken();
  });

  it("yêu cầu xác thực admin khi truy cập GET /api/admin/summary", async () => {
    const unauth = await request(app).get("/api/admin/summary");
    expect(unauth.status).toBe(401);
  });

  it("trả về thống kê tổng quan và KHÔNG còn trường designs_total", async () => {
    const res = await request(app)
      .get("/api/admin/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("leads_total");
    expect(res.body).toHaveProperty("leads_new");
    expect(res.body).toHaveProperty("materials_total");
    expect(res.body).toHaveProperty("services_total");
    expect(res.body).toHaveProperty("venues_total");
    expect(res.body).toHaveProperty("projects_published_total");

    // Khẳng định bảng designs đã bị gỡ và trường designs_total không còn tồn tại
    expect(res.body.designs_total).toBeUndefined();
    expect(Object.keys(res.body)).not.toContain("designs_total");
  });
});
