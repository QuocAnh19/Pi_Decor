import { request, authRequest, ApiError, API_URL } from "./http";
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

export { ApiError, API_URL };

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

  getLeads: (params?: { page?: number; limit?: number; q?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.q) searchParams.set("q", params.q);
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);

    const queryStr = searchParams.toString();
    return authRequest<PaginatedLeadsResponse>(`/leads${queryStr ? `?${queryStr}` : ""}`);
  },

  getLead: (id: string) =>
    authRequest<Lead>(`/leads/${id}`),

  updateLead: (id: string, payload: { status?: LeadStatus; design_snapshot?: unknown }) =>
    authRequest<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateLeadStatus: (id: string, status: LeadStatus) =>
    authRequest<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getLeadActivities: (leadId: string) =>
    authRequest<LeadActivity[]>(`/leads/${leadId}/activities`),

  addLeadActivity: (leadId: string, payload: { activity_type: string; body?: string }) =>
    authRequest<LeadActivity>(`/leads/${leadId}/activities`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ── Materials & Services ─────────────────────────────────────────────
  getMaterials: (category?: string) =>
    request<MaterialItem[]>(category ? `/materials?category=${encodeURIComponent(category)}` : "/materials"),

  createMaterial: (formData: FormData) =>
    authRequest<MaterialItem>("/materials", {
      method: "POST",
      body: formData,
    }),

  updateMaterial: (id: string, formData: FormData) =>
    authRequest<MaterialItem>(`/materials/${id}`, {
      method: "PATCH",
      body: formData,
    }),

  deleteMaterial: (id: string) =>
    authRequest<void>(`/materials/${id}`, { method: "DELETE" }),

  getServices: () => request<unknown[]>("/services"),

  // ── Map Venues & Projects ───────────────────────────────────────────
  getVenues: () => request<Venue[]>("/venues"),

  getVenue: (id: string) => request<VenueDetail>(`/venues/${id}`),

  createVenue: (payload: VenuePayload) =>
    authRequest<Venue>("/venues", { method: "POST", body: JSON.stringify(payload) }),

  updateVenue: (id: string, payload: Partial<VenuePayload>) =>
    authRequest<Venue>(`/venues/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteVenue: (id: string) =>
    authRequest<void>(`/venues/${id}`, { method: "DELETE" }),

  getProjects: () => request<Project[]>("/projects"),

  getProjectsAdmin: () => authRequest<Project[]>("/projects/admin"),

  createProject: (payload: FormData | object) => {
    const isFormData = payload instanceof FormData;
    return authRequest<Project>("/projects", {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  createVenueProject: (venueId: string, payload: ProjectPayload) =>
    authRequest<Project>(`/venues/${venueId}/projects`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProject: (projectId: string, payload: FormData | object) => {
    const isFormData = payload instanceof FormData;
    return authRequest<Project>(`/projects/${projectId}`, {
      method: "PATCH",
      body: isFormData ? payload : JSON.stringify(payload),
    });
  },

  deleteProject: (projectId: string) =>
    authRequest<void>(`/projects/${projectId}`, { method: "DELETE" }),

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

  getMe: () => authRequest<{ admin: Admin }>("/auth/me"),

  updateMe: (payload: { email?: string; current_password?: string; password?: string }) =>
    authRequest<{ message: string; token: string; admin: Admin }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listAdmins: () => authRequest<Admin[]>("/auth/admins"),

  createAdmin: (payload: { email: string; password: string }) =>
    authRequest<Admin>("/auth/admins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteAdmin: (id: string) =>
    authRequest<void>(`/auth/admins/${id}`, { method: "DELETE" }),

  getSummary: () => authRequest<AdminSummary>("/admin/summary"),

  // ── Quotations ───────────────────────────────────────────────────────
  getQuotations: (leadId?: string) =>
    authRequest<Quotation[]>(leadId ? `/quotations?lead_id=${encodeURIComponent(leadId)}` : "/quotations"),

  getQuotation: (id: string) =>
    authRequest<Quotation>(`/quotations/${id}`),

  createQuotation: (payload: QuotationPayload) =>
    authRequest<Quotation>("/quotations", { method: "POST", body: JSON.stringify(payload) }),

  updateQuotation: (id: string, payload: Partial<QuotationPayload> & { status?: string }) =>
    authRequest<Quotation>(`/quotations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteQuotation: (id: string) =>
    authRequest<void>(`/quotations/${id}`, { method: "DELETE" }),

  // ── Testimonials ─────────────────────────────────────────────────────
  getTestimonials: () => request<TestimonialItem[]>("/testimonials"),

  submitTestimonial: (payload: TestimonialPayload | FormData) =>
    request<TestimonialItem>("/testimonials", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),

  getTestimonialsAdmin: (status?: string) =>
    authRequest<TestimonialItem[]>(status ? `/testimonials/admin?status=${encodeURIComponent(status)}` : "/testimonials/admin"),

  updateTestimonialStatus: (id: string, status: string) =>
    authRequest<TestimonialItem>(`/testimonials/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  deleteTestimonial: (id: string) =>
    authRequest<void>(`/testimonials/${id}`, { method: "DELETE" }),

  // ── Studio Templates & Assets ────────────────────────────────────────
  getStudioTemplates: () => request<StudioTemplateRow[]>("/studio/templates"),

  getStudioTemplatesAdmin: () =>
    authRequest<StudioTemplateRow[]>("/studio/templates/admin"),

  createStudioTemplate: (payload: Partial<StudioTemplateRow>) =>
    authRequest<StudioTemplateRow>("/studio/templates", { method: "POST", body: JSON.stringify(payload) }),

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
    }
  ) =>
    authRequest<{ message: string; template: StudioTemplateRow }>(
      `/studio/templates/${id}/publish`,
      { method: "PUT", body: JSON.stringify(payload) }
    ),

  updateStudioTemplate: (id: string, payload: Partial<StudioTemplateRow>) =>
    authRequest<StudioTemplateRow>(`/studio/templates/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioTemplate: (id: string) =>
    authRequest<void>(`/studio/templates/${id}`, { method: "DELETE" }),

  getStudioSlotDefinitions: (templateId: string) =>
    request<StudioSlotDefinitionRow[]>(`/studio/templates/${templateId}/slots`),

  createStudioSlotDefinition: (templateId: string, payload: Partial<StudioSlotDefinitionRow>) =>
    authRequest<StudioSlotDefinitionRow>(`/studio/templates/${templateId}/slots`, { method: "POST", body: JSON.stringify(payload) }),

  reorderStudioSlots: (templateId: string, items: { id: string; sort_order: number }[]) =>
    authRequest<StudioSlotDefinitionRow[]>(`/studio/templates/${templateId}/slots/reorder`, { method: "PATCH", body: JSON.stringify(items) }),

  updateStudioSlotDefinition: (slotId: string, payload: Partial<StudioSlotDefinitionRow>) =>
    authRequest<StudioSlotDefinitionRow>(`/studio/slots/${slotId}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioSlotDefinition: (slotId: string) =>
    authRequest<void>(`/studio/slots/${slotId}`, { method: "DELETE" }),

  getStudioAssets: () => request<StudioAssetRow[]>("/studio/assets"),

  getStudioAssetsAdmin: () =>
    authRequest<StudioAssetRow[]>("/studio/assets/admin"),

  createStudioAsset: (payload: Partial<StudioAssetRow>) =>
    authRequest<StudioAssetRow>("/studio/assets", { method: "POST", body: JSON.stringify(payload) }),

  updateStudioAsset: (id: string, payload: Partial<StudioAssetRow>) =>
    authRequest<StudioAssetRow>(`/studio/assets/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioAsset: (id: string) =>
    authRequest<void>(`/studio/assets/${id}`, { method: "DELETE" }),

  getStudioSlotRules: (templateId: string) =>
    request<StudioSlotRuleRow[]>(`/studio/templates/${templateId}/rules`),

  createStudioSlotRule: (templateId: string, payload: Partial<StudioSlotRuleRow>) =>
    authRequest<StudioSlotRuleRow>(`/studio/templates/${templateId}/rules`, { method: "POST", body: JSON.stringify(payload) }),

  updateStudioSlotRule: (ruleId: string, payload: Partial<StudioSlotRuleRow>) =>
    authRequest<StudioSlotRuleRow>(`/studio/rules/${ruleId}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteStudioSlotRule: (ruleId: string) =>
    authRequest<void>(`/studio/rules/${ruleId}`, { method: "DELETE" }),
};
