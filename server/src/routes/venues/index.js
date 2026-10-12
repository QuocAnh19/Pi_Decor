import { db } from "../../config/database.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";
import { validate } from "../../middlewares/validate.js";
import { createVenueSchema, updateVenueSchema } from "../../schemas/venues.schema.js";
import { createProjectSchema } from "../../schemas/projects.schema.js";
import { createCrudRouter } from "../../utils/crudRouterFactory.js";
import { projectUpload, createProject } from "../../services/projects.service.js";

/**
 * routes/venues — implements Mục 2 & 5 of PiDecor_MappingProject.md.
 *
 * Venue (địa điểm) and Project (case study) are separate collections so one
 * venue with several past weddings still renders as a single pin, with all
 * its projects nested underneath. `project_count` is always derived from
 * `projects`, never stored, so it can't drift out of sync.
 */

async function withProjectCount(venues, projects) {
  return venues.map((v) => ({
    ...v,
    project_count: projects.filter((p) => p.venue_id === v.id && p.published).length,
  }));
}

export const venuesRouter = createCrudRouter({
  table: "venues",
  listPublic: true,
  createSchema: createVenueSchema,
  updateSchema: updateVenueSchema,
  notFoundMessage: "Không tìm thấy địa điểm.",
  transformOnCreate: (venue) => ({
    ...venue,
    type: venue.type ?? "hotel", // "hotel" | "restaurant" | "resort" | "sảnh tiệc"
    address: venue.address ?? null,
    city: venue.city ?? null,
    lat: Number(venue.lat),
    lng: Number(venue.lng),
    cover_image: venue.cover_image ?? null,
  }),
  transformOnList: async (venues, req) => {
    const projects = await db.get("projects");
    let list = await withProjectCount(venues, projects);
    if (req.query.city) {
      const city = String(req.query.city).trim().toLowerCase();
      list = list.filter((v) => v.city?.toLowerCase() === city);
    }
    return list;
  },
  beforeDelete: async (venue) => {
    // Migration 0009 định nghĩa FK projects.venue_id ON DELETE CASCADE.
    // Migration 0020 đã cho phép venue_id NULL để các dự án (Lookbook, Gia Tiên) có thể
    // tồn tại độc lập mà không bắt buộc phải thuộc về địa điểm nào.
    // Để việc xóa địa điểm không làm mất vĩnh viễn các dự án (vốn là portfolio quý giá),
    // ta gán venue_id = NULL cho các dự án liên quan trước khi xóa địa điểm.
    await db.query("UPDATE projects SET venue_id = NULL WHERE venue_id = $1", [venue.id]);
  },
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

// ── Admin Project Sub-routes under Venues ─────────────────────────────────────

// POST /api/venues/:id/projects — add a case study under a venue.
venuesRouter.post("/:id/projects", verifyToken, requireAdmin, projectUpload, validate(createProjectSchema), async (req, res, next) => {
  const venues = await db.get("venues");
  if (!venues.some((v) => v.id === req.params.id)) {
    return res.status(404).json({ message: "Không tìm thấy địa điểm." });
  }
  try {
    const project = await createProject({ ...(req.body ?? {}), venue_id: req.params.id }, req.files, req);
    res.status(201).json(project);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});
