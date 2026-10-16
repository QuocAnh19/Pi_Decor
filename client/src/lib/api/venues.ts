import { request, authRequest } from "../http";
import type {
  Project,
  ProjectPayload,
  Venue,
  VenueDetail,
  VenuePayload,
} from "../types";

export const venuesApi = {
  getVenues: () => request<Venue[]>("/venues"),

  getVenue: (id: string) => request<VenueDetail>(`/venues/${id}`),

  createVenue: (payload: VenuePayload) =>
    authRequest<Venue>("/venues", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateVenue: (id: string, payload: Partial<VenuePayload>) =>
    authRequest<Venue>(`/venues/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

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
};
