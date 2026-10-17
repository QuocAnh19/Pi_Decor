import { Router } from "express";
import { venuesController } from "./venues.controller.js";
import { createVenueSchema, updateVenueSchema } from "./venues.schema.js";
import { createProjectSchema } from "../projects/projects.schema.js";
import { projectUpload } from "../projects/projects.service.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate, validateIdParam } from "../../shared/validate.js";

export const venuesRouter = Router();

venuesRouter.get("/", venuesController.getVenues);
venuesRouter.get("/search", venuesController.searchVenues);
venuesRouter.get("/:id", validateIdParam, venuesController.getVenueById);
venuesRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  validate(createVenueSchema),
  venuesController.createVenue
);
venuesRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  validate(updateVenueSchema),
  venuesController.updateVenue
);
venuesRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  venuesController.deleteVenue
);
venuesRouter.post(
  "/:id/projects",
  verifyToken,
  requireAdmin,
  validateIdParam,
  projectUpload,
  validate(createProjectSchema),
  venuesController.createProjectUnderVenue
);
