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
import styles from "./Testimonials.module.scss";

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating?: number;
  photos?: string[];
  isNew?: boolean;
}

const STORAGE_KEY = "pidecor_customer_reviews";

// Expanded initial seed list with photos & 5-star ratings
const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    quote:
      "Mình tự tay thử màu vải & phối cụm hoa trên Studio trước cả tuần, đến ngày cưới trang trí đúng y như hình dung 100%. Rất chỉn chu!",
    author: "Thu Hà",
    role: "Cô dâu, TP.HCM · PiWedding",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
    ],
  },
  {
    id: "t2",
    quote:
      "Đặt tiệc thôi nôi cho con mà vẫn chọn được đúng tông màu pastel ngọt ngào mình thích. Đội ngũ thi công cực kỳ thân thiện và đúng giờ.",
    author: "Minh & Anh",
    role: "Ba mẹ bé Tôm, Hà Nội · PiKids",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400",
    ],
  },
  {
    id: "t3",
    quote:
      "Đội thi công dựng đúng 100% timeline sự kiện khai trương, không lệch một khâu nào. Backdrop rực rỡ thu hút rất nhiều khách check-in.",
    author: "Ngọc Linh",
    role: "Quản lý thương hiệu, Đà Nẵng · PiEvent",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400",
    ],
  },
  {
    id: "t4",
    quote:
      "Gia tiên tông sen hồng đẹp ngoài sức mong đợi! Mẹ mình khen hết lời vì vừa truyền thống lại vừa hiện đại, tinh tế.",
    author: "Thanh Hằng & Đức Dũng",
    role: "Cô dâu & Chú rể, Đà Nẵng · PiWedding",
    rating: 5,
    photos: [
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400",
    ],
  },
  {
    id: "t5",
    quote:
      "Trang trí tiệc sinh nhật 1 tuổi cho bé cực xinh! Màu bóng và hoa giả phối vô cùng tự nhiên, chụp hình góc nào cũng ăn ảnh.",
    author: "Phương Anh",
    role: "Mẹ bé Bống, Hội An · PiKids",
    rating: 5,
  },
  {
    id: "t6",
    quote:
      "Tiệc Gala Year End Party được Pi Decor làm backdrop hoành tráng. Rất hài lòng với sự chuyên nghiệp của các bạn!",
    author: "Hoàng Nam",
    role: "Giám đốc sự kiện, Đà Nẵng · PiEvent",
    rating: 5,
  },
];

const avatarClasses = [styles.avatarRose, styles.avatarSage, styles.avatarSand];

export function Testimonials() {
  const [reviews, setReviews] = useState<TestimonialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load customer reviews from localStorage", e);
    }
    return INITIAL_TESTIMONIALS;
  });

  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Form states
  const [authorName, setAuthorName] = useState("");
  const [roleText, setRoleText] = useState("Cô dâu / Chú rể · PiWedding");
  const [rating, setRating] = useState<number>(5);
  const [quoteText, setQuoteText] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Save to localStorage whenever reviews update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn("Failed to save customer reviews to localStorage", e);
    }
  }, [reviews]);

  // Handle uploading photos (Max 3 photos)
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

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setSelectedPhotos((prev: string[]) => {
            if (prev.length >= 3) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev: string[]) =>
      prev.filter((_, i: number) => i !== index),
    );
  };

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !quoteText.trim()) {
      alert("Vui lòng nhập họ tên và nội dung cảm nhận!");
      return;
    }

    const newReview: TestimonialItem = {
      id: `rev-${Date.now()}`,
      author: authorName.trim(),
      role: roleText.trim(),
      quote: quoteText.trim(),
      rating,
      photos: selectedPhotos.length > 0 ? selectedPhotos : undefined,
      isNew: true,
    };

    setReviews((prev: TestimonialItem[]) => [newReview, ...prev]);
    setIsModalOpen(false);

    // Reset Form
    setAuthorName("");
    setRoleText("Cô dâu / Chú rể · PiWedding");
    setRating(5);
    setQuoteText("");
    setSelectedPhotos([]);
    setUploadError(null);
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
        <div className={styles.grid}>
          {reviews
            .slice(0, visibleCount)
            .map((t: TestimonialItem, i: number) => (
              <Reveal key={t.id} delay={(i % 3) * 80}>
                <figure className={styles.card}>
                  <span className={styles.quoteMark}>“</span>

                  {/* Stars */}
                  <div className={styles.starsRow}>
                    {Array.from({ length: t.rating || 5 }).map(
                      (_, idx: number) => (
                        <Star
                          key={idx}
                          size={14}
                          fill="#f59e0b"
                          color="#f59e0b"
                        />
                      ),
                    )}
                  </div>

                  <blockquote className={styles.quote}>{t.quote}</blockquote>

                  {/* Up to 3 Small Photos Attachment Row */}
                  {t.photos && t.photos.length > 0 && (
                    <div className={styles.photosRow}>
                      {t.photos
                        .slice(0, 3)
                        .map((photoUrl: string, pIdx: number) => (
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
                    <span
                      className={`${styles.avatar} ${avatarClasses[i % avatarClasses.length]}`}
                    >
                      {t.author.charAt(0)}
                    </span>
                    <span className={styles.meta}>
                      <span className={styles.name}>
                        {t.author}
                        {t.isNew && (
                          <span className={styles.newBadge}>Mới gửi</span>
                        )}
                      </span>
                      <span className={styles.role}>{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
        </div>

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
                  <ChevronDown size={16} /> Xem Thêm Đánh Giá (
                  {reviews.length - 3})
                </>
              )}
            </button>
          </div>
        )}
      </Container>

      {/* Customer Review Modal */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Gửi Đánh Giá Cảm Nhận</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeBtn}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className={styles.form}>
              {/* Star Rating Selection */}
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

              {/* Author Name */}
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

              {/* Role / Service */}
              <div className={styles.field}>
                <label>Dịch vụ đã sử dụng</label>
                <select
                  value={roleText}
                  onChange={(e) => setRoleText(e.target.value)}
                  className={styles.select}
                >
                  <option value="Cô dâu / Chú rể · PiWedding">
                    Cô dâu / Chú rể · PiWedding
                  </option>
                  <option value="Ba mẹ bé · PiKids">Ba mẹ bé · PiKids</option>
                  <option value="Quản lý sự kiện · PiEvent">
                    Quản lý sự kiện · PiEvent
                  </option>
                  <option value="Khách hàng thân thiết">
                    Khách hàng thân thiết
                  </option>
                </select>
              </div>

              {/* Quote / Review Text */}
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

              {/* Photos Upload (Up to 3 Photos) */}
              <div className={styles.field}>
                <label>Tải ảnh thực tế (Tối đa 3 ảnh)</label>
                {selectedPhotos.length < 3 && (
                  <label className={styles.uploadDropzone}>
                    <UploadCloud size={24} className={styles.uploadIcon} />
                    <span className={styles.uploadText}>
                      Chọn ảnh chụp từ thiết bị ({selectedPhotos.length}/3)
                    </span>
                    <span className={styles.uploadHint}>
                      Hỗ trợ PNG, JPG, WEBP
                    </span>
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
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#dc2626",
                      marginTop: "4px",
                    }}
                  >
                    ⚠️ {uploadError}
                  </div>
                )}

                {/* Uploaded Thumbnail Previews */}
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

              <button type="submit" className={styles.submitModalBtn}>
                Gửi Đánh Giá Ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Full Image View */}
      {lightboxImg && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxImg(null)}
        >
          <div
            style={{ position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg}
              alt="Phóng to"
              className={styles.lightboxImg}
            />
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
