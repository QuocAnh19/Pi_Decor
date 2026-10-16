import { authRequest } from "../http";
import type { Quotation, QuotationPayload } from "../types";

export const quotationsApi = {
  getQuotations: (leadId?: string) =>
    authRequest<Quotation[]>(
      leadId ? `/quotations?lead_id=${encodeURIComponent(leadId)}` : "/quotations"
    ),

  createQuotation: (payload: QuotationPayload) =>
    authRequest<Quotation>("/quotations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateQuotation: (id: string, payload: Partial<QuotationPayload> & { status?: string }) =>
    authRequest<Quotation>(`/quotations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
