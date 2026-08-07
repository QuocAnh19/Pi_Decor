import type {
  Admin,
  AdminSummary,
  Lead,
  LeadStatus,
  Project,
  ProjectPayload,
  Venue,
  VenueDetail,
  VenuePayload,
} from "./types";

/**
 * api.ts — the one file in the client that knows how to call the backend.
 * Every component that needs server data goes through here instead of
 * calling `fetch` directly, so the base URL / error handling / auth header
 * only ever live in one place (same pattern as Ecovera's `authFetch.js`).
 *
 * Base URL comes from VITE_API_URL (set in `.env` for prod, e.g.
 * https://pidecor-api.onrender.com/api) and falls back to the local
 * dev server started by `server/`.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  // DELETE endpoints (admin venues/projects) reply 204 with no body.
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Same as `request`, plus the admin Bearer token every /admin/* and every
 * write under /leads and /venues expects (see verifyToken.js on the API). */
function authRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
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
  // Contact form (Footer) and the Studio "Xuất thiết kế" flow both submit
  // through this single endpoint — the backend tells them apart by whether
  // design_snapshot is present.
  submitLead: (payload: LeadPayload) =>
    request<{ id: string }>("/leads", { method: "POST", body: JSON.stringify(payload) }),

  getMaterials: () => request<unknown[]>("/materials"),

  getServices: () => request<unknown[]>("/services"),

  // Bản đồ dự án đã thực hiện (PiDecor_MappingProject.md)
  getVenues: () => request<Venue[]>("/venues"),

  getVenue: (id: string) => request<VenueDetail>(`/venues/${id}`),

  // ── Admin (PiDecor_AdminPanel.md) ─────────────────────────────────────
  // Everything below requires the JWT from adminLogin(); authContext.tsx is
  // the one place in the app that holds that token and passes it in.

  adminLogin: (payload: { email: string; password: string }) =>
    request<{ token: string; admin: Admin }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSummary: (token: string) => authRequest<AdminSummary>("/admin/summary", token),

  // GET /api/leads is public-path-shaped but admin-only (verifyToken +
  // requireAdmin inside leadsRouter) — newest first, per the spec.
  getLeads: (token: string) => authRequest<Lead[]>("/leads", token),

  updateLeadStatus: (id: string, status: LeadStatus, token: string) =>
    authRequest<Lead>(`/leads/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  createVenue: (payload: VenuePayload, token: string) =>
    authRequest<Venue>("/venues", token, { method: "POST", body: JSON.stringify(payload) }),

  updateVenue: (id: string, payload: Partial<VenuePayload>, token: string) =>
    authRequest<Venue>(`/venues/${id}`, token, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteVenue: (id: string, token: string) =>
    authRequest<void>(`/venues/${id}`, token, { method: "DELETE" }),

  createProject: (venueId: string, payload: ProjectPayload, token: string) =>
    authRequest<Project>(`/venues/${venueId}/projects`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProject: (projectId: string, payload: Partial<ProjectPayload>, token: string) =>
    authRequest<Project>(`/venues/projects/${projectId}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteProject: (projectId: string, token: string) =>
    authRequest<void>(`/venues/projects/${projectId}`, token, { method: "DELETE" }),
};
