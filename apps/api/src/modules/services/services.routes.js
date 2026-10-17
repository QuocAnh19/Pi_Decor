import { Router } from "express";
import { servicesController } from "./services.controller.js";
import { serviceUpload } from "./services.service.js";
import { createServiceSchema, updateServiceSchema } from "./services.schema.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate, validateIdParam } from "../../shared/validate.js";

export const servicesRouter = Router();

servicesRouter.get("/", servicesController.getServices);
servicesRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  serviceUpload,
  validate(createServiceSchema),
  servicesController.createService
);
servicesRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  serviceUpload,
  validate(updateServiceSchema),
  servicesController.updateService
);
servicesRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  servicesController.deleteService
);
