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

  it("hỗ trợ upload ảnh cover qua multipart và cập nhật/xóa dịch vụ", async () => {
    // 1. Tạo dịch vụ kèm upload file ảnh
    const fakeImageBuffer = Buffer.from("fake-service-image-binary-data");
    const createRes = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Tiệc sinh nhật chủ đề Safari")
      .field("brand", "PiKids")
      .field("accent", "kids")
      .field("items", JSON.stringify(["Bóng bay Safari", "Bàn gallery thú rừng"]))
      .attach("cover", fakeImageBuffer, "safari-cover.jpg");

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty("id");
    expect(createRes.body.title).toBe("Tiệc sinh nhật chủ đề Safari");
    expect(createRes.body.cover).toBeTruthy();

    const serviceId = createRes.body.id;

    // 2. Cập nhật dịch vụ (thay đổi order và ảnh cover mới)
    const updateRes = await request(app)
      .patch(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("order", "5")
      .field("featured", "true")
      .attach("cover", Buffer.from("new-safari-cover"), "new-safari.png");

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.order).toBe(5);
    expect(updateRes.body.featured).toBe(true);

    // 3. Xóa dịch vụ
    const delRes = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(delRes.status).toBe(204);
  });
});
