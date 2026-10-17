import { Router } from "express";
import { studioController } from "./studio.controller.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate, validateIdParam } from "../../shared/validate.js";
import { slotIdParamSchema } from "@pidecor/shared";
import { updateTemplateSchema, publishTemplateSchema } from "./studio.schema.js";

export const studioRouter = Router();

// Templates
studioRouter.get("/templates", studioController.getTemplates);
studioRouter.get("/templates/admin", verifyToken, requireAdmin, studioController.getAdminTemplates);
studioRouter.patch(
  "/templates/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  validate(updateTemplateSchema),
  studioController.updateTemplate
);
studioRouter.put(
  "/templates/:id/publish",
  verifyToken,
  requireAdmin,
  validateIdParam,
  validate(publishTemplateSchema),
  studioController.publishTemplate
);
studioRouter.delete(
  "/templates/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  studioController.deleteTemplate
);

// Slot Definitions
studioRouter.get("/templates/:id/slots", validateIdParam, studioController.getSlots);
studioRouter.delete(
  "/slots/:slotId",
  verifyToken,
  requireAdmin,
  validate(slotIdParamSchema, "params"),
  studioController.deleteSlot
);

// Studio Assets
studioRouter.get("/assets/admin", verifyToken, requireAdmin, studioController.getAdminAssets);

// Slot Rules
studioRouter.get("/templates/:id/rules", validateIdParam, studioController.getRules);
