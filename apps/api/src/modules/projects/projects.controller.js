import { projectsService } from "./projects.service.js";

export const projectsController = {
  async getPublishedProjects(_req, res, next) {
    try {
      const projects = await projectsService.getPublishedProjects();
      res.json(projects);
    } catch (err) {
      next(err);
    }
  },

  async getAllProjects(_req, res, next) {
    try {
      const projects = await projectsService.getAllProjects();
      res.json(projects);
    } catch (err) {
      next(err);
    }
  },

  async createProject(req, res, next) {
    try {
      const project = await projectsService.createProject(req.body, req.files, req);
      res.status(201).json(project);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      next(err);
    }
  },

  async updateProject(req, res, next) {
    try {
      const updated = await projectsService.updateProject(req.params.id, req.body, req.files, req);
      res.json(updated);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      next(err);
    }
  },

  async deleteProject(req, res, next) {
    try {
      const success = await projectsService.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy dự án." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
