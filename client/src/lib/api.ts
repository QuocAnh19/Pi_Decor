import type {
  Admin,
  AdminSummary,
  Lead,
  LeadActivity,
  LeadStatus,
  PaginatedLeadsResponse,
  MaterialItem,
  Project,
  ProjectPayload,
  Quotation,
  QuotationPayload,
  StudioAssetRow,
  StudioSlotDefinitionRow,
  StudioSlotRuleRow,
  StudioTemplateRow,
  TestimonialItem,
  TestimonialPayload,
  Venue,
  VenueDetail,
  VenuePayload,
} from "./types";

/**
 * api.ts — the one file in the client that knows how to call the backend.
 * Base URL comes from VITE_API_URL and falls back to the local dev server.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

/**
 * Custom error class returned on non-2xx HTTP responses.
 * Provides the HTTP status code for reliable status-based branching (e.g. 401 token refresh).
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...restOptions } = options;
  const isFormData = restOptions.body instanceof FormData;
  const defaultHeaders: Record<string, string> = isFormData
    ? {}
    : { "Content-Type": "application/json" };

  const res = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: { ...defaultHeaders, ...(headers as Record<string, string>) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? `Request failed (${res.status})`, res.status);
  }
  // DELETE endpoints reply 204 with no body.
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Same as `request`, plus the admin Bearer token with auto 401 refresh retry */
async function authRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...restOptions } = options;
  try {
    return await request<T>(path, {
      ...restOptions,
      headers: { Authorization: `Bearer ${token}`, ...headers },
    });
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      const raw = sessionStorage.getItem("pidecor_admin_auth");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.refreshToken) {
            const refreshRes = await request<{ token: string }>("/auth/refresh", {
              method: "POST",
              body: JSON.stringify({ refresh_token: parsed.refreshToken }),
            });
            parsed.token = refreshRes.token;
            sessionStorage.setItem("pidecor_admin_auth", JSON.stringify(parsed));
            return await request<T>(path, {
              ...restOptions,
              headers: { Authorization: `Bearer ${refreshRes.token}`, ...headers },
            });
          }
        } catch {
          sessionStorage.removeItem("pidecor_admin_auth");
        }
      }
    }
    throw err;
  }
}

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  wedding_date?: string;
  message?: string;
  design_snapshot?: unknown;
}

