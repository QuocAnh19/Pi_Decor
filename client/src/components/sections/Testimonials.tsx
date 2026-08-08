import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Star,
  MessageSquarePlus,
  UploadCloud,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Container, Section, SectionHeader } from "../ui/Layout";
import { Reveal } from "../ui/Reveal";
import { api } from "../../lib/api";
import type { TestimonialItem } from "../../lib/types";
import styles from "./Testimonials.module.scss";

const avatarClasses = [styles.avatarRose, styles.avatarSage, styles.avatarSand];

export function Testimonials() {
  const [reviews, setReviews] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Form states
  const [authorName, setAuthorName] = useState("");
  const [roleText, setRoleText] = useState("Cô dâu / Chú rể · PiWedding");
  const [rating, setRating] = useState<number>(5);
  const [quoteText, setQuoteText] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch approved testimonials from backend API
  useEffect(() => {
    api
      .getTestimonials()
      .then((data) => setReviews(data))
      .catch((err) => console.warn("Failed to load approved testimonials:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const availableSlots = 3 - selectedPhotos.length;
    if (availableSlots <= 0) {
      setUploadError("Bạn chỉ được tải lên tối đa 3 ảnh!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setUploadError("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)!");
        return;
      }

      setPhotoFiles((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setSelectedPhotos((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !quoteText.trim()) {
      alert("Vui lòng nhập họ tên và nội dung cảm nhận!");
      return;
    }

    setSubmitting(true);
    try {
      if (photoFiles.length > 0) {
        const formData = new FormData();
        formData.append("author", authorName.trim());
        formData.append("role", roleText.trim());
        formData.append("quote", quoteText.trim());
        formData.append("rating", String(rating));
        photoFiles.forEach((file) => formData.append("photos", file));

        await api.submitTestimonial(formData);
      } else {
        await api.submitTestimonial({
          author: authorName.trim(),
          role: roleText.trim(),
          quote: quoteText.trim(),
          rating,
          photos: [],
        });
      }

      alert("Cảm ơn bạn! Đánh giá đang được xem xét và sẽ hiển thị sau khi duyệt.");
      setIsModalOpen(false);

      // Reset Form
      setAuthorName("");
      setRoleText("Cô dâu / Chú rể · PiWedding");
      setRating(5);
      setQuoteText("");
      setSelectedPhotos([]);
      setPhotoFiles([]);
      setUploadError(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gửi đánh giá thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

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
              onClick={() => setIsModalOpen(true)}
              className={styles.writeReviewBtn}
            >
              <MessageSquarePlus size={16} /> Viết Đánh Giá Của Bạn
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
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

                  {/* Stars */}
                  <div className={styles.starsRow}>
                    {Array.from({ length: t.rating || 5 }).map((_, idx: number) => (
                      <Star key={idx} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>

                  <blockquote className={styles.quote}>{t.quote}</blockquote>

                  {/* Up to 3 Small Photos Attachment Row */}
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

        {/* Load More Button */}
        {reviews.length > 3 && (
          <div className={styles.loadMoreWrap}>
            <button
              onClick={() => setVisibleCount(isExpanded ? 3 : reviews.length)}
              className={styles.loadMoreBtn}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} /> Thu Gọn Đánh Giá
                </>
              ) : (
                <>
                  <ChevronDown size={16} /> Xem Thêm Đánh Giá ({reviews.length - 3})
                </>
              )}
            </button>
          </div>
        )}
      </Container>

      {/* Customer Review Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Gửi Đánh Giá Cảm Nhận</h3>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className={styles.form}>
              <div className={styles.field}>
                <label>Đánh giá số sao</label>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                    >
                      <Star
                        size={22}
                        fill={starVal <= rating ? "#f59e0b" : "none"}
                        color={starVal <= rating ? "#f59e0b" : "#cbd5e1"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label>Họ và tên *</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Thu Hà"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label>Dịch vụ đã sử dụng</label>
                <select
                  value={roleText}
                  onChange={(e) => setRoleText(e.target.value)}
                  className={styles.select}
                >
                  <option value="Cô dâu / Chú rể · PiWedding">Cô dâu / Chú rể · PiWedding</option>
                  <option value="Ba mẹ bé · PiKids">Ba mẹ bé · PiKids</option>
                  <option value="Quản lý sự kiện · PiEvent">Quản lý sự kiện · PiEvent</option>
                  <option value="Khách hàng thân thiết">Khách hàng thân thiết</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Nội dung cảm nhận *</label>
                <textarea
                  placeholder="Chia sẻ trải nghiệm của bạn về thiết kế, tone màu, độ chỉn chu & dịch vụ của Pi Decor..."
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  rows={4}
                  required
                  className={styles.textarea}
                />
              </div>

              <div className={styles.field}>
                <label>Tải ảnh thực tế (Tối đa 3 ảnh)</label>
                {selectedPhotos.length < 3 && (
                  <label className={styles.uploadDropzone}>
                    <UploadCloud size={24} className={styles.uploadIcon} />
                    <span className={styles.uploadText}>
                      Chọn ảnh chụp từ thiết bị ({selectedPhotos.length}/3)
                    </span>
                    <span className={styles.uploadHint}>Hỗ trợ PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                )}

                {uploadError && (
                  <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px" }}>
                    ⚠️ {uploadError}
                  </div>
                )}

                {selectedPhotos.length > 0 && (
                  <div className={styles.previewThumbRow}>
                    {selectedPhotos.map((photo: string, pIdx: number) => (
                      <div key={pIdx} className={styles.previewThumbItem}>
                        <img src={photo} alt={`Upload preview ${pIdx + 1}`} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(pIdx)}
                          className={styles.removeImgBtn}
                          title="Xóa ảnh"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className={styles.submitModalBtn} disabled={submitting}>
                {submitting ? "Đang gửi..." : "Gửi Đánh Giá Ngay"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image View */}
      {lightboxImg && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxImg(null)}>
          <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg} alt="Phóng to" className={styles.lightboxImg} />
            <button
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
