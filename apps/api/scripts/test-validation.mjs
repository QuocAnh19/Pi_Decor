import assert from "node:assert/strict";
import { createServiceSchema, updateServiceSchema } from "../src/schemas/services.schema.js";
import { createProjectSchema, updateProjectSchema } from "../src/schemas/projects.schema.js";
import { createTestimonialSchema, updateTestimonialSchema } from "../src/schemas/testimonials.schema.js";
import { createQuotationSchema, updateQuotationSchema } from "../src/schemas/quotations.schema.js";
import {
  createTemplateSchema,
  publishTemplateSchema,
  createSlotSchema,
  createAssetSchema,
  createRuleSchema,
} from "../src/schemas/studio.schema.js";
import { updateLeadStatusSchema, createLeadActivitySchema } from "../src/schemas/leads.schema.js";
import { refreshTokenSchema } from "../src/schemas/auth.schema.js";
import { validate } from "../src/middlewares/validate.js";

console.log("Running P06 validation tests...");

// 1. Validate middleware formatting & unknown key stripping
{
  const schema = createServiceSchema;
  let responseData = null;
  let responseStatus = null;
  const mockRes = {
    status(code) {
      responseStatus = code;
      return {
        json(data) {
          responseData = data;
        },
      };
    },
  };
  const mockReqFail = { body: {} };
  const mockNextFail = () => {};
  validate(schema)(mockReqFail, mockRes, mockNextFail);
  assert.equal(responseStatus, 400);
  assert.ok(responseData.message);
  assert.ok(Array.isArray(responseData.errors));
  assert.equal(responseData.message, "Thiếu tiêu đề dịch vụ.");

  // Test strip unknown keys
  let nextCalled = false;
  const mockReqPass = {
    body: {
      title: "Tiệc cưới Hoàng Gia",
      unknown_field_attack: "malicious_payload",
      admin_id: "fake_id",
    },
  };
  validate(schema)(mockReqPass, mockRes, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(mockReqPass.body.title, "Tiệc cưới Hoàng Gia");
  assert.equal(mockReqPass.body.unknown_field_attack, undefined, "Unknown fields must be stripped");
  assert.equal(mockReqPass.body.admin_id, undefined, "Unknown fields must be stripped");
}

// 2. Services Schema
{
  const valid = createServiceSchema.parse({
    title: "Tiệc thôi nôi",
    items: "Bóng bay, Bàn ghế, Bánh kem",
    featured: "true",
  });
  assert.deepEqual(valid.items, ["Bóng bay", "Bàn ghế", "Bánh kem"]);
  assert.equal(valid.featured, true);

  const partial = updateServiceSchema.parse({
    brand: "PiKids",
  });
  assert.equal(partial.brand, "PiKids");
}

// 3. Projects Schema
{
  assert.throws(() => createProjectSchema.parse({}), /Thiếu tên dự án/);
  assert.throws(() => createProjectSchema.parse({ title: "Test", price_tier: "cheap" }), /Hạng mục giá không hợp lệ/);
  assert.throws(() => createProjectSchema.parse({ title: "Test", status: "archived" }), /Trạng thái không hợp lệ/);

  const valid = createProjectSchema.parse({
    title: "Lễ cưới Golden Crown",
    price_tier: "premium",
    status: "active",
    style_tags: "Rustic, Classic",
  });
  assert.equal(valid.price_tier, "premium");
  assert.deepEqual(valid.style_tags, ["Rustic", "Classic"]);
}

// 4. Testimonials Schema
{
  assert.throws(() => createTestimonialSchema.parse({}), /Thiếu tên tác giả hoặc nội dung đánh giá/);
  assert.throws(() => updateTestimonialSchema.parse({ status: "invalid" }), /Trạng thái phê duyệt không hợp lệ/);

  const valid = createTestimonialSchema.parse({
    author: "Nguyễn Văn A",
    quote: "Dịch vụ rất chu đáo!",
    rating: "5",
  });
  assert.equal(valid.author, "Nguyễn Văn A");
  assert.equal(valid.rating, 5);

  const updated = updateTestimonialSchema.parse({ status: "approved" });
  assert.equal(updated.status, "approved");
}

// 5. Quotations Schema
{
  assert.throws(() => createQuotationSchema.parse({}), /Thiếu lead_id hoặc danh sách hạng mục báo giá/);
  assert.throws(
    () => createQuotationSchema.parse({
      lead_id: "lead-1",
      items: [{ description: "Hoa", quantity: -1, unit_price: 100 }],
    }),
    /Số lượng phải >= 0/
  );

  const valid = createQuotationSchema.parse({
    lead_id: "lead-1",
    items: [{ description: "Cổng hoa", quantity: 2, unit_price: 1500000 }],
    discount: 200000,
  });
  assert.equal(valid.items.length, 1);
  assert.equal(valid.discount, 200000);

  // Status mapping rejected -> declined
  const rejectedPatch = updateQuotationSchema.parse({ status: "rejected" });
  assert.equal(rejectedPatch.status, "declined");

  const acceptedPatch = updateQuotationSchema.parse({ status: "accepted" });
  assert.equal(acceptedPatch.status, "accepted");
}

// 6. Studio Schemas
{
  // publishTemplate with camelCase
  const pub = publishTemplateSchema.parse({
    name: "Phông Cưới",
    svg_base: "<svg></svg>",
    slots: [
      {
        slotKey: "drape_center",
        label: "Rèm giữa",
        slotType: "drape",
        normX: 0.5,
        normY: 0.5,
      },
    ],
    rules: [
      {
        ruleName: "Rule 1",
        conditionSlot: "slot_a",
        targetSlot: "slot_b",
        action: "hide",
      },
    ],
  });
  assert.equal(pub.slots[0].slot_key, "drape_center");
  assert.equal(pub.slots[0].slot_type, "drape");
  assert.equal(pub.rules[0].condition_slot, "slot_a");
  assert.equal(pub.rules[0].target_slot, "slot_b");

  // createSlot
  assert.throws(() => createSlotSchema.parse({}), /Thiếu thông tin slot_key, label/);

  // createAsset
  assert.throws(() => createAssetSchema.parse({}), /Thiếu loại asset/);

  // createRule
  assert.throws(() => createRuleSchema.parse({}), /Thiếu thông tin điều kiện hoặc hành động/);
}

// 7. Leads PATCH and Lead Activity
{
  const leadPatch = updateLeadStatusSchema.parse({
    status: "contacted",
    design_snapshot: { theme: "Gold" },
    malicious_column: "drop table",
  });
  assert.equal(leadPatch.status, "contacted");
  assert.deepEqual(leadPatch.design_snapshot, { theme: "Gold" });
  assert.equal(leadPatch.malicious_column, undefined, "Must strip malicious column");

  assert.throws(() => updateLeadStatusSchema.parse({ status: "bogus" }), /Trạng thái không hợp lệ/);

  const activity = createLeadActivitySchema.parse({
    activity_type: "call",
    body: "Đã liên hệ tư vấn sơ bộ",
  });
  assert.equal(activity.activity_type, "call");
  assert.throws(() => createLeadActivitySchema.parse({ activity_type: "hack" }), /Loại hoạt động không hợp lệ/);
}

// 8. Auth Refresh
{
  assert.throws(() => refreshTokenSchema.parse({}), /Thiếu refresh token/);
  const token = refreshTokenSchema.parse({ refresh_token: "valid_token_xyz" });
  assert.equal(token.refresh_token, "valid_token_xyz");
}

console.log("ALL P06 validation tests passed successfully!");
