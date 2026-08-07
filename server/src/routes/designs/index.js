import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";

export const designsRouter = Router();

// POST /api/designs — save a full layer set (from the Konva/Zustand store)
// tied to a lead, so a customer can come back and keep editing instead of
// only ever exporting a one-shot PNG/PDF (Mục 3.2 of the technical proposal).
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
  res.status(201).json(design);
});

// GET /api/designs/:leadId — reload every saved design for a given lead.
designsRouter.get("/:leadId", async (req, res) => {
  const designs = await db.get("designs");
  res.json(designs.filter((d) => d.lead_id === req.params.leadId));
});
