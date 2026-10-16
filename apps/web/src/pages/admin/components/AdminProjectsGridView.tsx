import {
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { SAMPLE_STOCK_IMAGES, type ProjectItem } from "../../../features/projects";
import styles from "../AdminProjectsPage.module.scss";

export function renderProjectStatusBadge(status?: string) {
  const isFeatured = status === "featured";
  const isDraft = status === "draft";
  return (
    <span
      className={`${styles.statusBadge} ${
        isFeatured ? styles.statusFeatured : isDraft ? styles.statusDraft : styles.statusActive
      }`}
    >
      {isFeatured ? "Nổi bật" : isDraft ? "Bản nháp" : "Hiển thị"}
    </span>
  );
}

interface AdminProjectsGridViewProps {
  projects: ProjectItem[];
  onToggleFeatured: (proj: ProjectItem) => void;
  onEdit: (proj: ProjectItem) => void;
  onDelete: (id: string) => void;
}

/**
 * Chế độ hiển thị thẻ (grid) danh sách dự án trong trang quản trị.
 */
export function AdminProjectsGridView({
  projects,
  onToggleFeatured,
  onEdit,
  onDelete,
}: AdminProjectsGridViewProps) {
  return (
    <div className={styles.grid}>
      {projects.map((proj) => (
        <div key={proj.id} className={styles.card}>
          <div className={styles.cardImageWrapper}>
            <img
              src={proj.src}
              alt={proj.title}
              className={styles.cardImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0];
              }}
            />

            <div className={styles.badgeRow}>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <span className={styles.categoryBadge}>
                  #PiDecor_{proj.tag.replace(/\s+/g, "")}
                </span>
                {proj.priceTier === "premium" && (
                  <span className={`${styles.tierBadge} ${styles.tierPremium}`}>Cao cấp</span>
                )}
              </div>

              {renderProjectStatusBadge(proj.status)}
            </div>
          </div>

          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>{proj.title}</h3>

            <div className={styles.cardMeta}>
              <span className={styles.metaItem}>
                <MapPinIcon
                  className="h-3.5 w-3.5 inline"
                  style={{ color: "#a15c2e", width: 14, height: 14 }}
                />{" "}
                {proj.location}
              </span>
              {proj.date && (
                <span className={styles.metaItem}>
                  <CalendarIcon
                    className="h-3.5 w-3.5 inline"
                    style={{ color: "#6e6259", width: 14, height: 14 }}
                  />{" "}
                  {proj.date}
                </span>
              )}
            </div>

            <p className={styles.cardDesc}>{proj.description}</p>

            <div className={styles.cardFooter}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#b98a3e",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <CurrencyDollarIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />{" "}
                {proj.budget || "Liên hệ báo giá"}
              </div>

              <div className={styles.actionButtons}>
                <button
                  onClick={() => onToggleFeatured(proj)}
                  className={styles.iconBtn}
                  title={
                    proj.status === "featured" ? "Bỏ danh hiệu nổi bật" : "Đặt làm dự án nổi bật"
                  }
                  style={{
                    color: proj.status === "featured" ? "#b98a3e" : "#6e6259",
                  }}
                >
                  {proj.status === "featured" ? (
                    <StarSolid
                      className="h-3.5 w-3.5"
                      style={{ color: "#b98a3e", width: 14, height: 14 }}
                    />
                  ) : (
                    <StarIcon
                      className="h-3.5 w-3.5"
                      style={{ color: "#6e6259", width: 14, height: 14 }}
                    />
                  )}
                </button>

                <button
                  onClick={() => onEdit(proj)}
                  className={styles.iconBtn}
                  title="Chỉnh sửa dự án"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Sửa
                </button>

                <button
                  onClick={() => onDelete(proj.id)}
                  className={`${styles.iconBtn} ${styles.dangerBtn}`}
                  title="Xóa dự án"
                >
                  <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
