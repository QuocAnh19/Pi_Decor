import { quotationsService } from "./quotations.service.js";

export const quotationsController = {
  async createQuotation(req, res, next) {
    try {
      const quotation = await quotationsService.createQuotation(req.body, req.user?.sub);
      res.status(201).json(quotation);
    } catch (err) {
      next(err);
    }
  },

  async getQuotations(req, res, next) {
    try {
      const list = await quotationsService.getQuotations(req.query.lead_id);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  async getQuotationById(req, res, next) {
    try {
      const quotation = await quotationsService.getQuotationById(req.params.id);
      res.json(quotation);
    } catch (err) {
      next(err);
    }
  },

  async updateQuotation(req, res, next) {
    try {
      const updated = await quotationsService.updateQuotation(
        req.params.id,
        req.body,
        req.user?.sub
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteQuotation(req, res, next) {
    try {
      await quotationsService.deleteQuotation(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
