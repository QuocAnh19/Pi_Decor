import { materialsService } from "./materials.service.js";

export const materialsController = {
  async getMaterials(req, res, next) {
    try {
      const list = await materialsService.getMaterials(req.query.category);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  async createMaterial(req, res, next) {
    try {
      const created = await materialsService.createMaterial(req.body, req.file, req);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async updateMaterial(req, res, next) {
    try {
      const updated = await materialsService.updateMaterial(req.params.id, req.body, req.file, req);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteMaterial(req, res, next) {
    try {
      const success = await materialsService.deleteMaterial(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy vật liệu." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
