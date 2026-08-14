import { PhotoIcon, PencilIcon, TrashIcon, PlusIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useVenues, VenueList, VenueForm } from "../../features/venues";
import { ProjectForm } from "../../features/projects";
import styles from "./AdminVenuesPage.module.scss";

/**
 * /admin/venues — Tab "Bản đồ" (M3 + M4 in the spec).
 */
export function AdminVenuesPage() {
  const {
    venues,
    status,
    error,
    setError,
    selectedVenueId,
    selectedVenue,
    detailLoading,
    venueFormOpen,
    setVenueFormOpen,
    editingVenue,
    setEditingVenue,
    projectFormOpen,
    setProjectFormOpen,
    editingProject,
    setEditingProject,
    handleSelectVenue,
    handleVenueFormSubmit,
    handleDeleteVenue,
    handleProjectFormSubmit,
    handleDeleteProject,
  } = useVenues();

  return (
    <div>
      <h1 className={styles.title}>Bản đồ dự án</h1>

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
                    <PlusIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Thêm dự án
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
                            <PhotoIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                          )}
                        </div>
                        <div className={styles.projectBody}>
                          <p className={styles.projectTitle}>
                            {project.title}
                            {!project.published && (
                              <span className={styles.unpublished}>
                                <EyeSlashIcon className="h-3 w-3 inline" style={{ width: 12, height: 12 }} /> Ẩn
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
                            <PencilIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDeleteProject(project)}
                            aria-label="Xoá"
                          >
                            <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
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
