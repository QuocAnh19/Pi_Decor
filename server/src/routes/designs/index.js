import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";

export const designsRouter = Router();

// POST /api/designs — save a full layer set tied to a lead
designsRouter.post("/", async (req, res) => {
  const { lead_id, layers, thumbnail_url } = req.body ?? {};
  if (!lead_id || !Array.isArray(layers)) {
    return res.status(400).json({ message: "Thiếu lead_id hoặc layers." });
  }

  const design = {
    id: uuid(),
    lead_id,
    layers,
    thumbnail_url: thumbnail_url ?? null,
    created_at: new Date().toISOString(),
  };
  await db.insert("designs", design);

  // Automatically log a design_saved activity for this lead
  try {
    await db.insert("lead_activities", {
      id: uuid(),
      lead_id,
      admin_id: null,
      activity_type: "design_saved",
      body: "Khách hàng đã lưu phối cảnh thiết kế mới",
      metadata: { design_id: design.id },
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Failed to insert design_saved lead_activity:", err);
  }

  res.status(201).json(design);
});

// GET /api/designs/:leadId — reload every saved design for a given lead.
designsRouter.get("/:leadId", async (req, res) => {
  const designs = await db.get("designs");
  res.json(designs.filter((d) => d.lead_id === req.params.leadId));
});
