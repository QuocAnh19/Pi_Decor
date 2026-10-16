import { venuesService } from "./venues.service.js";

export const venuesController = {
  async getVenues(req, res, next) {
    try {
      const venues = await venuesService.getVenues(req.query.city);
      res.json(venues);
    } catch (err) {
      next(err);
    }
  },

  async searchVenues(req, res, next) {
    try {
      const results = await venuesService.searchVenues(req.query.q);
      res.json(results);
    } catch (err) {
      next(err);
    }
  },

  async getVenueById(req, res, next) {
    try {
      const venue = await venuesService.getVenueById(req.params.id);
      res.json(venue);
    } catch (err) {
      next(err);
    }
  },

  async createVenue(req, res, next) {
    try {
      const created = await venuesService.createVenue(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async updateVenue(req, res, next) {
    try {
      const updated = await venuesService.updateVenue(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteVenue(req, res, next) {
    try {
      const success = await venuesService.deleteVenue(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy địa điểm." });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async createProjectUnderVenue(req, res, next) {
    try {
      const project = await venuesService.createProjectUnderVenue(
        req.params.id,
        req.body,
        req.files,
        req
      );
      res.status(201).json(project);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      next(err);
    }
  },
};
