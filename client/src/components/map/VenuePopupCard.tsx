import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ImagePlus, ArrowRight, MapPin, X, Calendar } from "lucide-react";
import type { VenueDetail } from "../../lib/types";
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
                <MapPin size={12} /> Đang tải thông tin địa điểm...
              </span>
            </div>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
              <X size={18} />
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
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.venueBadge}>
              <MapPin size={12} /> {venue.type || "Địa điểm tiệc"}
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
            <X size={18} />
          </button>
        </div>

        {/* Body */}
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
                      <ImagePlus size={24} className={styles.thumbIcon} />
                    )}
                  </div>
                  <div className={styles.projectInfo}>
                    <h4 className={styles.projectTitle}>{project.title}</h4>
                    {project.wedding_date && (
                      <span className={styles.projectMeta}>
                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
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

        {/* Footer */}
        <div className={styles.footer}>
          {/* <span style={{ fontSize: "12px", color: "#6e5c66" }}>💡 Tự do phối cụm hoa &amp; vải voan</span> */}
          <Link to="/studio" onClick={onClose} className={styles.studioCta}>
            Thử Phối Concept Trên Studio <ArrowRight size={15} />
          </Link>
        </div>

        {/* Zoom Lightbox */}
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
