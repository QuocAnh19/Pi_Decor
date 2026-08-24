import { useEffect } from "react";
import {
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Container, Section, SectionHeader } from "../../../components/ui/Layout";
import { Reveal } from "../../../components/ui/Reveal";
import type { TestimonialItem } from "../../../lib/types";
import { useTestimonials } from "../hooks/useTestimonials";
import { TestimonialFormModal } from "./TestimonialFormModal";
import styles from "./TestimonialsSection.module.scss";

const avatarClasses = [styles.avatarRose, styles.avatarSage, styles.avatarSand];

export function TestimonialsSection() {
  const {
    reviews,
    loading,
    visibleCount,
    setVisibleCount,
    isModalOpen,
    setIsModalOpen,
    lightbox,
    setLightbox,
    loadReviews,
  } = useTestimonials();

  const isExpanded = visibleCount >= reviews.length;

  // 1. Lock outside page scroll when lightbox is open
  useEffect(() => {
    if (!lightbox) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      return;
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [lightbox]);

  // 2. Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!lightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowRight" && lightbox.photos.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex: (prev.currentIndex + 1) % prev.photos.length,
              }
            : null
        );
      } else if (e.key === "ArrowLeft" && lightbox.photos.length > 1) {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                currentIndex:
                  (prev.currentIndex - 1 + prev.photos.length) %
                  prev.photos.length,
              }
            : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, setLightbox]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightbox((prev) =>
      prev
        ? {
            ...prev,
            currentIndex:
              (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length,
          }
        : null
    );
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightbox((prev) =>
      prev
        ? {
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.photos.length,
          }
        : null
    );
  };

  return (
    <Section tone="blush">
      <Container>
        <div className={styles.sectionHeaderRow}>
          <SectionHeader
            eyebrow="Đánh Giá Thực Tế"
            title="Khách hàng của Pi Decor nói gì"
            description="Những phản hồi &amp; hình ảnh tiệc thực tế do khách hàng chia sẻ."
            align="left"
          />

          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className={styles.writeReviewBtn}
            >
              <ChatBubbleBottomCenterTextIcon className="h-4 w-4 inline" style={{ width: 16, height: 16 }} /> Viết Đánh Giá Của Bạn
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "2rem 0" }}>Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "2rem 0" }}>Chưa có đánh giá nào được duyệt.</p>
        ) : (
          <div className={styles.grid}>
            {reviews.slice(0, visibleCount).map((t: TestimonialItem, i: number) => (
              <Reveal key={t.id} delay={(i % 3) * 80}>
                <figure className={styles.card}>
                  <span className={styles.quoteMark}>“</span>

                  <div className={styles.starsRow}>
                    {Array.from({ length: t.rating || 5 }).map((_, idx: number) => (
                      <StarSolid key={idx} className="h-3.5 w-3.5" style={{ width: 14, height: 14, color: "#f59e0b" }} />
                    ))}
                  </div>

                  <blockquote className={styles.quote}>{t.quote}</blockquote>

                  {t.photos && t.photos.length > 0 && (
                    <div className={styles.photosRow}>
                      {t.photos.map((photoUrl: string, pIdx: number) => (
                        <img
                          key={pIdx}
                          src={photoUrl}
                          alt={`Ảnh đánh giá ${pIdx + 1} của ${t.author}`}
                          className={styles.photoThumb}
                          onClick={() =>
                            setLightbox({
                              photos: t.photos,
                              currentIndex: pIdx,
                              author: t.author,
                            })
                          }
                          title="Click để xem phóng to ảnh"
                        />
                      ))}
                    </div>
                  )}

                  <figcaption className={styles.figcaption}>
                    <span className={`${styles.avatar} ${avatarClasses[i % avatarClasses.length]}`}>
                      {t.author.charAt(0)}
                    </span>
                    <span className={styles.meta}>
                      <span className={styles.name}>{t.author}</span>
                      <span className={styles.role}>{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        {reviews.length > 3 && (
          <div className={styles.loadMoreWrap}>
            <button
              type="button"
              onClick={() => setVisibleCount(isExpanded ? 3 : reviews.length)}
              className={styles.loadMoreBtn}
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 inline" style={{ width: 16, height: 16 }} /> Thu Gọn Đánh Giá
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 inline" style={{ width: 16, height: 16 }} /> Xem Thêm Đánh Giá ({reviews.length - 3})
                </>
              )}
            </button>
          </div>
        )}
      </Container>

      <TestimonialFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadReviews}
      />

      {/* Lightbox Viewer with Body Scroll Lock & Arrow Navigation */}
      {lightbox && lightbox.photos.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          {/* Top Info Bar */}
          <div className={styles.lightboxTopBar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxInfo}>
              <span className={styles.lightboxAuthor}>
                {lightbox.author ? `Đánh giá từ ${lightbox.author}` : "Hình ảnh thực tế"}
              </span>
              {lightbox.photos.length > 1 && (
                <span className={styles.lightboxCounter}>
                  {lightbox.currentIndex + 1} / {lightbox.photos.length}
                </span>
              )}
            </div>

            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setLightbox(null)}
              title="Đóng (Esc)"
              aria-label="Đóng"
            >
              <XMarkIcon style={{ width: 22, height: 22 }} />
            </button>
          </div>

          {/* Main Image Display with Left/Right Arrows */}
          <div className={styles.lightboxMain} onClick={(e) => e.stopPropagation()}>
            {lightbox.photos.length > 1 && (
              <button
                type="button"
                className={`${styles.lightboxNavBtn} ${styles.lightboxNavBtnPrev}`}
                onClick={handlePrev}
                title="Ảnh trước (Mũi tên trái ←)"
                aria-label="Ảnh trước"
              >
                <ChevronLeftIcon style={{ width: 26, height: 26 }} />
              </button>
            )}

            <div className={styles.lightboxImgWrapper}>
              <img
                src={lightbox.photos[lightbox.currentIndex]}
                alt={`Ảnh đánh giá ${lightbox.currentIndex + 1}`}
                className={styles.lightboxImg}
              />
            </div>

            {lightbox.photos.length > 1 && (
              <button
                type="button"
                className={`${styles.lightboxNavBtn} ${styles.lightboxNavBtnNext}`}
                onClick={handleNext}
                title="Ảnh tiếp theo (Mũi tên phải →)"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRightIcon style={{ width: 26, height: 26 }} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {lightbox.photos.length > 1 && (
            <div className={styles.lightboxThumbs} onClick={(e) => e.stopPropagation()}>
              {lightbox.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`${styles.lightboxThumb} ${
                    idx === lightbox.currentIndex ? styles.lightboxThumbActive : ""
                  }`}
                  onClick={() => setLightbox((prev) => (prev ? { ...prev, currentIndex: idx } : null))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
