import { Router } from "express";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import {
  createLeadSchema,
  updateLeadStatusSchema,
  createLeadActivitySchema,
} from "../../schemas/leads.schema.js";
import { logLeadActivity } from "../../services/activity.service.js";
import { leadsLimiter } from "../../middlewares/rateLimiters.js";

export const leadsRouter = Router();

// POST /api/leads — public. Called by the Footer contact form AND by the Studio flow.
leadsRouter.post("/", leadsLimiter, validate(createLeadSchema), async (req, res) => {
  const { name, phone, email, wedding_date, message, design_snapshot } = req.body ?? {};

  const cleanEmail = email && typeof email === "string" && email.trim() ? email.trim() : null;
  const cleanDate =
    wedding_date && typeof wedding_date === "string" && wedding_date.trim()
      ? wedding_date.trim()
      : null;
  const cleanMessage =
    message && typeof message === "string" && message.trim() ? message.trim() : null;

  const leadData = {
    name: typeof name === "string" ? name.trim() : name,
    phone: typeof phone === "string" ? phone.trim() : phone,
    email: cleanEmail,
    wedding_date: cleanDate,
    message: cleanMessage,
    design_snapshot: design_snapshot ?? null,
    status: "new", // new | contacted | closed
    consent_at: new Date(),
    consent_version:
      typeof req.body?.consent_version === "string" ? req.body.consent_version.trim() : "v1.0",
  };

  const created = await db.insert("leads", leadData);
  res.status(201).json({ id: created.id });
});

function escapeLike(str) {
  return str.replace(/[%_\\]/g, "\\$&");
}

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
    const escaped = escapeLike(q.trim().toLowerCase());
    const term = `%${escaped}%`;
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
  const [{ n: total }] = await db.query(`select count(*)::int as n from leads ${whereStr}`, values);

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
  const existing = await db.findById("leads", req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }
  res.json(existing);
});

// GET /api/leads/:id/activities — get timeline activities for a lead (newest first). Admin-only.
leadsRouter.get("/:id/activities", verifyToken, requireAdmin, async (req, res) => {
  const existing = await db.findById("leads", req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy lead." });
  }

  const leadActs = await db.query(
    `select * from lead_activities where lead_id = $1 order by created_at desc`,
    [req.params.id]
  );

  res.json(leadActs);
});

// POST /api/leads/:id/activities — add a note/call/email activity log for a lead. Admin-only.
leadsRouter.post(
  "/:id/activities",
  verifyToken,
  requireAdmin,
  validate(createLeadActivitySchema),
  async (req, res) => {
    const existing = await db.findById("leads", req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy lead." });
    }

    const { activity_type, body } = req.body;

    const activity = await logLeadActivity({
      leadId: req.params.id,
      adminId: req.user?.sub ?? null,
      type: activity_type,
      body: body ?? null,
    });

    res.status(201).json(activity);
  }
);

// PATCH /api/leads/:id — update status (Mới / Đã liên hệ / Đã chốt) or design_snapshot + log activity.
leadsRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validate(updateLeadStatusSchema),
  async (req, res) => {
    const existing = await db.findById("leads", req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy lead." });
    }

    const patch = { ...req.body };

    if (Object.keys(patch).length === 0) {
      return res.json(existing);
    }

    const updated = await db.updateById("leads", req.params.id, patch);

    if (patch.status && existing.status !== patch.status) {
      await logLeadActivity({
        leadId: req.params.id,
        adminId: req.user?.sub ?? null,
        type: "status_change",
        body: `Trạng thái chuyển từ "${existing.status}" sang "${patch.status}"`,
        metadata: { from: existing.status, to: patch.status },
      });
    }

    if (patch.design_snapshot) {
      await logLeadActivity({
        leadId: req.params.id,
        adminId: req.user?.sub ?? null,
        type: "note",
        body: "Admin đã tinh chỉnh & cập nhật bản phối cảnh Studio cho khách hàng",
        metadata: { updated_by: "admin" },
      });
    }

    res.json(updated);
  }
);
