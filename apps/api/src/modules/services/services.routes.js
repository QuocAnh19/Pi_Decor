import { Router } from "express";
import { servicesController } from "./services.controller.js";
import { createServiceSchema, updateServiceSchema } from "./services.schema.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate } from "../../shared/validate.js";

export const servicesRouter = Router();

servicesRouter.get("/", servicesController.getServices);
servicesRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  validate(createServiceSchema),
  servicesController.createService
);
servicesRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validate(updateServiceSchema),
  servicesController.updateService
);
servicesRouter.delete("/:id", verifyToken, requireAdmin, servicesController.deleteService);
