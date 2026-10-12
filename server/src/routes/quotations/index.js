import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db, pool } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";

export const quotationsRouter = Router();

// All quotation endpoints require admin authentication
quotationsRouter.use(verifyToken, requireAdmin);

/**
 * Calculates subtotal and total for quotation items.
 * Subtotal is calculated strictly on the server by multiplying quantity * unit_price.
 */
function calculateTotals(items = [], discountInput = 0) {
  const normalizedItems = (Array.isArray(items) ? items : []).map((item) => {
    const qty = Math.max(0, Number(item.quantity ?? 1));
    const price = Math.max(0, Number(item.unit_price ?? 0));
    return {
      description: String(item.description ?? "").trim(),
      quantity: qty,
      unit_price: price,
      subtotal: qty * price,
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.max(0, Number(discountInput ?? 0));
  const total = Math.max(0, subtotal - discount);

  return { items: normalizedItems, subtotal, discount, total };
}

/**
 * Sinh số báo giá tuần tự nguyên tử theo định dạng BG-YYYY-XXXX.
 * Sử dụng bảng quotation_counters với upsert + returning để tránh race condition
 * và không bị trùng số khi xoá bản ghi nháp.
 */
async function generateQuotationNumber() {
  const currentYear = new Date().getFullYear();
  const { rows } = await pool.query(
    `insert into quotation_counters (year, last_seq)
     values ($1, 1)
     on conflict (year) do update
     set last_seq = quotation_counters.last_seq + 1
     returning last_seq`,
    [currentYear]
  );
  const nextSeq = rows[0].last_seq;
  const seqPadded = String(nextSeq).padStart(4, "0");

  return `BG-${currentYear}-${seqPadded}`;
}

// POST /api/quotations — Create new quotation for a lead
quotationsRouter.post("/", async (req, res) => {
  const { lead_id, items, discount, valid_until, notes } = req.body ?? {};

  if (!lead_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Thiếu lead_id hoặc danh sách hạng mục báo giá (items)." });
  }

  const existingLead = await db.findById("leads", lead_id);
  if (!existingLead) {
    return res.status(404).json({ message: "Không tìm thấy lead tương ứng." });
  }

  const { items: calculatedItems, subtotal, discount: numDiscount, total } = calculateTotals(items, discount);

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const quotation_number = await generateQuotationNumber();

    const quotation = {
      id: uuid(),
      lead_id,
      admin_id: req.user?.sub ?? null,
      quotation_number,
      items: calculatedItems,
      subtotal,
      discount: numDiscount,
      total,
      status: "draft",
      valid_until: valid_until ?? null,
      notes: notes ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await db.insert("quotations", quotation);
      return res.status(201).json(quotation);
    } catch (err) {
      // Mã lỗi 23505: unique_violation trong Postgres (trùng quotation_number)
      if (err.code === "23505" && attempt < maxRetries) {
        console.warn(`[quotations] Trùng quotation_number (${quotation_number}), thử lại lần ${attempt + 1}...`);
        continue;
      }
      throw err;
    }
  }
});

// GET /api/quotations — List all quotations, optionally filtered by ?lead_id=...
quotationsRouter.get("/", async (req, res) => {
  let list = await db.get("quotations");
  if (req.query.lead_id) {
    const leadId = String(req.query.lead_id).trim();
    list = list.filter((q) => q.lead_id === leadId);
  }
  res.json([...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
});

// GET /api/quotations/:id — Get detail of a specific quotation
quotationsRouter.get("/:id", async (req, res) => {
  const quotations = await db.get("quotations");
  const match = quotations.find((q) => q.id === req.params.id);
  if (!match) {
    return res.status(404).json({ message: "Không tìm thấy báo giá." });
  }
  res.json(match);
});

// PATCH /api/quotations/:id — Update quotation items, status, valid_until, or notes
quotationsRouter.patch("/:id", async (req, res) => {
  const quotations = await db.get("quotations");
  const existing = quotations.find((q) => q.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy báo giá." });
  }

  const patch = { ...req.body };
  const itemsToUse = patch.items !== undefined ? patch.items : existing.items;
  const discountToUse = patch.discount !== undefined ? patch.discount : existing.discount;

  const { items: calculatedItems, subtotal, discount: numDiscount, total } = calculateTotals(itemsToUse, discountToUse);
  patch.items = calculatedItems;
  patch.subtotal = subtotal;
  patch.discount = numDiscount;
  patch.total = total;

  const oldStatus = existing.status;
  const updated = await db.updateById("quotations", req.params.id, patch);

  // If status transitions to 'sent', log a lead activity
  if (updated && patch.status === "sent" && oldStatus !== "sent") {
    try {
      await db.insert("lead_activities", {
        id: uuid(),
        lead_id: existing.lead_id,
        admin_id: req.user?.sub ?? null,
        activity_type: "quotation_sent",
        body: `Đã gửi báo giá ${existing.quotation_number} (Tổng: ${total.toLocaleString("vi-VN")} đ)`,
        metadata: { quotation_id: existing.id, quotation_number: existing.quotation_number, total },
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Failed to log quotation_sent lead_activity:", err);
    }
  }

  res.json(updated);
});

// DELETE /api/quotations/:id — Delete a draft quotation (only allowed if status === 'draft')
quotationsRouter.delete("/:id", async (req, res) => {
  const quotations = await db.get("quotations");
  const existing = quotations.find((q) => q.id === req.params.id);
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy báo giá." });
  }

  if (existing.status !== "draft") {
    return res.status(403).json({ message: "Chỉ được xóa báo giá ở trạng thái nháp (draft)." });
  }

  await db.removeById("quotations", req.params.id);
  res.status(204).send();
});
