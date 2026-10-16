import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Modal, Input, Select, Textarea } from "../../../components/ui";
import type { Project, ProjectPayload } from "../../../lib/types";
import {
  ProjectItem,
  CATEGORY_TAG_OPTIONS,
  SAMPLE_STOCK_IMAGES,
  PRICE_TIER_OPTIONS,
} from "../types";
import { useProjectForm } from "../hooks/useProjectForm";
import { ProjectGalleryEditor } from "./ProjectGalleryEditor";
import styles from "../../../pages/admin/AdminProjectsPage.module.scss";

export type ProjectFormProps =
  | {
      venueName?: undefined;
      project: ProjectItem | null;
      onCancel: () => void;
      onSubmit: (
        formData: Omit<ProjectItem, "id">,
        selectedFile: File | null,
        galleryUrls: string[],
        selectedGalleryFiles: File[],
        customSpans: Record<number, string>,
      ) => Promise<void>;
    }
  | {
      venueName: string;
      project: Project | ProjectItem | null;
      onCancel: () => void;
      onSubmit: (payload: ProjectPayload) => Promise<void>;
    };

const CATEGORY_OPTIONS = [
  { value: "piwedding", label: "PiWedding" },
  { value: "pikids", label: "PiKids" },
  { value: "pievent", label: "PiEvent" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hiển thị" },
  { value: "featured", label: "Nổi bật" },
  { value: "draft", label: "Bản nháp" },
];

export function ProjectForm(props: ProjectFormProps) {
  const { venueName, project, onCancel } = props;
  const isSimpleMode = Boolean(venueName);

  const {
    formData,
    setFormData,
    galleryUrls,
    customSpans,
    setCustomSpans,
    activeSlotCount,
    setActiveSlotCount,
    submitting,
    slotFileInputRef,
    handleCategoryChange,
    handleFileUpload,
    handleSlotClick,
    handleSlotFileSelected,
    handleMultiGalleryUpload,
    handleRemoveGalleryItem,
    handleMakeCover,
    handleSubmit,
  } = useProjectForm(props);

  const tagOptions = (CATEGORY_TAG_OPTIONS[formData.categoryId] || []).map((t) => ({
    value: t,
    label: t,
  }));
  if (formData.tag && !CATEGORY_TAG_OPTIONS[formData.categoryId]?.includes(formData.tag)) {
    tagOptions.push({ value: formData.tag, label: `${formData.tag} (Khác)` });
  }

  return (
    <Modal
      isOpen
      onClose={onCancel}
      title={project ? "Chỉnh Sửa Dự Án" : "Thêm Dự Án Mới"}
      maxWidth="920px"
    >
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxHeight: "76vh",
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "4px",
          }}
        >
          {isSimpleMode && (
            <div
              style={{
                fontSize: "12px",
                color: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.1)",
                padding: "8px 12px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              Địa điểm: <strong>{venueName}</strong>
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <Input
                label="Tên Dự Án"
                required
                type="text"
                placeholder="VD: Lễ gia tiên tông sen hồng cao cấp"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Phân Mục Chính"
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                options={CATEGORY_OPTIONS}
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Thẻ Phân Loại"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                options={tagOptions}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Địa Điểm Thực Hiện"
                type="text"
                placeholder="VD: Furama Resort, Đà Nẵng"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Thời Gian"
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Ngân Sách Ước Tính"
                type="text"
                placeholder="VD: 15.000.000 - 25.000.000 VNĐ"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Trạng Thái Hiển Thị"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProjectItem["status"],
                  })
                }
                options={STATUS_OPTIONS}
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Hạng Mục Giá"
                value={formData.priceTier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceTier: e.target.value as ProjectItem["priceTier"],
                  })
                }
                options={PRICE_TIER_OPTIONS}
              />
            </div>

            {/* Cover Image */}
            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label>Ảnh Bìa Đại Diện Dự Án *</label>
              <label className={styles.uploadDropzone}>
                <CloudArrowUpIcon
                  className={`h-9 w-9 ${styles.uploadIcon}`}
                  style={{ width: 36, height: 36 }}
                />
                <span className={styles.uploadText}>Chọn ảnh bìa từ thiết bị</span>
                <span className={styles.uploadHint}>
                  Nhấp để chọn 1 tệp ảnh làm bìa chính (PNG, JPG, WEBP, SVG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>

              {formData.src && (
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#10b981",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    Xem trước ảnh bìa chính
                  </div>
                  <div className={styles.imagePreviewBox}>
                    <img
                      src={formData.src}
                      alt="Preview"
                      className={styles.imagePreview}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0];
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Image Album Slot Picker */}
            <ProjectGalleryEditor
              galleryUrls={galleryUrls}
              customSpans={customSpans}
              setCustomSpans={setCustomSpans}
              activeSlotCount={activeSlotCount}
              setActiveSlotCount={setActiveSlotCount}
              coverSrc={formData.src}
              slotFileInputRef={slotFileInputRef}
              onSlotClick={handleSlotClick}
              onSlotFileSelected={handleSlotFileSelected}
              onMultiGalleryUpload={handleMultiGalleryUpload}
              onRemoveGalleryItem={handleRemoveGalleryItem}
              onMakeCover={handleMakeCover}
            />

            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <Textarea
                label="Mô tả chi tiết dự án"
                placeholder="Mô tả phong cách thiết kế, tone màu chủ đạo, các loại hoa tươi và vải voan đã sử dụng..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div
          className={styles.modalFooter}
          style={{ borderTop: "1px solid #334155", paddingTop: "12px", marginTop: "16px" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelBtn}
            disabled={submitting}
          >
            Hủy
          </button>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Đang lưu..." : project ? "Cập Nhật Dự Án" : "Thêm Dự Án Mới"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
