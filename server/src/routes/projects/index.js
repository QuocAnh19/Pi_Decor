import { Router } from "express";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createProjectSchema, updateProjectSchema } from "../../schemas/projects.schema.js";
import {
  projectUpload,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projects.service.js";

export const projectsRouter = Router();

// GET /api/projects — public, list all projects
projectsRouter.get("/", async (_req, res) => {
  const projects = await db.get("projects");
  const sorted = [...projects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(sorted);
});

// POST /api/projects — admin only, create a new project
projectsRouter.post("/", verifyToken, requireAdmin, projectUpload, validate(createProjectSchema), async (req, res, next) => {
  try {
    const project = await createProject(req.body, req.files, req);
    res.status(201).json(project);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// PATCH /api/projects/:id — admin only, update project
projectsRouter.patch("/:id", verifyToken, requireAdmin, projectUpload, validate(updateProjectSchema), async (req, res, next) => {
  try {
    const updated = await updateProject(req.params.id, req.body, req.files, req);
    res.json(updated);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// DELETE /api/projects/:id — admin only, delete project
projectsRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const success = await deleteProject(req.params.id);
  if (!success) {
    return res.status(404).json({ message: "Không tìm thấy dự án." });
  }
  res.status(204).send();
});
