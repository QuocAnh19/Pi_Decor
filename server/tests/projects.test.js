import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/config/database.js";
import { generateTestAdminToken } from "./helpers.js";

describe("Projects Integration Tests", () => {
  let token;

  beforeEach(async () => {
    token = generateTestAdminToken();

    // Chèn 1 dự án published và 1 dự án draft vào database (id kiểu uuid)
    await pool.query(`
      insert into projects (id, title, category_id, location, wedding_date, published, created_at)
      values 
        ('b0000000-0000-4000-8000-000000000001', 'Dự án đã công khai', 'wedding', 'Đà Nẵng', '2026-05-20', true, now()),
        ('b0000000-0000-4000-8000-000000000002', 'Dự án nháp chưa công khai', 'wedding', 'Hội An', '2026-06-15', false, now());
    `);
  });

  it("dự án nháp không xuất hiện ở GET /api/projects công khai (P08)", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const ids = res.body.map((p) => p.id);
    expect(ids).toContain("b0000000-0000-4000-8000-000000000001");
    expect(ids).not.toContain("b0000000-0000-4000-8000-000000000002");
  });

  it("admin thấy toàn bộ dự án bao gồm cả bản nháp ở GET /api/projects/admin", async () => {
    const res = await request(app)
      .get("/api/projects/admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const ids = res.body.map((p) => p.id);
    expect(ids).toContain("b0000000-0000-4000-8000-000000000001");
    expect(ids).toContain("b0000000-0000-4000-8000-000000000002");
  });
});
