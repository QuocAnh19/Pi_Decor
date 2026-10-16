import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { generateTestAdminToken, seedTestAdmin } from "./helpers.js";

describe("Quotations Integration Tests", () => {
  let token;
  let leadId;

  beforeEach(async () => {
    await seedTestAdmin();
    token = generateTestAdminToken();

    // Tạo một lead mẫu để tạo quotation
    const leadRes = await request(app)
      .post("/api/leads")
      .send({ name: "Khách Hàng Test", phone: "0905111222" });
    leadId = leadRes.body.id;
  });

  it("tính subtotal và total chính xác trên server", async () => {
    const items = [
      { description: "Cổng hoa cưới", quantity: 2, unit_price: 3000000 },
      { description: "Backdrop sân khấu", quantity: 1, unit_price: 5000000 },
    ];
    const discount = 1000000;

    const res = await request(app)
      .post("/api/quotations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        lead_id: leadId,
        items,
        discount,
      });

    expect(res.status).toBe(201);
    // Subtotal = 2 * 3tr + 1 * 5tr = 11tr
    expect(res.body.subtotal).toBe(11000000);
    // Total = 11tr - 1tr = 10tr
    expect(res.body.total).toBe(10000000);
    expect(res.body.discount).toBe(1000000);
  });

  it("không bị trùng số báo giá sau khi xóa bản ghi nháp (P03)", async () => {
    // 1. Tạo báo giá thứ nhất (ở trạng thái draft mặc định)
    const firstRes = await request(app)
      .post("/api/quotations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        lead_id: leadId,
        items: [{ description: "Gói cơ bản", quantity: 1, unit_price: 1000000 }],
      });
    expect(firstRes.status).toBe(201);
    const firstQuotationNumber = firstRes.body.quotation_number;
    const firstId = firstRes.body.id;

    // 2. Xóa bản báo giá nháp vừa tạo
    const deleteRes = await request(app)
      .delete(`/api/quotations/${firstId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    // 3. Tạo báo giá tiếp theo -> số báo giá phải tăng tuần tự và KHÔNG trùng số vừa xóa
    const secondRes = await request(app)
      .post("/api/quotations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        lead_id: leadId,
        items: [{ description: "Gói nâng cao", quantity: 1, unit_price: 2000000 }],
      });
    expect(secondRes.status).toBe(201);
    const secondQuotationNumber = secondRes.body.quotation_number;

    expect(secondQuotationNumber).not.toBe(firstQuotationNumber);

    // Kiểm tra định dạng BG-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    expect(firstQuotationNumber).toMatch(new RegExp(`^BG-${currentYear}-\\d{4}$`));
    expect(secondQuotationNumber).toMatch(new RegExp(`^BG-${currentYear}-\\d{4}$`));
  });
});
