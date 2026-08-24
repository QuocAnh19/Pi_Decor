import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  PhotoIcon,
  ArrowRightIcon,
  MapPinIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import type { VenueDetail, Project, CategoryPortfolioItem } from "../../../lib/types";
import { categoryPortfolio } from "../../../lib/content";
import { formatDate } from "../../../lib/formatters";
import { ProjectAlbumModal } from "../../projects";
import styles from "./VenuePopupCard.module.scss";

interface VenuePopupCardProps {
  venue: VenueDetail | null;
  loading: boolean;
  onClose: () => void;
}

export function VenuePopupCard({ venue, loading, onClose }: VenuePopupCardProps) {
  const [selectedProject, setSelectedProject] = useState<CategoryPortfolioItem | null>(null);

  // Lock outside body scroll when venue popup is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleOpenProject = (project: Project) => {
    if (!venue) return;
    const matchingStatic = categoryPortfolio.find(
      (c) => c.id === project.id || c.title?.toLowerCase() === project.title?.toLowerCase()
    );

    // Build rich gallery list
    let galleryList: (string | { url: string; span?: string })[] = [];
    if (Array.isArray(project.gallery) && project.gallery.length > 0) {
      galleryList = project.gallery;
    } else if (matchingStatic?.gallery && matchingStatic.gallery.length > 0) {
      galleryList = matchingStatic.gallery;
    } else if (project.cover_image) {
      galleryList = [project.cover_image];
    } else if (matchingStatic?.src) {
      galleryList = [matchingStatic.src];
    }

    const portfolioItem: CategoryPortfolioItem = {
      id: project.id,
      title: project.title,
      tag: project.style_tags?.[0] || project.tag || matchingStatic?.tag || "Dự án thực tế",
      src:
        project.cover_image ||
        matchingStatic?.src ||
        (typeof galleryList[0] === "string" ? galleryList[0] : galleryList[0]?.url) ||
        "/images/portfolio/piwedding-gia-tien-1.jpg",
      categoryId: project.category_id || matchingStatic?.categoryId || "piwedding",
      location: venue.name
        ? `${venue.name}${venue.city ? ` · ${venue.city}` : ""}`
        : project.location || matchingStatic?.location || undefined,
      gallery: galleryList,
    };
    setSelectedProject(portfolioItem);
  };

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
    <>
      <div
        className={styles.modalOverlay}
        onClick={onClose}
        style={{ display: selectedProject ? "none" : "flex" }}
      >
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <div className={styles.titleGroup}>
              <span className={styles.venueBadge}>
                <MapPinIcon className="h-3 w-3 inline" style={{ width: 12, height: 12 }} /> {venue.type || "Địa điểm tiệc"}
              </span>
              <h3 className={styles.name}>{venue.name}</h3>
              {venue.address && (
                <p className={styles.address}>
                  {venue.address}
                  {venue.city ? `, ${venue.city}` : ""}
                </p>
              )}
            </div>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
              <XMarkIcon className="h-5 w-5" style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.sectionTitle}>
              Các dự án đã thực hiện tại đây ({venue.projects.length})
            </div>

            {venue.projects.length === 0 ? (
              <p className={styles.empty}>
                Chưa có dự án công khai tại địa điểm này. Bạn muốn lên concept riêng cho không gian này? Hãy để lại thông tin tư vấn nhé!
              </p>
            ) : (
              <ul className={styles.projectList}>
                {venue.projects.map((project) => (
                  <li
                    key={project.id}
                    className={styles.projectCard}
                    onClick={() => handleOpenProject(project)}
                    title="Nhấp để xem toàn bộ album dự án"
                  >
                    <div className={styles.thumbWrap}>
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className={styles.thumbImg}
                        />
                      ) : (
                        <PhotoIcon
                          className="h-6 w-6"
                          style={{ width: 24, height: 24, color: "#cbd5e1" }}
                        />
                      )}
                    </div>
                    <div className={styles.projectInfo}>
                      <h4 className={styles.projectTitle}>{project.title}</h4>
                      {project.wedding_date && (
                        <span className={styles.projectMeta}>
                          <CalendarIcon
                            className="h-3.5 w-3.5 inline"
                            style={{ width: 14, height: 14 }}
                          />
                          <span>{formatDate(project.wedding_date)}</span>
                        </span>
                      )}
                      {project.style_tags && project.style_tags.length > 0 && (
                        <span className={styles.projectTags}>
                          {project.style_tags.map((t) => `#${t}`).join(" ")}
                        </span>
                      )}
                    </div>
                    <div className={styles.viewProjectBtn} title="Xem album dự án">
                      <ArrowsPointingOutIcon style={{ width: 16, height: 16 }} />
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
        </div>
      </div>

      {/* Full Project Album Modal */}
      {selectedProject && (
        <ProjectAlbumModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>,
    document.body
  );
}
