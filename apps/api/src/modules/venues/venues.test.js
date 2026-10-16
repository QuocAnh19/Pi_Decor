import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { pool } from "../../config/database.js";
import { generateTestAdminToken } from "../../../tests/helpers.js";

describe("Venues Integration Tests", () => {
  let token;

  beforeEach(async () => {
    token = generateTestAdminToken();

    // Chèn venue mẫu
    await pool.query(`
      insert into venues (id, name, type, city, address, lat, lng, created_at)
      values ('33333333-3333-3333-3333-333333333333', 'InterContinental Danang', 'resort', 'Đà Nẵng', 'Bãi Bắc, Sơn Trà', 16.12, 108.31, now())
      on conflict (id) do nothing
    `);
  });

  it("cho phép truy cập danh sách địa điểm công khai", async () => {
    const res = await request(app).get("/api/venues");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((v) => v.name === "InterContinental Danang")).toBe(true);
  });

  it("tìm kiếm địa điểm theo từ khóa q", async () => {
    const res = await request(app).get("/api/venues/search?q=InterContinental");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("lấy chi tiết địa điểm kèm danh sách dự án liên kết", async () => {
    const res = await request(app).get("/api/venues/33333333-3333-3333-3333-333333333333");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("projects");
    expect(res.body.name).toBe("InterContinental Danang");
  });

  it("yêu cầu quyền admin khi tạo địa điểm mới", async () => {
    const unauth = await request(app)
      .post("/api/venues")
      .send({ name: "Test Venue", lat: 10.0, lng: 106.0 });
    expect(unauth.status).toBe(401);

    const auth = await request(app)
      .post("/api/venues")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Vinpearl Landmark 81", lat: 10.795, lng: 106.721, city: "TP. Hồ Chí Minh" });
    expect(auth.status).toBe(201);
    expect(auth.body).toHaveProperty("id");
  });
});
