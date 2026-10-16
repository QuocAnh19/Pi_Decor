import { ApiError } from "../http";
import { leadsApi, type LeadPayload } from "./leads";
import { materialsApi } from "./materials";
import { venuesApi } from "./venues";
import { authApi } from "./auth";
import { quotationsApi } from "./quotations";
import { testimonialsApi } from "./testimonials";
import { studioApi } from "./studio";

export { ApiError, type LeadPayload };

export const api = {
  ...leadsApi,
  ...materialsApi,
  ...venuesApi,
  ...authApi,
  ...quotationsApi,
  ...testimonialsApi,
  ...studioApi,
};
