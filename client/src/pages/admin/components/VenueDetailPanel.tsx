import {
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import type { VenueDetail, Project } from "../../../lib/types";
import styles from "../AdminVenuesPage.module.scss";

interface VenueDetailPanelProps {
  selectedVenueId: string | null;
  detailLoading: boolean;
  selectedVenue: VenueDetail | null;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

/**
 * Panel hiển thị chi tiết địa điểm và danh sách dự án gắn với địa điểm đó.
 */
export function VenueDetailPanel({
  selectedVenueId,
  detailLoading,
  selectedVenue,
  onAddProject,
  onEditProject,
  onDeleteProject,
}: VenueDetailPanelProps) {
  return (
    <div className={styles.detailPanel}>
      {!selectedVenueId && (
        <p className={styles.placeholder}>
          Chọn một địa điểm bên trái để xem và quản lý danh sách dự án.
        </p>
      )}

      {selectedVenueId && detailLoading && (
        <p className={styles.placeholder}>Đang tải dự án…</p>
      )}

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
              onClick={onAddProject}
            >
              <PlusIcon
                className="h-4 w-4"
                style={{ width: 16, height: 16 }}
              />{" "}
              Thêm dự án
            </button>
          </div>

          {selectedVenue.projects.length === 0 ? (
            <p className={styles.placeholder}>
              Chưa có dự án nào tại địa điểm này. Hãy bấm "Thêm dự án" để tạo mới!
            </p>
          ) : (
            <ul className={styles.projectList}>
              {selectedVenue.projects.map((project) => (
                <li key={project.id} className={styles.projectItem}>
                  <div className={styles.projectThumb}>
                    {project.cover_image ? (
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className={styles.projectThumbImg}
                      />
                    ) : (
                      <PhotoIcon
                        className="h-4 w-4"
                        style={{ width: 16, height: 16 }}
                      />
                    )}
                  </div>
                  <div className={styles.projectBody}>
                    <p className={styles.projectTitle}>
                      {project.title}
                      {!project.published && (
                        <span className={styles.unpublished}>
                          <EyeSlashIcon
                            className="h-3 w-3 inline"
                            style={{ width: 12, height: 12 }}
                          />{" "}
                          Ẩn
                        </span>
                      )}
                    </p>
                    <p className={styles.projectMeta}>
                      {project.wedding_date ?? "Chưa rõ ngày"}
                      {project.style_tags.length > 0 &&
                        ` · ${project.style_tags.map((t) => `#${t}`).join(" ")}`}
                    </p>
                  </div>
                  <div className={styles.projectActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => onEditProject(project)}
                      title="Sửa dự án"
                    >
                      <PencilIcon
                        className="h-4 w-4"
                        style={{ width: 16, height: 16 }}
                      />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      onClick={() => onDeleteProject(project)}
                      title="Xoá dự án"
                    >
                      <TrashIcon
                        className="h-4 w-4"
                        style={{ width: 16, height: 16 }}
                      />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
