import { venuesRepository } from "./venues.repository.js";
import { projectsService } from "../projects/projects.service.js";

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export const venuesService = {
  async getVenues(city) {
    return venuesRepository.findMany(city);
  },

  async searchVenues(q) {
    const cleanQ = String(q ?? "")
      .trim()
      .toLowerCase();
    if (!cleanQ) return [];
    const escapedQ = cleanQ.replace(/[%_\\]/g, "\\$&");
    const term = `%${escapedQ}%`;
    return venuesRepository.search(term);
  },

  async getVenueById(id) {
    const venue = await venuesRepository.findById(id);
    if (!venue) {
      throw createHttpError(404, "Không tìm thấy địa điểm.");
    }

    const venueProjects = await venuesRepository.findProjectsByVenueId(venue.id);
    return {
      ...venue,
      project_count: venueProjects.length,
      projects: venueProjects,
    };
  },

  async createVenue(body) {
    const venueData = {
      ...body,
      type: body.type ?? "hotel",
      address: body.address ?? null,
      city: body.city ?? null,
      lat: Number(body.lat),
      lng: Number(body.lng),
      cover_image: body.cover_image ?? null,
    };
    return venuesRepository.insert(venueData);
  },

  async updateVenue(id, patch) {
    const existing = await venuesRepository.findById(id);
    if (!existing) {
      throw createHttpError(404, "Không tìm thấy địa điểm.");
    }
    return venuesRepository.updateById(id, patch);
  },

  async deleteVenue(id) {
    const existing = await venuesRepository.findById(id);
    if (!existing) {
      return false;
    }
    await venuesRepository.unlinkProjects(existing.id);
    await venuesRepository.removeById(id);
    return true;
  },

  async createProjectUnderVenue(venueId, data, files, req) {
    const venue = await venuesRepository.findById(venueId);
    if (!venue) {
      throw createHttpError(404, "Không tìm thấy địa điểm.");
    }
    return projectsService.createProject({ ...(data ?? {}), venue_id: venueId }, files, req);
  },
};
