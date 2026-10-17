import { studioService } from "./studio.service.js";
import { logger } from "../../config/logger.js";

export const studioController = {
  // Templates
  async getTemplates(_req, res, next) {
    try {
      const templates = await studioService.getActiveTemplates();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  },

  async getAdminTemplates(_req, res, next) {
    try {
      const templates = await studioService.getAllTemplates();
      res.json(templates);
    } catch (err) {
      next(err);
    }
  },

  async updateTemplate(req, res, next) {
    try {
      const updated = await studioService.updateTemplate(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async publishTemplate(req, res, _next) {
    try {
      const result = await studioService.publishTemplate(req.params.id, req.body);
      res.json(result);
    } catch (err) {
      logger.error({ err }, "Error in publish/draft template endpoint");
      res.status(500).json({
        message: "Lỗi hệ thống khi lưu template: " + (err.message || "Không thể truy vấn CSDL"),
      });
    }
  },

  async deleteTemplate(req, res, next) {
    try {
      const success = await studioService.deleteTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy template." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  // Slots
  async getSlots(req, res, next) {
    try {
      const slots = await studioService.getSlotsByTemplateId(req.params.id);
      res.json(slots);
    } catch (err) {
      next(err);
    }
  },

  async deleteSlot(req, res, next) {
    try {
      const removed = await studioService.deleteSlot(req.params.slotId);
      if (!removed) {
        return res.status(404).json({ message: "Không tìm thấy slot definition." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  // Assets
  async getAdminAssets(_req, res, next) {
    try {
      const assets = await studioService.getAllAssets();
      res.json(assets);
    } catch (err) {
      next(err);
    }
  },

  // Rules
  async getRules(req, res, next) {
    try {
      const rules = await studioService.getRulesByTemplateId(req.params.id);
      res.json(rules);
    } catch (err) {
      next(err);
    }
  },
};
