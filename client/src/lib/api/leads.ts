import { request, authRequest } from "../http";
import type { Lead, LeadStatus, PaginatedLeadsResponse } from "../types";

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  wedding_date?: string;
  message?: string;
  design_snapshot?: unknown;
}

export const leadsApi = {
  submitLead: (payload: LeadPayload) =>
    request<{ id: string }>("/leads", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getLeads: (params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.q) searchParams.set("q", params.q);
    if (params?.status && params.status !== "all") {
      searchParams.set("status", params.status);
    }

    const queryStr = searchParams.toString();
    return authRequest<PaginatedLeadsResponse>(
      `/leads${queryStr ? `?${queryStr}` : ""}`
    );
  },

  getLead: (id: string) => authRequest<Lead>(`/leads/${id}`),

  updateLead: (
    id: string,
    payload: { status?: LeadStatus; design_snapshot?: unknown }
  ) =>
    authRequest<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateLeadStatus: (id: string, status: LeadStatus) =>
    authRequest<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
