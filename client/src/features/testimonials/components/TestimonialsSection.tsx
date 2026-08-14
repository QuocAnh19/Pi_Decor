import {
  ChatBubbleBottomCenterTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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
    lightboxImg,
    setLightboxImg,
    loadReviews,
  } = useTestimonials();

  const isExpanded = visibleCount >= reviews.length;

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
                      {t.photos.slice(0, 3).map((photoUrl: string, pIdx: number) => (
                        <img
                          key={pIdx}
                          src={photoUrl}
                          alt={`Ảnh đánh giá ${pIdx + 1}`}
                          className={styles.photoThumb}
                          onClick={() => setLightboxImg(photoUrl)}
                          title="Click để phóng to ảnh"
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

      {lightboxImg && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxImg(null)}>
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Phóng to" className={styles.lightboxImg} />
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              style={{
                position: "absolute",
                top: "-16px",
                right: "-16px",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
