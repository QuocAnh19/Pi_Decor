import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { generateTestAdminToken } from "./helpers.js";

describe("Leads Integration Tests", () => {
  it("tạo lead thành công với số điện thoại Việt Nam hợp lệ", async () => {
    const validLeads = [
      { name: "Nguyễn Văn A", phone: "0905123456", email: "vana@gmail.com" },
      { name: "Trần Thị B", phone: "+84912345678" },
      { name: "Lê Văn C", phone: "038 123 4567" }, // sẽ được strip ký tự trắng
    ];

    for (const lead of validLeads) {
      const res = await request(app).post("/api/leads").send(lead);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
    }
  });

  it("từ chối tạo lead với số điện thoại không hợp lệ", async () => {
    const invalidLeads = [
      { name: "Nguyễn Văn A", phone: "123456" },
      { name: "Trần Thị B", phone: "abc0905123456" },
      { name: "Lê Văn C", phone: "012345678901234" }, // quá dài
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
    const authRes = await request(app)
      .get("/api/leads")
      .set("Authorization", `Bearer ${token}`);
    expect(authRes.status).toBe(200);
    expect(authRes.body).toHaveProperty("data");
  });
});
