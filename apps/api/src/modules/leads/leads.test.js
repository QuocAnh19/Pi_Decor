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

  it("quản lý timeline activities: hỗ trợ phân trang cursor và giữ null khi admin bị xóa", async () => {
    const token = generateTestAdminToken();

    // 1. Tạo 1 lead test
    const createLeadRes = await request(app)
      .post("/api/leads")
      .send({ name: "Lead Activity Test", phone: "0905999888", consent: true });
    expect(createLeadRes.status).toBe(201);
    const leadId = createLeadRes.body.id;

    // 2. Thêm ghi chú qua POST /api/leads/:id/activities
    const postNoteRes = await request(app)
      .post(`/api/leads/${leadId}/activities`)
      .set("Authorization", `Bearer ${token}`)
      .send({ activity_type: "note", body: "Gọi điện tư vấn lần 1" });
    expect(postNoteRes.status).toBe(201);
    expect(postNoteRes.body).toHaveProperty("id");

    // 3. Thêm một hoạt động với admin_id mồ côi (giả lập admin đã bị xóa)
    const { pool } = await import("../../config/database.js");
    await pool.query(
      `insert into lead_activities (lead_id, admin_id, activity_type, body, created_at)
       values ($1, null, 'call', 'Cuộc gọi từ admin cũ', now() - interval '1 hour')`,
      [leadId]
    );

    // Thêm hoạt động thứ 3 cũ hơn
    await pool.query(
      `insert into lead_activities (lead_id, admin_id, activity_type, body, created_at)
       values ($1, null, 'note', 'Hoạt động cũ hơn', now() - interval '2 hours')`,
      [leadId]
    );

    // 4. GET activities với limit=2
    const getRes = await request(app)
      .get(`/api/leads/${leadId}/activities?limit=2`)
      .set("Authorization", `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toBeInstanceOf(Array);
    expect(getRes.body.length).toBe(2);

    // Bản ghi mới nhất có admin_email từ token admin
    expect(getRes.body[0].admin_email).toBeTruthy();
    expect(getRes.body[0].admin_name).toBeTruthy();

    // Bản ghi thứ hai admin đã xóa -> admin_email và admin_name là null / rỗng
    expect(getRes.body[1].admin_email).toBeNull();

    // 5. Thử phân trang cursor bằng before
    const cursor = getRes.body[1].created_at;
    const page2Res = await request(app)
      .get(`/api/leads/${leadId}/activities?limit=2&before=${encodeURIComponent(cursor)}`)
      .set("Authorization", `Bearer ${token}`);
    expect(page2Res.status).toBe(200);
    expect(page2Res.body.length).toBe(1);
    expect(page2Res.body[0].body).toBe("Hoạt động cũ hơn");
  });
});
