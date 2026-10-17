import { Router } from "express";
import { testimonialsController } from "./testimonials.controller.js";
import { createTestimonialSchema, updateTestimonialSchema } from "./testimonials.schema.js";
import { uploadImage } from "../../utils/uploadImage.js";
import { testimonialLimiter } from "../../shared/rateLimiter.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate, validateIdParam } from "../../shared/validate.js";

export const testimonialsRouter = Router();

testimonialsRouter.get("/", testimonialsController.getPublicTestimonials);
testimonialsRouter.get(
  "/admin",
  verifyToken,
  requireAdmin,
  testimonialsController.getAdminTestimonials
);
testimonialsRouter.post(
  "/",
  testimonialLimiter,
  uploadImage.array("photos", 3),
  validate(createTestimonialSchema),
  testimonialsController.createTestimonial
);
testimonialsRouter.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  validate(updateTestimonialSchema),
  testimonialsController.updateTestimonial
);
testimonialsRouter.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validateIdParam,
  testimonialsController.deleteTestimonial
);
