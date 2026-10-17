import { Router } from "express";
import { authController } from "./auth.controller.js";
import {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  createAdminSchema,
  updateMeSchema,
} from "./auth.schema.js";
import { validate, validateIdParam } from "../../shared/validate.js";
import { verifyToken, requireAdmin, requireOwner } from "../../shared/verifyToken.js";
import { refreshLimiter, loginLimiter } from "../../shared/rateLimiter.js";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", refreshLimiter, validate(refreshTokenSchema), authController.refresh);
authRouter.post("/logout", validate(logoutSchema), authController.logout);
authRouter.post("/logout-all", verifyToken, requireAdmin, authController.logoutAll);
authRouter.get("/me", verifyToken, requireAdmin, authController.getMe);
authRouter.patch(
  "/me",
  verifyToken,
  requireAdmin,
  validate(updateMeSchema),
  authController.updateMe
);

authRouter.get("/admins", verifyToken, requireAdmin, authController.getAdmins);
authRouter.post(
  "/admins",
  verifyToken,
  requireOwner,
  validate(createAdminSchema),
  authController.createAdmin
);
authRouter.delete(
  "/admins/:id",
  verifyToken,
  requireOwner,
  validateIdParam,
  authController.deleteAdmin
);
