import { Router } from "express";
import { leadsController } from "./leads.controller.js";
import {
  createLeadSchema,
  updateLeadStatusSchema,
  createLeadActivitySchema,
} from "./leads.schema.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate } from "../../shared/validate.js";
import { leadsLimiter } from "../../shared/rateLimiter.js";

export const leadsRouter = Router();

leadsRouter.post("/", leadsLimiter, validate(createLeadSchema), leadsController.createLead);
leadsRouter.get("/", verifyToken, requireAdmin, leadsController.getLeads);
leadsRouter.get("/:id", verifyToken, requireAdmin, leadsController.getLeadById);
leadsRouter.get("/:id/activities", verifyToken, requireAdmin, leadsController.getLeadActivities);
leadsRouter.post(
  "/:id/activities",
  verifyToken,
  requireAdmin,
  validate(createLeadActivitySchema),
  leadsController.addLeadActivity
);
leadsRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validate(updateLeadStatusSchema),
  leadsController.updateLead
);
