import { Router } from "express";
import { materialsController } from "./materials.controller.js";
import { createMaterialSchema, updateMaterialSchema } from "./materials.schema.js";
import { uploadImage } from "../../utils/uploadImage.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate, validateIdParam } from "../../shared/validate.js";

export const materialsRouter = Router();

materialsRouter.get("/", materialsController.getMaterials);
materialsRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  uploadImage.single("image"),
  validate(createMaterialSchema),
  materialsController.createMaterial
);
materialsRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  uploadImage.single("image"),
  validate(updateMaterialSchema),
  materialsController.updateMaterial
);
materialsRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  materialsController.deleteMaterial
);