export const api = {
  // ── Leads & Contact ──────────────────────────────────────────────────
  submitLead: (payload: LeadPayload) =>
    request<{ id: string }>("/leads", { method: "POST", body: JSON.stringify(payload) }),

  getLeads: (
    token: string,
    params?: { page?: number; limit?: number; q?: string; status?: string }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.q) searchParams.set("q", params.q);
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);

    const queryStr = searchParams.toString();
    return authRequest<PaginatedLeadsResponse>(`/leads${queryStr ? `?${queryStr}` : ""}`, token);
  },

  getLead: (id: string, token: string) =>
    authRequest<Lead>(`/leads/${id}`, token),

  updateLead: (
    id: string,
    payload: { status?: LeadStatus; design_snapshot?: unknown },
    token: string
  ) =>
    authRequest<Lead>(`/leads/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateLeadStatus: (id: string, status: LeadStatus, token: string) =>
    authRequest<Lead>(`/leads/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getLeadActivities: (leadId: string, token: string) =>
    authRequest<LeadActivity[]>(`/leads/${leadId}/activities`, token),

  addLeadActivity: (leadId: string, payload: { activity_type: string; body?: string }, token: string) =>
    authRequest<LeadActivity>(`/leads/${leadId}/activities`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ── Materials & Services ─────────────────────────────────────────────
  getMaterials: (category?: string) =>
    request<MaterialItem[]>(category ? `/materials?category=${encodeURIComponent(category)}` : "/materials"),

  deleteMaterial: (id: string, token: string) =>
    authRequest<void>(`/materials/${id}`, token, { method: "DELETE" }),

  getServices: () => request<unknown[]>("/services"),

  // ── Map Venues & Projects ───────────────────────────────────────────
  getVenues: () => request<Venue[]>("/venues"),

  getVenue: (id: string) => request<VenueDetail>(`/venues/${id}`),

  createVenue: (payload: VenuePayload, token: string) =>
    authRequest<Venue>("/venues", token, { method: "POST", body: JSON.stringify(payload) }),

  updateVenue: (id: string, payload: Partial<VenuePayload>, token: string) =>
    authRequest<Venue>(`/venues/${id}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteVenue: (id: string, token: string) =>
    authRequest<void>(`/venues/${id}`, token, { method: "DELETE" }),

  getProjects: () => request<Project[]>("/projects"),

  createProject: (payload: FormData | object, token: string) => {
    const isFormData = payload instanceof FormData;
    return authRequest<Project>("/projects", token, {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  createVenueProject: (venueId: string, payload: ProjectPayload, token: string) =>
    authRequest<Project>(`/venues/${venueId}/projects`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProject: (projectId: string, payload: FormData | object, token: string) => {
    const isFormData = payload instanceof FormData;
    return authRequest<Project>(`/projects/${projectId}`, token, {
      method: "PATCH",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  deleteProject: (projectId: string, token: string) =>
    authRequest<void>(`/projects/${projectId}`, token, { method: "DELETE" }),

  // ── Admin Auth & Dashboard Summary ─────────────────────────────────
  adminLogin: (payload: { email: string; password: string }) =>
    request<{ token: string; refreshToken?: string; admin: Admin }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ token: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  getMe: (token: string) => authRequest<{ admin: Admin }>("/auth/me", token),

  getSummary: (token: string) => authRequest<AdminSummary>("/admin/summary", token),

  // ── Quotations ───────────────────────────────────────────────────────
  getQuotations: (token: string, leadId?: string) =>
    authRequest<Quotation[]>(leadId ? `/quotations?lead_id=${encodeURIComponent(leadId)}` : "/quotations", token),

  getQuotation: (id: string, token: string) =>
    authRequest<Quotation>(`/quotations/${id}`, token),

  createQuotation: (payload: QuotationPayload, token: string) =>
    authRequest<Quotation>("/quotations", token, { method: "POST", body: JSON.stringify(payload) }),

  updateQuotation: (id: string, payload: Partial<QuotationPayload> & { status?: string }, token: string) =>
    authRequest<Quotation>(`/quotations/${id}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteQuotation: (id: string, token: string) =>
    authRequest<void>(`/quotations/${id}`, token, { method: "DELETE" }),

  // ── Testimonials ─────────────────────────────────────────────────────
  getTestimonials: () => request<TestimonialItem[]>("/testimonials"),

  submitTestimonial: async (payload: TestimonialPayload | FormData) => {
    if (payload instanceof FormData) {
      const res = await fetch(`${API_URL}/testimonials`, {
        method: "POST",
        body: payload,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(errorData.message || "Gửi đánh giá thất bại.", res.status);
      }
      return res.json() as Promise<TestimonialItem>;
    }
    return request<TestimonialItem>("/testimonials", { method: "POST", body: JSON.stringify(payload) });
  },

  getTestimonialsAdmin: (token: string, status?: string) =>
    authRequest<TestimonialItem[]>(status ? `/testimonials/admin?status=${encodeURIComponent(status)}` : "/testimonials/admin", token),

  updateTestimonialStatus: (id: string, status: string, token: string) =>
    authRequest<TestimonialItem>(`/testimonials/${id}`, token, { method: "PATCH", body: JSON.stringify({ status }) }),

  deleteTestimonial: (id: string, token: string) =>
    authRequest<void>(`/testimonials/${id}`, token, { method: "DELETE" }),

  // ── Studio Templates & Assets ────────────────────────────────────────
  getStudioTemplates: () => request<StudioTemplateRow[]>("/studio/templates"),

  getStudioTemplatesAdmin: (token: string) =>
    authRequest<StudioTemplateRow[]>("/studio/templates/admin", token),

  createStudioTemplate: (payload: Partial<StudioTemplateRow>, token: string) =>
    authRequest<StudioTemplateRow>("/studio/templates", token, { method: "POST", body: JSON.stringify(payload) }),

  publishStudioTemplate: (
    id: string,
    payload: {
      name: string;
      svg_base: string;
      is_active?: boolean;
      thumbnail?: string | null;
      category?: string | null;
      slots?: unknown[];
      rules?: unknown[];
      slot_config?: Record<string, unknown>;
    },
    token: string
  ) =>
    authRequest<{ message: string; template: StudioTemplateRow }>(
      `/studio/templates/${id}/publish`,
      token,
      { method: "PUT", body: JSON.stringify(payload) }
    ),

  updateStudioTemplate: (id: string, payload: Partial<StudioTemplateRow>, token: string) =>
    authRequest<StudioTemplateRow>(`/studio/templates/${id}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioTemplate: (id: string, token: string) =>
    authRequest<void>(`/studio/templates/${id}`, token, { method: "DELETE" }),

  getStudioSlotDefinitions: (templateId: string) =>
    request<StudioSlotDefinitionRow[]>(`/studio/templates/${templateId}/slots`),

  createStudioSlotDefinition: (templateId: string, payload: Partial<StudioSlotDefinitionRow>, token: string) =>
    authRequest<StudioSlotDefinitionRow>(`/studio/templates/${templateId}/slots`, token, { method: "POST", body: JSON.stringify(payload) }),

  reorderStudioSlots: (templateId: string, items: { id: string; sort_order: number }[], token: string) =>
    authRequest<StudioSlotDefinitionRow[]>(`/studio/templates/${templateId}/slots/reorder`, token, { method: "PATCH", body: JSON.stringify(items) }),

  updateStudioSlotDefinition: (slotId: string, payload: Partial<StudioSlotDefinitionRow>, token: string) =>
    authRequest<StudioSlotDefinitionRow>(`/studio/slots/${slotId}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioSlotDefinition: (slotId: string, token: string) =>
    authRequest<void>(`/studio/slots/${slotId}`, token, { method: "DELETE" }),

  getStudioAssets: () => request<StudioAssetRow[]>("/studio/assets"),

  getStudioAssetsAdmin: (token: string) =>
    authRequest<StudioAssetRow[]>("/studio/assets/admin", token),

  createStudioAsset: (payload: Partial<StudioAssetRow>, token: string) =>
    authRequest<StudioAssetRow>("/studio/assets", token, { method: "POST", body: JSON.stringify(payload) }),

  updateStudioAsset: (id: string, payload: Partial<StudioAssetRow>, token: string) =>
    authRequest<StudioAssetRow>(`/studio/assets/${id}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioAsset: (id: string, token: string) =>
    authRequest<void>(`/studio/assets/${id}`, token, { method: "DELETE" }),

  getStudioSlotRules: (templateId: string) =>
    request<StudioSlotRuleRow[]>(`/studio/templates/${templateId}/rules`),

  createStudioSlotRule: (templateId: string, payload: Partial<StudioSlotRuleRow>, token: string) =>
    authRequest<StudioSlotRuleRow>(`/studio/templates/${templateId}/rules`, token, { method: "POST", body: JSON.stringify(payload) }),

  updateStudioSlotRule: (ruleId: string, payload: Partial<StudioSlotRuleRow>, token: string) =>
    authRequest<StudioSlotRuleRow>(`/studio/rules/${ruleId}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioSlotRule: (ruleId: string, token: string) =>
    authRequest<void>(`/studio/rules/${ruleId}`, token, { method: "DELETE" }),
};
