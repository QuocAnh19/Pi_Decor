import { useState, FormEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { StarIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { Modal, Input, Select, Textarea } from "../../../components/ui";
import { api } from "../../../lib/api";
import styles from "./TestimonialFormModal.module.scss";

interface TestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SERVICE_ROLES = [
  { value: "Cô dâu / Chú rể · PiWedding", label: "Cô dâu / Chú rể · PiWedding" },
  { value: "Ba mẹ bé · PiKids", label: "Ba mẹ bé · PiKids" },
  { value: "Quản lý sự kiện · PiEvent", label: "Quản lý sự kiện · PiEvent" },
  { value: "Khách hàng thân thiết", label: "Khách hàng thân thiết" },
];

export function TestimonialFormModal({ isOpen, onClose, onSuccess }: TestimonialFormModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [roleText, setRoleText] = useState("Cô dâu / Chú rể · PiWedding");
  const [rating, setRating] = useState<number>(5);
  const [quoteText, setQuoteText] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [consent, setConsent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

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

    if (!consent) {
      alert("Vui lòng đồng ý để Pi Decor xử lý dữ liệu cá nhân theo Chính sách bảo mật.");
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
        formData.append("consent", "true");
        formData.append("consent_version", "v1.0");
        photoFiles.forEach((file) => formData.append("photos", file));

        await api.submitTestimonial(formData);
      } else {
        await api.submitTestimonial({
          author: authorName.trim(),
          role: roleText.trim(),
          quote: quoteText.trim(),
          rating,
          photos: [],
          consent: true,
          consent_version: "v1.0",
        });
      }

      alert("Cảm ơn bạn! Đánh giá đang được xem xét và sẽ hiển thị sau khi duyệt.");
      onClose();
      onSuccess();

      setAuthorName("");
      setRoleText("Cô dâu / Chú rể · PiWedding");
      setRating(5);
      setQuoteText("");
      setSelectedPhotos([]);
      setPhotoFiles([]);
      setUploadError(null);
      setConsent(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gửi đánh giá thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gửi Đánh Giá Cảm Nhận" maxWidth="500px">
      <form onSubmit={handleSubmitReview} className={styles.form}>
        <div className={styles.starRatingContainer}>
          <label className={styles.starLabel}>Đánh giá số sao</label>
          <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((starVal) => (
              <button
                key={starVal}
                type="button"
                aria-label={`Đánh giá ${starVal} sao`}
                onClick={() => setRating(starVal)}
              >
                {starVal <= rating ? (
                  <StarSolid
                    className="h-5.5 w-5.5"
                    style={{ width: 22, height: 22, color: "#f59e0b" }}
                  />
                ) : (
                  <StarIcon
                    className="h-5.5 w-5.5"
                    style={{ width: 22, height: 22, color: "#cbd5e1" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="review-author"
          label="Họ và tên"
          required
          type="text"
          placeholder="VD: Nguyễn Thu Hà"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />

        <Select
          id="review-role"
          label="Dịch vụ đã sử dụng"
          value={roleText}
          onChange={(e) => setRoleText(e.target.value)}
          options={SERVICE_ROLES}
        />

        <Textarea
          id="review-quote"
          label="Nội dung cảm nhận"
          required
          placeholder="Chia sẻ trải nghiệm của bạn về thiết kế, tone màu, độ chỉn chu & dịch vụ của Pi Decor..."
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          rows={4}
        />

        <div className={styles.uploadField}>
          <label className={styles.uploadFieldLabel}>Tải ảnh thực tế (Tối đa 3 ảnh)</label>
          {selectedPhotos.length < 3 && (
            <label className={styles.uploadDropzone}>
              <CloudArrowUpIcon
                className={`h-6 w-6 ${styles.uploadIcon}`}
                style={{ width: 24, height: 24 }}
              />
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
                    aria-label="Xóa ảnh"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.consentGroup}>
          <label htmlFor="testimonial-consent" className={styles.consentLabel}>
            <input
              id="testimonial-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className={styles.consentCheckbox}
            />
            <span>
              Tôi đồng ý để Pi Decor xử lý dữ liệu cá nhân theo{" "}
              <Link
                to="/chinh-sach-bao-mat"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.consentLink}
              >
                Chính sách bảo mật
              </Link>
              <span style={{ color: "#b4586b", marginLeft: "2px" }}>*</span>
            </span>
          </label>
        </div>

        <button type="submit" className={styles.submitModalBtn} disabled={submitting}>
          {submitting ? "Đang gửi..." : "Gửi Đánh Giá Ngay"}
        </button>
      </form>
    </Modal>
  );
}
