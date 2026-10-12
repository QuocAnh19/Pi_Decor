import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import {
  createLeadSchema,
  updateLeadStatusSchema,
  createLeadActivitySchema,
} from "../../schemas/leads.schema.js";

import { leadsLimiter } from "../../middlewares/rateLimiters.js";

export const leadsRouter = Router();

// POST /api/leads — public. Called by the Footer contact form AND by the Studio flow.
leadsRouter.post("/", leadsLimiter, validate(createLeadSchema), async (req, res) => {
  const { name, phone, email, wedding_date, message, design_snapshot } = req.body ?? {};

  const cleanEmail = email && typeof email === "string" && email.trim() ? email.trim() : null;
  const cleanDate = wedding_date && typeof wedding_date === "string" && wedding_date.trim() ? wedding_date.trim() : null;
  const cleanMessage = message && typeof message === "string" && message.trim() ? message.trim() : null;

  const lead = {
    id: uuid(),
    name: typeof name === "string" ? name.trim() : name,
    phone: typeof phone === "string" ? phone.trim() : phone,
    email: cleanEmail,
    wedding_date: cleanDate,
    message: cleanMessage,
    design_snapshot: design_snapshot ?? null,
    status: "new", // new | contacted | closed
    created_at: new Date().toISOString(),
  };

  await db.insert("leads", lead);
  res.status(201).json({ id: lead.id });
});

// GET /api/leads — list with pagination & search, newest first. Admin-only.
leadsRouter.get("/", verifyToken, requireAdmin, async (req, res) => {
  const { q, status, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20)); // cap ở 100
  const offset = (pageNum - 1) * limitNum;

  // Build điều kiện WHERE động
  const conditions = [];
  const values = [];

  if (q && typeof q === "string" && q.trim()) {
    const term = `%${q.trim().toLowerCase()}%`;
    values.push(term, term, term);
    conditions.push(
      `(lower(name) like $${values.length - 2} OR lower(phone) like $${values.length - 1} OR lower(coalesce(email,'')) like $${values.length})`
    );
  }

  if (status && status !== "all") {
    values.push(status.trim());
    conditions.push(`status = $${values.length}`);
  }

  const whereStr = conditions.length ? `where ${conditions.join(" and ")}` : "";

  // Đếm tổng (cho pagination)
  const [{ n: total }] = await db.query(
    `select count(*)::int as n from leads ${whereStr}`,
    values
  );

  // Lấy page hiện tại
  const data = await db.query(
    `select * from leads ${whereStr}
     order by created_at desc
     limit $${values.length + 1} offset $${values.length + 2}`,
    [...values, limitNum, offset]
  );

  res.json({ data, total, page: pageNum, limit: limitNum });
});

// GET /api/leads/:id — get lead details by id. Admin-only.
leadsRouter.get("/:id", verifyToken, requireAdmin, async (req, res) => {
  const leads = await db.get("leads");
  const existing = leads.find((l) => l.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }
  res.json(existing);
});

// GET /api/leads/:id/activities — get timeline activities for a lead (newest first). Admin-only.
leadsRouter.get("/:id/activities", verifyToken, requireAdmin, async (req, res) => {
  const leads = await db.get("leads");
  const existing = leads.find((l) => l.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }

  const activities = await db.get("lead_activities");
  const leadActs = activities
    .filter((a) => a.lead_id === req.params.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(leadActs);
});

// POST /api/leads/:id/activities — add a note/call/email activity log for a lead. Admin-only.
leadsRouter.post("/:id/activities", verifyToken, requireAdmin, validate(createLeadActivitySchema), async (req, res) => {
  const leads = await db.get("leads");
  const existing = leads.find((l) => l.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }

  const { activity_type, body } = req.body;

  const activity = {
    id: uuid(),
    lead_id: req.params.id,
    admin_id: req.user?.sub ?? null,
    activity_type,
    body: body ?? null,
    metadata: null,
    created_at: new Date().toISOString(),
  };

  await db.insert("lead_activities", activity);
  res.status(201).json(activity);
});

// PATCH /api/leads/:id — update status (Mới / Đã liên hệ / Đã chốt) or design_snapshot + log activity.
leadsRouter.patch("/:id", verifyToken, requireAdmin, validate(updateLeadStatusSchema), async (req, res) => {
  const leads = await db.get("leads");
  const existing = leads.find((l) => l.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }

  const patch = { ...req.body };

  if (Object.keys(patch).length === 0) {
    return res.json(existing);
  }

  const updated = await db.updateById("leads", req.params.id, patch);

  if (patch.status && existing.status !== patch.status) {
    await db.insert("lead_activities", {
      id: uuid(),
      lead_id: req.params.id,
      admin_id: req.user?.sub ?? null,
      activity_type: "status_change",
      body: `Trạng thái chuyển từ "${existing.status}" sang "${patch.status}"`,
      metadata: { from: existing.status, to: patch.status },
      created_at: new Date().toISOString(),
    });
  }

  if (patch.design_snapshot) {
    await db.insert("lead_activities", {
      id: uuid(),
      lead_id: req.params.id,
      admin_id: req.user?.sub ?? null,
      activity_type: "note",
      body: "Admin đã tinh chỉnh & cập nhật bản phối cảnh Studio cho khách hàng",
      metadata: { updated_by: "admin" },
      created_at: new Date().toISOString(),
    });
  }

  res.json(updated);
});
