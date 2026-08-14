import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createLeadSchema, updateLeadStatusSchema } from "../../schemas/leads.schema.js";

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
  let leads = await db.get("leads");
  leads = [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const { q, status, page = 1, limit = 20 } = req.query;

  if (q && typeof q === "string" && q.trim()) {
    const term = q.trim().toLowerCase();
    leads = leads.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(term)) ||
        (l.phone && l.phone.toLowerCase().includes(term)) ||
        (l.email && l.email.toLowerCase().includes(term))
    );
  }

  if (status && typeof status === "string" && status.trim() && status !== "all") {
    leads = leads.filter((l) => l.status === status.trim());
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const total = leads.length;

  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = leads.slice(startIndex, startIndex + limitNum);

  res.json({
    data: paginatedData,
    total,
    page: pageNum,
    limit: limitNum,
  });
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
leadsRouter.post("/:id/activities", verifyToken, requireAdmin, async (req, res) => {
  const leads = await db.get("leads");
  const existing = leads.find((l) => l.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }

  const { activity_type, body } = req.body ?? {};
  const CLIENT_ALLOWED_TYPES = ["note", "call", "email"];

  if (!activity_type || !CLIENT_ALLOWED_TYPES.includes(activity_type)) {
    return res.status(400).json({ message: "Loại hoạt động không hợp lệ." });
  }

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

// PATCH /api/leads/:id — update status (Mới / Đã liên hệ / Đã chốt) + log activity.
leadsRouter.patch("/:id", verifyToken, requireAdmin, validate(updateLeadStatusSchema), async (req, res) => {
  const { status } = req.body ?? {};

  const leads = await db.get("leads");
  const existing = leads.find((l) => l.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }

  // If status is unchanged, return existing record without logging duplicate activity
  if (existing.status === status) {
    return res.json(existing);
  }

  const oldStatus = existing.status;
  const updated = await db.update("leads", (l) => l.id === req.params.id, { status });

  if (updated && oldStatus !== status) {
    await db.insert("lead_activities", {
      id: uuid(),
      lead_id: req.params.id,
      admin_id: req.user?.sub ?? null,
      activity_type: "status_change",
      body: `Trạng thái chuyển từ "${oldStatus}" sang "${status}"`,
      metadata: { from: oldStatus, to: status },
      created_at: new Date().toISOString(),
    });
  }

  res.json(updated);
});
