import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { PhotoIcon, ArrowRightIcon, MapPinIcon, XMarkIcon, CalendarIcon } from "@heroicons/react/24/outline";
import type { VenueDetail } from "../../../lib/types";
import styles from "./VenuePopupCard.module.scss";

interface VenuePopupCardProps {
  venue: VenueDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function VenuePopupCard({ venue, loading, onClose }: VenuePopupCardProps) {
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  if (loading || !venue) {
    return createPortal(
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <span className={styles.venueBadge}>
                <MapPinIcon className="h-3 w-3 inline" style={{ width: 12, height: 12 }} /> Đang tải thông tin địa điểm...
              </span>
            </div>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
              <XMarkIcon className="h-5 w-5" style={{ width: 20, height: 20 }} />
            </button>
          </div>
          <div className={styles.body}>
            <p className={styles.loading}>Đang tải danh sách dự án tại đây...</p>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.venueBadge}>
              <MapPinIcon className="h-3 w-3 inline" style={{ width: 12, height: 12 }} /> {venue.type || "Địa điểm tiệc"}
            </span>
            <h3 className={styles.name}>{venue.name}</h3>
            {venue.address && (
              <p className={styles.address}>
                📍 {venue.address}
                {venue.city ? `, ${venue.city}` : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
            <XMarkIcon className="h-5 w-5" style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.sectionTitle}>Các dự án đã thực hiện tại đây ({venue.projects.length})</div>

          {venue.projects.length === 0 ? (
            <p className={styles.empty}>
              Chưa có dự án công khai tại địa điểm này. Bạn muốn lên concept riêng cho không gian này? Hãy để lại thông tin tư vấn nhé!
            </p>
          ) : (
            <ul className={styles.projectList}>
              {venue.projects.map((project) => (
                <li key={project.id} className={styles.projectCard}>
                  <div
                    className={styles.thumbWrap}
                    onClick={() => project.cover_image && setZoomImg(project.cover_image)}
                    title="Nhấp để phóng to ảnh"
                  >
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.title} className={styles.thumbImg} />
                    ) : (
                      <PhotoIcon className="h-6 w-6" style={{ width: 24, height: 24, color: "#cbd5e1" }} />
                    )}
                  </div>
                  <div className={styles.projectInfo}>
                    <h4 className={styles.projectTitle}>{project.title}</h4>
                    {project.wedding_date && (
                      <span className={styles.projectMeta}>
                        <CalendarIcon className="h-3 w-3 inline mr-1" style={{ display: 'inline', width: 12, height: 12 }} />
                        {project.wedding_date}
                      </span>
                    )}
                    {project.style_tags.length > 0 && (
                      <span className={styles.projectTags}>
                        {project.style_tags.map((t) => `#${t}`).join(" ")}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.footer}>
          <Link to="/studio" onClick={onClose} className={styles.studioCta}>
            Thử Phối Concept Trên Studio <ArrowRightIcon className="h-4 w-4 inline" style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        {zoomImg && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px"
            }}
            onClick={() => setZoomImg(null)}
          >
            <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <img
                src={zoomImg}
                alt="Zoom view"
                style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "12px", objectFit: "contain" }}
              />
              <button
                type="button"
                onClick={() => setZoomImg(null)}
                style={{
                  position: "absolute",
                  top: "-16px",
                  right: "-16px",
                  background: "#ffffff",
                  color: "#000000",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
