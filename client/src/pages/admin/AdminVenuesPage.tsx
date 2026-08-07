import { useCallback, useEffect, useState } from "react";
import { ImagePlus, Pencil, Trash2, Plus, EyeOff } from "lucide-react";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { Project, ProjectPayload, Venue, VenueDetail, VenuePayload } from "../../lib/types";
import { VenueList } from "../../components/admin/VenueList";
import { VenueForm } from "../../components/admin/VenueForm";
import { ProjectForm } from "../../components/admin/ProjectForm";
import styles from "./AdminVenuesPage.module.scss";

/**
 * /admin/venues — Tab "Bản đồ" (M3 + M4 in the spec). Venue detail (and its
 * project list) is loaded through the public GET /api/venues/:id — the API
 * only ships admin write routes for this domain, not a separate admin read
 * route, and new projects default to published:true, so this stays in sync
 * with what admin just created without needing a new backend endpoint.
 */
export function AdminVenuesPage() {
  const { token } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [venueFormOpen, setVenueFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);

  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadVenues = useCallback(() => {
    return api
      .getVenues()
      .then((data) => {
        setVenues(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  function loadVenueDetail(id: string) {
    setDetailLoading(true);
    api
      .getVenue(id)
      .then(setSelectedVenue)
      .catch(() => setError("Không tải được chi tiết địa điểm."))
      .finally(() => setDetailLoading(false));
  }

  function handleSelectVenue(venue: Venue) {
    setSelectedVenueId(venue.id);
    loadVenueDetail(venue.id);
  }

  // ── Venue CRUD ───────────────────────────────────────────────────────

  async function handleVenueFormSubmit(payload: VenuePayload) {
    if (!token) return;
    if (editingVenue) {
      await api.updateVenue(editingVenue.id, payload, token);
    } else {
      await api.createVenue(payload, token);
    }
    setVenueFormOpen(false);
    setEditingVenue(null);
    await loadVenues();
    if (editingVenue && selectedVenueId === editingVenue.id) loadVenueDetail(editingVenue.id);
  }

  async function handleDeleteVenue(venue: Venue) {
    if (!token) return;
    if (!confirm(`Xoá địa điểm "${venue.name}"? Toàn bộ dự án bên trong cũng sẽ mất pin trên bản đồ.`)) return;
    try {
      await api.deleteVenue(venue.id, token);
      if (selectedVenueId === venue.id) {
        setSelectedVenueId(null);
        setSelectedVenue(null);
      }
      await loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xoá được địa điểm.");
    }
  }

  // ── Project CRUD ─────────────────────────────────────────────────────

  async function handleProjectFormSubmit(payload: ProjectPayload) {
    if (!token || !selectedVenueId) return;
    if (editingProject) {
      await api.updateProject(editingProject.id, payload, token);
    } else {
      await api.createProject(selectedVenueId, payload, token);
    }
    setProjectFormOpen(false);
    setEditingProject(null);
    loadVenueDetail(selectedVenueId);
    loadVenues(); // project_count on the list can change
  }

  async function handleDeleteProject(project: Project) {
    if (!token || !selectedVenueId) return;
    if (!confirm(`Xoá dự án "${project.title}"?`)) return;
    try {
      await api.deleteProject(project.id, token);
      loadVenueDetail(selectedVenueId);
      loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xoá được dự án.");
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Bản đồ dự án</h1>
      <p className={styles.subtitle}>Quản lý địa điểm và các dự án thật hiển thị trên trang /ban-do.</p>

      {error && (
        <p className={styles.error} onClick={() => setError(null)}>
          {error}
        </p>
      )}

      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách địa điểm.</p>}

      {status === "ready" && (
        <div className={styles.layout}>
          <VenueList
            venues={venues}
            selectedId={selectedVenueId}
            onSelect={handleSelectVenue}
            onAdd={() => {
              setEditingVenue(null);
              setVenueFormOpen(true);
            }}
            onEdit={(venue) => {
              setEditingVenue(venue);
              setVenueFormOpen(true);
            }}
            onDelete={handleDeleteVenue}
          />

          <div className={styles.detailPanel}>
            {!selectedVenueId && (
              <p className={styles.placeholder}>Chọn một địa điểm bên trái để xem và quản lý dự án.</p>
            )}

            {selectedVenueId && detailLoading && <p className={styles.placeholder}>Đang tải dự án…</p>}

            {selectedVenueId && !detailLoading && selectedVenue && (
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <p className={styles.detailName}>{selectedVenue.name}</p>
                    <p className={styles.detailMeta}>
                      {selectedVenue.address ?? "Chưa có địa chỉ"}
                      {selectedVenue.city ? `, ${selectedVenue.city}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.addProjectButton}
                    onClick={() => {
                      setEditingProject(null);
                      setProjectFormOpen(true);
                    }}
                  >
                    <Plus size={14} strokeWidth={2} /> Thêm dự án
                  </button>
                </div>

                {selectedVenue.projects.length === 0 ? (
                  <p className={styles.placeholder}>Chưa có dự án nào tại địa điểm này.</p>
                ) : (
                  <ul className={styles.projectList}>
                    {selectedVenue.projects.map((project) => (
                      <li key={project.id} className={styles.projectItem}>
                        <div className={styles.projectThumb}>
                          {project.cover_image ? (
                            <img src={project.cover_image} alt={project.title} className={styles.projectThumbImg} />
                          ) : (
                            <ImagePlus size={16} strokeWidth={1.5} />
                          )}
                        </div>
                        <div className={styles.projectBody}>
                          <p className={styles.projectTitle}>
                            {project.title}
                            {!project.published && (
                              <span className={styles.unpublished}>
                                <EyeOff size={11} strokeWidth={2} /> Ẩn
                              </span>
                            )}
                          </p>
                          <p className={styles.projectMeta}>
                            {project.wedding_date ?? "Chưa rõ ngày"}
                            {project.style_tags.length > 0 && ` · ${project.style_tags.map((t) => `#${t}`).join(" ")}`}
                          </p>
                        </div>
                        <div className={styles.projectActions}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => {
                              setEditingProject(project);
                              setProjectFormOpen(true);
                            }}
                            aria-label="Sửa"
                          >
                            <Pencil size={14} strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDeleteProject(project)}
                            aria-label="Xoá"
                          >
                            <Trash2 size={14} strokeWidth={1.75} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {venueFormOpen && (
        <VenueForm
          venue={editingVenue}
          onCancel={() => {
            setVenueFormOpen(false);
            setEditingVenue(null);
          }}
          onSubmit={handleVenueFormSubmit}
        />
      )}

      {projectFormOpen && selectedVenue && (
        <ProjectForm
          venueName={selectedVenue.name}
          project={editingProject}
          onCancel={() => {
            setProjectFormOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleProjectFormSubmit}
        />
      )}
    </div>
  );
}
