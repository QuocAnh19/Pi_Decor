import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";

export const leadsRouter = Router();

// POST /api/leads — public. Called by the Footer contact form AND by the
// Studio "Xuất thiết kế" flow (with design_snapshot attached). This is the
// single endpoint that replaces the "ghi chú tự do" gap called out in
// Mục 1.1/3.2 of the technical proposal.
leadsRouter.post("/", async (req, res) => {
  const { name, phone, email, wedding_date, message, design_snapshot } = req.body ?? {};

  if (!name || !phone) {
    return res.status(400).json({ message: "Thiếu tên hoặc số điện thoại." });
  }

  const lead = {
    id: uuid(),
    name,
    phone,
    email: email ?? null,
    wedding_date: wedding_date ?? null,
    message: message ?? null,
    design_snapshot: design_snapshot ?? null,
    status: "new", // new | contacted | closed
    created_at: new Date().toISOString(),
  };

  await db.insert("leads", lead);
  res.status(201).json({ id: lead.id });
});

// GET /api/admin/leads — list, newest first. Admin-only.
leadsRouter.get("/", verifyToken, requireAdmin, async (_req, res) => {
  const leads = await db.get("leads");
  res.json([...leads].sort((a, b) => b.created_at.localeCompare(a.created_at)));
});

// PATCH /api/admin/leads/:id — update status (Mới / Đã liên hệ / Đã chốt).
leadsRouter.patch("/:id", verifyToken, requireAdmin, async (req, res) => {
  const { status } = req.body ?? {};
  if (!["new", "contacted", "closed"].includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });
  }
  const updated = await db.update("leads", (l) => l.id === req.params.id, { status });
  if (!updated) return res.status(404).json({ message: "Không tìm thấy lead." });
  res.json(updated);
});
