import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { pool } from "../../config/database.js";
import { generateTestAdminToken } from "../../../tests/helpers.js";

describe("Testimonials Integration Tests", () => {
  let token;

  beforeEach(async () => {
    token = generateTestAdminToken();

    // Chèn đánh giá approved và pending
    await pool.query(`
      insert into testimonials (id, author, quote, rating, status, created_at)
      values
        ('66666666-6666-6666-6666-666666666666', 'Chị Mai', 'Rất hài lòng về dịch vụ', 5, 'approved', now()),
        ('77777777-7777-7777-7777-777777777777', 'Anh Hùng', 'Đang chờ duyệt', 4, 'pending', now())
      on conflict (id) do nothing
    `);
  });

  it("API công khai chỉ trả về các đánh giá đã duyệt (approved)", async () => {
    const res = await request(app).get("/api/testimonials");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t) => t.author === "Chị Mai")).toBe(true);
    expect(res.body.some((t) => t.author === "Anh Hùng")).toBe(false);
  });

  it("yêu cầu quyền admin khi xem toàn bộ danh sách ở GET /api/testimonials/admin", async () => {
    const unauth = await request(app).get("/api/testimonials/admin");
    expect(unauth.status).toBe(401);

    const auth = await request(app)
      .get("/api/testimonials/admin")
      .set("Authorization", `Bearer ${token}`);
    expect(auth.status).toBe(200);
    expect(Array.isArray(auth.body)).toBe(true);
    expect(auth.body.some((t) => t.author === "Anh Hùng")).toBe(true);
  });

  it("cho phép khách hàng gửi đánh giá mới với trạng thái mặc định là pending", async () => {
    const res = await request(app).post("/api/testimonials").send({
      author: "Khách Mới",
      quote: "Đám cưới trang trí rất đẹp, cảm ơn team Pi Decor!",
      rating: 5,
      consent: true,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.status).toBe("pending");
  });
});
