import { testimonialsService } from "./testimonials.service.js";

export const testimonialsController = {
  async getPublicTestimonials(_req, res, next) {
    try {
      const list = await testimonialsService.getPublicTestimonials();
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  async getAdminTestimonials(req, res, next) {
    try {
      const list = await testimonialsService.getAdminTestimonials(req.query.status);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  async createTestimonial(req, res, next) {
    try {
      const created = await testimonialsService.createTestimonial(req.body, req.files, req);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async updateTestimonial(req, res, next) {
    try {
      const updated = await testimonialsService.updateTestimonial(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteTestimonial(req, res, next) {
    try {
      const success = await testimonialsService.deleteTestimonial(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
