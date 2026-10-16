import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { generateTestAdminToken } from "../../../tests/helpers.js";

describe("Leads Integration Tests", () => {
  it("tạo lead thành công với số điện thoại Việt Nam hợp lệ", async () => {
    const validLeads = [
      { name: "Nguyễn Văn A", phone: "0905123456", email: "vana@gmail.com", consent: true },
      { name: "Trần Thị B", phone: "+84912345678", consent: true },
      { name: "Lê Văn C", phone: "038 123 4567", consent: true }, // sẽ được strip ký tự trắng
    ];

    for (const lead of validLeads) {
      const res = await request(app).post("/api/leads").send(lead);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
    }
  });

  it("từ chối tạo lead khi không đồng ý chính sách bảo mật (consent: false hoặc thiếu)", async () => {
    const resNoConsent = await request(app)
      .post("/api/leads")
      .send({ name: "Nguyễn Văn A", phone: "0905123456" });
    expect(resNoConsent.status).toBe(400);

    const resFalseConsent = await request(app)
      .post("/api/leads")
      .send({ name: "Nguyễn Văn A", phone: "0905123456", consent: false });
    expect(resFalseConsent.status).toBe(400);
  });

  it("từ chối tạo lead với số điện thoại không hợp lệ", async () => {
    const invalidLeads = [
      { name: "Nguyễn Văn A", phone: "123456", consent: true },
      { name: "Trần Thị B", phone: "abc0905123456", consent: true },
      { name: "Lê Văn C", phone: "012345678901234", consent: true }, // quá dài
    ];

    for (const lead of invalidLeads) {
      const res = await request(app).post("/api/leads").send(lead);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    }
  });

  it("yêu cầu quyền admin khi truy cập GET /api/leads", async () => {
    // Không có token -> 401
    const unauthRes = await request(app).get("/api/leads");
    expect(unauthRes.status).toBe(401);

    // Có token admin hợp lệ -> 200
    const token = generateTestAdminToken();
    const authRes = await request(app).get("/api/leads").set("Authorization", `Bearer ${token}`);
    expect(authRes.status).toBe(200);
    expect(authRes.body).toHaveProperty("data");
  });
});
