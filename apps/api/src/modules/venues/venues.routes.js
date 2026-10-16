import { Router } from "express";
import { venuesController } from "./venues.controller.js";
import { createVenueSchema, updateVenueSchema } from "./venues.schema.js";
import { createProjectSchema } from "../projects/projects.schema.js";
import { projectUpload } from "../projects/projects.service.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate } from "../../shared/validate.js";

export const venuesRouter = Router();

venuesRouter.get("/", venuesController.getVenues);
venuesRouter.get("/search", venuesController.searchVenues);
venuesRouter.get("/:id", venuesController.getVenueById);
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
  validate(updateVenueSchema),
  venuesController.updateVenue
);
venuesRouter.delete("/:id", verifyToken, requireAdmin, venuesController.deleteVenue);
venuesRouter.post(
  "/:id/projects",
  verifyToken,
  requireAdmin,
  projectUpload,
  validate(createProjectSchema),
  venuesController.createProjectUnderVenue
);
