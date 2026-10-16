import { Router } from "express";
import { quotationsController } from "./quotations.controller.js";
import { createQuotationSchema, updateQuotationSchema } from "./quotations.schema.js";
import { verifyToken, requireAdmin } from "../../shared/verifyToken.js";
import { validate } from "../../shared/validate.js";

export const quotationsRouter = Router();

quotationsRouter.use(verifyToken, requireAdmin);

quotationsRouter.post("/", validate(createQuotationSchema), quotationsController.createQuotation);
quotationsRouter.get("/", quotationsController.getQuotations);
quotationsRouter.get("/:id", quotationsController.getQuotationById);
quotationsRouter.patch(
  "/:id",
  validate(updateQuotationSchema),
  quotationsController.updateQuotation
);
quotationsRouter.delete("/:id", quotationsController.deleteQuotation);
