import { validate } from "../middlewares/validate.js";
import { uuidParamSchema } from "@pidecor/shared";

export { validate };
export const validateIdParam = validate(uuidParamSchema, "params");
