import { Router } from "express";
import { projectsController } from "./projects.controller.js";
import { projectUpload } from "./projects.service.js";
import { createProjectSchema, updateProjectSchema } from "./projects.schema.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate, validateIdParam } from "../../shared/validate.js";

export const projectsRouter = Router();

projectsRouter.get("/", projectsController.getPublishedProjects);
projectsRouter.get("/admin", verifyToken, requireAdmin, projectsController.getAllProjects);
projectsRouter.post(
  "/",
  verifyToken,
  requireAdmin,
  projectUpload,
  validate(createProjectSchema),
  projectsController.createProject
);
projectsRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  projectUpload,
  validate(updateProjectSchema),
  projectsController.updateProject
);
projectsRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  projectsController.deleteProject
);
