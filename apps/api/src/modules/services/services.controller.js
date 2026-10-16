import { servicesService } from "./services.service.js";

export const servicesController = {
  async getServices(_req, res, next) {
    try {
      const list = await servicesService.getAllServices();
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  async createService(req, res, next) {
    try {
      const created = await servicesService.createService(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async updateService(req, res, next) {
    try {
      const updated = await servicesService.updateService(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteService(req, res, next) {
    try {
      const success = await servicesService.deleteService(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
