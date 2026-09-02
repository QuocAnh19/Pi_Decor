import { useEffect, useState, useMemo, useCallback } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import type { CategoryPortfolioItem } from "../../../lib/types";
import { MediaSlot } from "../../../components/ui/MediaSlot";
import { Modal } from "../../../components/ui";
import styles from "./ProjectAlbumModal.module.scss";

interface ProjectAlbumModalProps {
  project: CategoryPortfolioItem | null;
  onClose: () => void;
}

function getSpanClass(index: number, total: number): string {
  if (total === 1) return styles.span4x3;
  if (total === 2) return styles.span2x2;

  const asymmetricPattern = [
    styles.span2x3,
    styles.span1x1,
    styles.span1x2,
    styles.span1x2,
    styles.span1x1,
    styles.span2x2,
    styles.span1x3,
    styles.span1x1,
    styles.span2x1,
    styles.span1x1,
    styles.span2x2,
    styles.span1x2,
    styles.span1x1,
    styles.span2x1,
    styles.span1x2,
  ];

  return asymmetricPattern[index % asymmetricPattern.length];
}

export function ProjectAlbumModal({ project, onClose }: ProjectAlbumModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLightboxIndex(null);
  }, [project?.id]);

  const items = useMemo(() => {
    if (!project) return [];
    const list: { url: string; span?: string }[] = [];
    if (project.src) list.push({ url: project.src, span: "span2x3" });

    if (Array.isArray(project.gallery)) {
      project.gallery.forEach((item) => {
        if (!item) return;
        if (typeof item === "string" && !list.some((l) => l.url === item)) {
          list.push({ url: item });
        } else if (typeof item === "object" && item.url && !list.some((l) => l.url === item.url)) {
          list.push({ url: item.url, span: item.span });
        }
      });
    }
    return list.slice(0, 10);
  }, [project]);

  const images = useMemo(() => items.map((i) => i.url), [items]);

  const handleLightboxPrev = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + images.length) % images.length : 0
    );
  }, [images.length]);

  const handleLightboxNext = useCallback(() => {
    if (images.length <= 1) return;
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
  }, [images.length]);

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") {
          e.stopPropagation();
          setLightboxIndex(null);
        } else if (e.key === "ArrowLeft") {
          e.stopPropagation();
          handleLightboxPrev();
        } else if (e.key === "ArrowRight") {
          e.stopPropagation();
          handleLightboxNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [project, lightboxIndex, handleLightboxPrev, handleLightboxNext]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [lightboxIndex]);

  if (!project) return null;

  const headerTitle = (
    <div className={styles.headerInfo}>
      <div className={styles.headerTop}>
        <span className={styles.tagBadge}>#{project.tag}</span>
        {(project.featured || project.status === "featured") && (
          <span className={styles.featuredBadge}>Nổi bật</span>
        )}
        {project.priceTier && (
          <span
            className={
              project.priceTier === "premium"
                ? styles.premiumBadge
                : styles.tierBadge
            }
          >
            {project.priceTier === "premium" ? "Cao cấp" : "Bình thường"}
          </span>
        )}
        {project.location && (
          <span className={styles.locationText}>
            <MapPinIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} />
            {project.location}
          </span>
        )}
      </div>
      <h3 className={styles.title}>{project.title}</h3>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={Boolean(project)}
        onClose={onClose}
        title={headerTitle}
        maxWidth="1040px"
      >
        <div className={styles.albumSubhead}>
          <span>Bộ sưu tập thực tế ({items.length} hình ảnh)</span>
          <span>Bấm vào hình bất kỳ để xem toàn màn hình</span>
        </div>

        <div className={styles.masonryGrid}>
          {items.map((item, idx) => {
            const spanClass =
              item.span && (styles as Record<string, string>)[item.span]
                ? (styles as Record<string, string>)[item.span]
                : getSpanClass(idx, items.length);

            return (
              <button
                key={`${item.url}-${idx}`}
                type="button"
                className={`${styles.tile} ${spanClass}`}
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
              >
                <MediaSlot
                  src={item.url}
                  alt={`${project.title} - Ảnh ${idx + 1}`}
                  label={`Ảnh ${idx + 1}`}
                  hint="16:9 · JPG"
                  className={styles.tileMedia}
                />
                <div className={styles.tileHoverOverlay}>
                  <span className={styles.expandIconCircle}>
                    <ArrowsPointingOutIcon className="h-4 w-4" style={{ width: 18, height: 18 }} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {lightboxIndex !== null && (
        <div
          className={styles.lightboxOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh toàn màn hình"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIndex(null);
          }}
        >
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <span className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {images.length}
            </span>

            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              aria-label="Đóng xem toàn màn hình"
            >
              <XMarkIcon className="h-6 w-6" style={{ width: 24, height: 24 }} />
            </button>
          </div>

          <div className={styles.lightboxBody} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxViewer}>
              <MediaSlot
                src={images[lightboxIndex]}
                alt={`${project.title} - Ảnh ${lightboxIndex + 1}`}
                label={project.title}
                hint="16:9 · ngang · JPG"
                className={styles.lightboxMedia}
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxNavArrow} ${styles.lightboxNavPrev}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxPrev();
                  }}
                  aria-label="Ảnh trước"
                >
                  <ChevronLeftIcon className="h-6 w-6" style={{ width: 24, height: 24 }} />
                </button>

                <button
                  type="button"
                  className={`${styles.lightboxNavArrow} ${styles.lightboxNavNext}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxNext();
                  }}
                  aria-label="Ảnh kế tiếp"
                >
                  <ChevronRightIcon className="h-6 w-6" style={{ width: 24, height: 24 }} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
