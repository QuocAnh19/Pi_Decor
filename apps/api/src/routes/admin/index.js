import { Router } from "express";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";

export const adminRouter = Router();

// All routes below require a valid admin JWT.
adminRouter.use(verifyToken, requireAdmin);

// GET /api/admin/summary — quick counts for the dashboard home.
adminRouter.get("/summary", async (_req, res) => {
  const [
    leadsTotal,
    leadsNew,
    designsTotal,
    materialsTotal,
    servicesTotal,
    venuesTotal,
    projectsPublishedTotal,
  ] = await Promise.all([
    db.count("leads"),
    db.count("leads", "status = $1", ["new"]),
    db.count("designs"),
    db.count("materials"),
    db.count("services"),
    db.count("venues"),
    db.count("projects", "published = true"),
  ]);

  res.json({
    leads_total: leadsTotal,
    leads_new: leadsNew,
    designs_total: designsTotal,
    materials_total: materialsTotal,
    services_total: servicesTotal,
    venues_total: venuesTotal,
    projects_published_total: projectsPublishedTotal,
  });
});
