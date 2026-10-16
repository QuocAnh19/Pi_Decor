import { Router } from "express";
import { studioController } from "./studio.controller.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate } from "../../shared/validate.js";
import {
  createTemplateSchema,
  updateTemplateSchema,
  publishTemplateSchema,
  createSlotSchema,
  updateSlotSchema,
  reorderSlotsSchema,
  createAssetSchema,
  updateAssetSchema,
  createRuleSchema,
  updateRuleSchema,
} from "./studio.schema.js";

export const studioRouter = Router();

// Templates
studioRouter.get("/templates", studioController.getTemplates);
studioRouter.get("/templates/admin", verifyToken, requireAdmin, studioController.getAdminTemplates);
studioRouter.post(
  "/templates",
  verifyToken,
  requireAdmin,
  validate(createTemplateSchema),
  studioController.createTemplate
);
studioRouter.patch(
  "/templates/:id",
  verifyToken,
  requireAdmin,
  validate(updateTemplateSchema),
  studioController.updateTemplate
);
studioRouter.put(
  "/templates/:id/publish",
  verifyToken,
  requireAdmin,
  validate(publishTemplateSchema),
  studioController.publishTemplate
);
studioRouter.delete("/templates/:id", verifyToken, requireAdmin, studioController.deleteTemplate);

// Slot Definitions
studioRouter.get("/templates/:id/slots", studioController.getSlots);
studioRouter.post(
  "/templates/:id/slots",
  verifyToken,
  requireAdmin,
  validate(createSlotSchema),
  studioController.createSlot
);
studioRouter.patch(
  "/templates/:id/slots/reorder",
  verifyToken,
  requireAdmin,
  validate(reorderSlotsSchema),
  studioController.reorderSlots
);
studioRouter.patch(
  "/slots/:slotId",
  verifyToken,
  requireAdmin,
  validate(updateSlotSchema),
  studioController.updateSlot
);
studioRouter.delete("/slots/:slotId", verifyToken, requireAdmin, studioController.deleteSlot);

// Studio Assets
studioRouter.get("/assets", studioController.getAssets);
studioRouter.get("/assets/admin", verifyToken, requireAdmin, studioController.getAdminAssets);
studioRouter.post(
  "/assets",
  verifyToken,
  requireAdmin,
  validate(createAssetSchema),
  studioController.createAsset
);
studioRouter.patch(
  "/assets/:id",
  verifyToken,
  requireAdmin,
  validate(updateAssetSchema),
  studioController.updateAsset
);
studioRouter.delete("/assets/:id", verifyToken, requireAdmin, studioController.deleteAsset);

// Slot Rules
studioRouter.get("/templates/:id/rules", studioController.getRules);
studioRouter.post(
  "/templates/:id/rules",
  verifyToken,
  requireAdmin,
  validate(createRuleSchema),
  studioController.createRule
);
studioRouter.patch(
  "/rules/:ruleId",
  verifyToken,
  requireAdmin,
  validate(updateRuleSchema),
  studioController.updateRule
);
studioRouter.delete("/rules/:ruleId", verifyToken, requireAdmin, studioController.deleteRule);
