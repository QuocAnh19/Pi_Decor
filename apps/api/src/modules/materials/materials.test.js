import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { pool } from "../../config/database.js";
import { generateTestAdminToken } from "../../../tests/helpers.js";

describe("Materials Integration Tests", () => {
  let token;

  beforeEach(async () => {
    token = generateTestAdminToken();

    // Chèn vật liệu mẫu
    await pool.query(`
      insert into materials (id, name, category, color_hex, created_at)
      values ('44444444-4444-4444-4444-444444444444', 'Voan Lụa Trắng', 'fabric', '#FFFFFF', now())
      on conflict (id) do nothing
    `);
  });

  it("cho phép truy cập danh sách vật liệu công khai và lọc theo category", async () => {
    const res = await request(app).get("/api/materials");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const filtered = await request(app).get("/api/materials?category=fabric");
    expect(filtered.status).toBe(200);
    expect(Array.isArray(filtered.body)).toBe(true);
    expect(filtered.body.some((m) => m.name === "Voan Lụa Trắng")).toBe(true);
  });

  it("yêu cầu quyền admin khi tạo vật liệu mới", async () => {
    const unauth = await request(app)
      .post("/api/materials")
      .send({ name: "Hoa Hồng Đỏ", category: "flowers" });
    expect(unauth.status).toBe(401);

    const auth = await request(app)
      .post("/api/materials")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Hoa Hồng Đỏ Test", category: "cụm hoa", color_hex: "#FF0000" });
    expect(auth.status).toBe(201);
    expect(auth.body.name).toMatch(/Hoa Hồng Đỏ Test/);
    expect(auth.body.category).toBe("flowers");
  });
});
