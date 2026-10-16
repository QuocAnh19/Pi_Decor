import { authService } from "./auth.service.js";

export const authController = {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async logoutAll(req, res, next) {
    try {
      const result = await authService.logoutAll(req.user.sub);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user.sub);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req, res, next) {
    try {
      const result = await authService.updateMe(req.user.sub, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getAdmins(req, res, next) {
    try {
      const result = await authService.getAllAdmins();
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async createAdmin(req, res, next) {
    try {
      const result = await authService.createAdmin(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async deleteAdmin(req, res, next) {
    try {
      await authService.deleteAdmin(req.params.id, req.user?.sub);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
