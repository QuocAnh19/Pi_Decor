import { Router } from "express";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createVenueSchema, updateVenueSchema } from "../../schemas/venues.schema.js";
import { deleteImageFile, deleteMultipleImageFiles } from "../../utils/uploadImage.js";

export const venuesRouter = Router();

/**
 * routes/venues — implements Mục 2 & 5 of PiDecor_MappingProject.md.
 *
 * Venue (địa điểm) and Project (case study) are separate collections so one
 * venue with several past weddings still renders as a single pin, with all
 * its projects nested underneath. `project_count` is always derived from
 * `projects`, never stored, so it can't drift out of sync — same reasoning
 * as `db.json`'s other collections.
 */

async function withProjectCount(venues, projects) {
  return venues.map((v) => ({
    ...v,
    project_count: projects.filter((p) => p.venue_id === v.id && p.published).length,
  }));
}

// GET /api/venues — list, for drawing pins on the map (Điểm chạm B) and the
// homepage teaser. Public.
venuesRouter.get("/", async (_req, res) => {
  const [venues, projects] = await Promise.all([db.get("venues"), db.get("projects")]);
  res.json(await withProjectCount(venues, projects));
});

// GET /api/venues/search?q= — autocomplete for the quick-search box on the
// homepage (Điểm chạm A). Matches name, city, or address, case-insensitive.
venuesRouter.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  if (!q) return res.json([]);
  const [venues, projects] = await Promise.all([db.get("venues"), db.get("projects")]);
  const matches = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      v.city?.toLowerCase().includes(q) ||
      v.address?.toLowerCase().includes(q)
  );
  res.json(await withProjectCount(matches, projects));
});

// GET /api/venues/:id — venue detail + its published projects, for the
// marker click / VenueDetailPage gallery.
venuesRouter.get("/:id", async (req, res) => {
  const venues = await db.get("venues");
  const venue = venues.find((v) => v.id === req.params.id);
  if (!venue) return res.status(404).json({ message: "Không tìm thấy địa điểm." });

  const projects = await db.get("projects");
  const venueProjects = projects.filter((p) => p.venue_id === venue.id && p.published);
  res.json({ ...venue, project_count: venueProjects.length, projects: venueProjects });
});

// ── Admin (M1: basic CRUD, no geocoding yet — see Mục 4 for the geocode step) ──

// POST /api/admin/venues — create a venue. lat/lng entered manually for now;
// wiring this to Nominatim/Goong from the address is the next milestone.
venuesRouter.post("/", verifyToken, requireAdmin, validate(createVenueSchema), async (req, res) => {
  const { name, type, address, city, lat, lng, cover_image } = req.body ?? {};
  const venue = {
    id: uuid(),
    name,
    type: type ?? "hotel", // "hotel" | "restaurant" | "resort" | "sảnh tiệc"
    address: address ?? null,
    city: city ?? null,
    lat: Number(lat),
    lng: Number(lng),
    cover_image: cover_image ?? null,
  };
  await db.insert("venues", venue);
  res.status(201).json(venue);
});

venuesRouter.patch("/:id", verifyToken, requireAdmin, validate(updateVenueSchema), async (req, res) => {
  const venues = await db.get("venues");
  const existing = venues.find((v) => v.id === req.params.id);
  if (!existing) return res.status(404).json({ message: "Không tìm thấy địa điểm." });

  const patch = req.body ?? {};
  if (patch.cover_image && existing.cover_image && patch.cover_image !== existing.cover_image) {
    await deleteImageFile(existing.cover_image);
  }

  const updated = await db.updateById("venues", req.params.id, patch);
  res.json(updated);
});

venuesRouter.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const venues = await db.get("venues");
  const existing = venues.find((v) => v.id === req.params.id);

  const removed = await db.removeById("venues", req.params.id);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy địa điểm." });

  if (existing) {
    if (existing.cover_image) {
      await deleteImageFile(existing.cover_image);
    }
    if (Array.isArray(existing.gallery)) {
      await deleteMultipleImageFiles(existing.gallery);
    }
  }

  res.status(204).send();
});

// POST /api/admin/venues/:id/projects — add a case study under a venue.
venuesRouter.post("/:id/projects", verifyToken, requireAdmin, async (req, res) => {
  const venues = await db.get("venues");
  if (!venues.some((v) => v.id === req.params.id)) {
    return res.status(404).json({ message: "Không tìm thấy địa điểm." });
  }
  const { title, wedding_date, style_tags, cover_image, gallery, lead_id, published } = req.body ?? {};
  if (!title) return res.status(400).json({ message: "Thiếu tên dự án." });

  const project = {
    id: uuid(),
    venue_id: req.params.id,
    title,
    wedding_date: wedding_date ?? null,
    style_tags: Array.isArray(style_tags) ? style_tags : [],
    cover_image: cover_image ?? null,
    gallery: Array.isArray(gallery) ? gallery : [],
    lead_id: lead_id ?? null,
    published: published ?? true,
  };
  await db.insert("projects", project);
  res.status(201).json(project);
});

venuesRouter.patch("/projects/:projectId", verifyToken, requireAdmin, async (req, res) => {
  const projects = await db.get("projects");
  const existing = projects.find((p) => p.id === req.params.projectId);
  if (!existing) return res.status(404).json({ message: "Không tìm thấy dự án." });

  const patch = req.body ?? {};
  if (patch.cover_image && existing.cover_image && patch.cover_image !== existing.cover_image) {
    await deleteImageFile(existing.cover_image);
  }

  const updated = await db.updateById("projects", req.params.projectId, patch);
  res.json(updated);
});

venuesRouter.delete("/projects/:projectId", verifyToken, requireAdmin, async (req, res) => {
  const projects = await db.get("projects");
  const existing = projects.find((p) => p.id === req.params.projectId);

  const removed = await db.removeById("projects", req.params.projectId);
  if (!removed) return res.status(404).json({ message: "Không tìm thấy dự án." });

  if (existing) {
    if (existing.cover_image) {
      await deleteImageFile(existing.cover_image);
    }
    if (Array.isArray(existing.gallery)) {
      await deleteMultipleImageFiles(existing.gallery);
    }
  }

  res.status(204).send();
});
