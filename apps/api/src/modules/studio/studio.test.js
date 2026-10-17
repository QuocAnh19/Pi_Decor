import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { pool } from "../../config/database.js";
import { generateTestAdminToken } from "../../../tests/helpers.js";

describe("Studio Integration Tests", () => {
  let token;

  beforeEach(async () => {
    token = generateTestAdminToken();

    // Dọn dẹp dữ liệu test studio trước mỗi test
    await pool.query(`delete from studio_templates where name like 'Test Template%'`);
    await pool.query(`delete from studio_assets where name like 'Test Asset%'`);

    // Chèn template active và inactive
    await pool.query(`
      insert into studio_templates (id, name, svg_base, is_active, created_at)
      values
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Template Active', '<svg><rect/></svg>', true, now()),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test Template Inactive', '<svg><circle/></svg>', false, now())
      on conflict (id) do update set
        name = excluded.name,
        svg_base = excluded.svg_base,
        is_active = excluded.is_active
    `);

    // Chèn asset active
    await pool.query(`
      insert into studio_assets (id, asset_type, name, is_active, created_at)
      values
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'drape', 'Test Asset Drapery', true, now())
      on conflict (id) do update set
        name = excluded.name,
        is_active = excluded.is_active
    `);
  });

  it("API công khai chỉ trả về các templates đang hoạt động (is_active = true)", async () => {
    const res = await request(app).get("/api/studio/templates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((t) => t.name === "Test Template Active")).toBe(true);
    expect(res.body.some((t) => t.name === "Test Template Inactive")).toBe(false);
  });

  it("yêu cầu quyền admin khi xem toàn bộ danh sách ở GET /api/studio/templates/admin", async () => {
    const unauth = await request(app).get("/api/studio/templates/admin");
    expect(unauth.status).toBe(401);

    const auth = await request(app)
      .get("/api/studio/templates/admin")
      .set("Authorization", `Bearer ${token}`);
    expect(auth.status).toBe(200);
    expect(Array.isArray(auth.body)).toBe(true);
    expect(auth.body.some((t) => t.name === "Test Template Inactive")).toBe(true);
  });

  it("admin xuất bản (publish) template nguyên tử kèm slots và rules và làm sạch mã độc SVG", async () => {
    const templateId = "dddddddd-dddd-dddd-dddd-dddddddddddd";
    const maliciousSvg =
      '<svg><script>alert("xss")</script><rect width="100" height="100"/><g id="bg"/></svg>';
    const res = await request(app)
      .put(`/api/studio/templates/${templateId}/publish`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Template Published",
        svg_base: maliciousSvg,
        is_active: true,
        slots: [
          {
            slot_key: "slot-main",
            label: "Main Drape",
            slot_type: "drape",
            norm_x: 0.5,
            norm_y: 0.5,
            sort_order: 1,
          },
        ],
        rules: [
          {
            condition_slot: "slot-main",
            condition_value: { tag: "fabric-silk" },
            target_slot: "slot-accent",
            action: "force_asset",
            priority: 1,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("template");
    expect(res.body.template.name).toBe("Test Template Published");
    expect(res.body.template.svg_base).not.toContain("<script>");
    expect(res.body.template.svg_base).toContain("<rect");

    // Kiểm tra slots đã lưu
    const slotsRes = await request(app).get(`/api/studio/templates/${templateId}/slots`);
    expect(slotsRes.status).toBe(200);
    expect(slotsRes.body.length).toBe(1);
    expect(slotsRes.body[0].slot_key).toBe("slot-main");

    // Kiểm tra rules đã lưu
    const rulesRes = await request(app).get(`/api/studio/templates/${templateId}/rules`);
    expect(rulesRes.status).toBe(200);
    expect(rulesRes.body.length).toBe(1);
    expect(rulesRes.body[0].condition_slot).toBe("slot-main");
  });

  it("admin có thể xem danh sách assets qua GET /api/studio/assets/admin", async () => {
    const unauth = await request(app).get("/api/studio/assets/admin");
    expect(unauth.status).toBe(401);

    const auth = await request(app)
      .get("/api/studio/assets/admin")
      .set("Authorization", `Bearer ${token}`);
    expect(auth.status).toBe(200);
    expect(Array.isArray(auth.body)).toBe(true);
    expect(auth.body.some((a) => a.name === "Test Asset Drapery")).toBe(true);
  });

  it("admin có thể xóa slot riêng lẻ qua DELETE /api/studio/slots/:slotId", async () => {
    const slotId = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee";
    await pool.query(
      `insert into studio_slot_definitions (id, template_id, slot_key, label, slot_type, norm_x, norm_y)
       values ($1, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'slot-delete-test', 'Label', 'drape', 0.5, 0.5)`,
      [slotId]
    );

    const unauth = await request(app).delete(`/api/studio/slots/${slotId}`);
    expect(unauth.status).toBe(401);

    const res = await request(app)
      .delete(`/api/studio/slots/${slotId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("các endpoint chi tiết không còn sử dụng phải trả về 404 Not Found", async () => {
    const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const removedRequests = [
      request(app).post("/api/studio/templates").set("Authorization", `Bearer ${token}`).send({}),
      request(app)
        .post(`/api/studio/templates/${id}/slots`)
        .set("Authorization", `Bearer ${token}`)
        .send({}),
      request(app)
        .patch(`/api/studio/templates/${id}/slots/reorder`)
        .set("Authorization", `Bearer ${token}`)
        .send([]),
      request(app)
        .patch(`/api/studio/slots/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({}),
      request(app)
        .post(`/api/studio/templates/${id}/rules`)
        .set("Authorization", `Bearer ${token}`)
        .send({}),
      request(app)
        .patch(`/api/studio/rules/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({}),
      request(app).delete(`/api/studio/rules/${id}`).set("Authorization", `Bearer ${token}`),
      request(app).get("/api/studio/assets"),
      request(app).post("/api/studio/assets").set("Authorization", `Bearer ${token}`).send({}),
      request(app)
        .patch(`/api/studio/assets/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({}),
      request(app).delete(`/api/studio/assets/${id}`).set("Authorization", `Bearer ${token}`),
    ];

    for (const reqPromise of removedRequests) {
      const res = await reqPromise;
      expect(res.status).toBe(404);
    }
  });
});
