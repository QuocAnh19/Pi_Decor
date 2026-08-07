import { Router } from "express";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";

export const adminRouter = Router();

// All routes below require a valid admin JWT.
adminRouter.use(verifyToken, requireAdmin);

// GET /api/admin/summary — quick counts for the dashboard home.
adminRouter.get("/summary", async (_req, res) => {
  const [leads, designs, materials, services] = await Promise.all([
    db.get("leads"),
    db.get("designs"),
    db.get("materials"),
    db.get("services"),
  ]);
  res.json({
    leads_total: leads.length,
    leads_new: leads.filter((l) => l.status === "new").length,
    designs_total: designs.length,
    materials_total: materials.length,
    services_total: services.length,
  });
});
