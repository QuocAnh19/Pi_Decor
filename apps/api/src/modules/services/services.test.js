import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { pool } from "../../config/database.js";
import { generateTestAdminToken } from "../../../tests/helpers.js";

describe("Services Integration Tests", () => {
  let token;

  beforeEach(async () => {
    token = generateTestAdminToken();

    // Chèn dịch vụ mẫu
    await pool.query(`
      insert into services (id, title, brand, tagline, description, "order", created_at)
      values ('55555555-5555-5555-5555-555555555555', 'Trang trí gia tiên', 'Pi Decor', 'Ấm cúng, trang trọng', 'Chi tiết trang trí lễ gia tiên', 1, now())
      on conflict (id) do nothing
    `);
  });

  it("cho phép truy cập danh sách dịch vụ công khai", async () => {
    const res = await request(app).get("/api/services");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((s) => s.title === "Trang trí gia tiên")).toBe(true);
  });

  it("yêu cầu quyền admin khi tạo mới hoặc cập nhật dịch vụ", async () => {
    const unauth = await request(app).post("/api/services").send({ title: "Tiệc cưới ngoài trời" });
    expect(unauth.status).toBe(401);

    const auth = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Tiệc cưới ngoài trời Test", tagline: "Lãng mạn & phóng khoáng" });
    expect(auth.status).toBe(201);
    expect(auth.body).toHaveProperty("id");
    expect(auth.body.title).toBe("Tiệc cưới ngoài trời Test");
  });
});
