import React, { useState, useEffect, useRef, FormEvent } from "react";
import { PlusIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Modal, Input, Select, Textarea } from "../../../components/ui";
import type { ProjectPayload } from "../../../lib/types";
import {
  ProjectItem,
  CATEGORY_TAG_OPTIONS,
  ASYMMETRIC_SLOT_DESCS,
  SAMPLE_STOCK_IMAGES,
  PRICE_TIER_OPTIONS,
} from "../types";
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
        customSpans: Record<number, string>
      ) => Promise<void>;
    }
  | {
      venueName: string;
      project: any;
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

  // Form states
  const [formData, setFormData] = useState<Omit<ProjectItem, "id">>({
    title: project?.title ?? "",
    categoryId: project?.categoryId ?? "piwedding",
    tag: project?.tag ?? (Array.isArray(project?.style_tags) ? project.style_tags[0] : "Gia Tiên"),
    location: project?.location ?? (venueName ? `Tại ${venueName}` : "Tư gia, Đà Nẵng"),
    src: project?.cover_image ?? project?.src ?? SAMPLE_STOCK_IMAGES[0],
    gallery: project?.gallery ?? [],
    description: project?.description ?? "",
    date: project?.wedding_date ?? project?.date ?? new Date().toISOString().split("T")[0],
    budget: project?.budget ?? "Thỏa thuận",
    status: project?.published === false ? "draft" : project?.status ?? "active",
    priceTier: project?.priceTier ?? (project as any)?.price_tier ?? "standard",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    if (!project?.gallery) return [];
    return (project.gallery as any[])
      .slice(0, 10)
      .map((item: any) => (typeof item === "string" ? item : item?.url || ""))
      .filter(Boolean);
  });

  const [customSpans, setCustomSpans] = useState<Record<number, string>>(() => {
    const spans: Record<number, string> = {};
    if (project?.gallery) {
      (project.gallery as any[]).slice(0, 10).forEach((item: any, idx: number) => {
        if (item && typeof item === "object" && item.span) {
          spans[idx] = item.span;
        }
      });
    }
    return spans;
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title ?? "",
        categoryId: project.categoryId ?? (Array.isArray((project as any).style_tags) ? (project as any).style_tags[0] : "piwedding"),
        tag: project.tag ?? (Array.isArray((project as any).style_tags) ? (project as any).style_tags[1] || (project as any).style_tags[0] : "Gia Tiên"),
        location: project.location ?? (venueName ? `Tại ${venueName}` : "Tư gia, Đà Nẵng"),
        src: project.src ?? (project as any).cover_image ?? SAMPLE_STOCK_IMAGES[0],
        gallery: project.gallery ?? [],
        description: project.description ?? "",
        date: project.date ?? (project as any).wedding_date ?? new Date().toISOString().split("T")[0],
        budget: project.budget ?? "Thỏa thuận",
        status: (project as any).published === false ? "draft" : project.status ?? "active",
        priceTier: project.priceTier ?? (project as any).price_tier ?? "standard",
      });

      if (project.gallery) {
        const urls = (project.gallery as any[])
          .slice(0, 10)
          .map((item: any) => (typeof item === "string" ? item : item?.url || ""))
          .filter(Boolean);
        setGalleryUrls(urls);

        const spans: Record<number, string> = {};
        (project.gallery as any[]).slice(0, 10).forEach((item: any, idx: number) => {
          if (item && typeof item === "object" && item.span) {
            spans[idx] = item.span;
          }
        });
        setCustomSpans(spans);
      }
    }
  }, [project, venueName]);

  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [activeSlotCount, setActiveSlotCount] = useState<number>(() =>
    Math.min(Math.max(galleryUrls.length + 2, 6), 10)
  );
  const [submitting, setSubmitting] = useState(false);

  const slotFileInputRef = useRef<HTMLInputElement | null>(null);
  const targetSlotIndexRef = useRef<number | null>(null);

  const handleCategoryChange = (newCatId: string) => {
    const availableTags = CATEGORY_TAG_OPTIONS[newCatId] || [];
    const defaultTag = availableTags[0] || "Gia Tiên";
    setFormData((prev) => ({
      ...prev,
      categoryId: newCatId,
      tag: availableTags.includes(prev.tag) ? prev.tag : defaultTag,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, src: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSlotClick = (slotIdx: number) => {
    targetSlotIndexRef.current = slotIdx;
    if (slotFileInputRef.current) {
      slotFileInputRef.current.value = "";
      slotFileInputRef.current.click();
    }
  };

  const handleSlotFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slotIdx = targetSlotIndexRef.current;
    if (slotIdx === null) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    setSelectedGalleryFiles((prev) => {
      const next = [...prev];
      next[slotIdx] = file;
      return next;
    });

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setGalleryUrls((prev) => {
          const next = [...prev];
          next[slotIdx] = reader.result as string;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultiGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 10 - galleryUrls.length;
    if (availableSlots <= 0) {
      alert("Bộ sưu tập đã đủ 10 ảnh!");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      setSelectedGalleryFiles((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setGalleryUrls((prev) => {
            if (prev.length >= 10) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveGalleryItem = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
    setSelectedGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setCustomSpans((prev) => {
      const next: Record<number, string> = {};
      Object.keys(prev).forEach((k) => {
        const num = Number(k);
        if (num < idx) next[num] = prev[num];
        else if (num > idx) next[num - 1] = prev[num];
      });
      return next;
    });
  };

  const handleMakeCover = (url: string) => {
    setFormData((prev) => ({ ...prev, src: url }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên dự án!");
      return;
    }

    setSubmitting(true);
    try {
      if (props.venueName !== undefined) {
        const payload: ProjectPayload = {
          title: formData.title.trim(),
          wedding_date: formData.date || null,
          style_tags: [formData.categoryId, formData.tag],
          cover_image: formData.src,
          gallery: (formData.gallery as any[]) || [],
          published: formData.status !== "draft",
          price_tier: formData.priceTier || "standard",
        };
        await props.onSubmit(payload);
      } else {
        await props.onSubmit(
          formData,
          selectedFile,
          galleryUrls,
          selectedGalleryFiles,
          customSpans
        );
      }
      onCancel();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu dự án!");
    } finally {
      setSubmitting(false);
    }
  };

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
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "76vh", overflowY: "auto", overflowX: "hidden", paddingRight: "4px" }}>
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={STATUS_OPTIONS}
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Hạng Mục Giá"
                value={formData.priceTier}
                onChange={(e) => setFormData({ ...formData, priceTier: e.target.value as any })}
                options={PRICE_TIER_OPTIONS}
              />
            </div>

            {/* Cover Image */}
            <div className={`${styles.formGroup} ${styles.formFull}`}>
              <label>Ảnh Bìa Đại Diện Dự Án *</label>
              <label className={styles.uploadDropzone}>
                <CloudArrowUpIcon className={`h-9 w-9 ${styles.uploadIcon}`} style={{ width: 36, height: 36 }} />
                <span className={styles.uploadText}>Chọn ảnh bìa từ thiết bị</span>
                <span className={styles.uploadHint}>Nhấp để chọn 1 tệp ảnh làm bìa chính (PNG, JPG, WEBP, SVG)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
              </label>

              {formData.src && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "600", marginBottom: "4px" }}>
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
            <div
              className={`${styles.formGroup} ${styles.formFull}`}
              style={{ marginTop: "8px", borderTop: "1px solid #e7ded0", paddingTop: "16px" }}
            >
              <input
                type="file"
                ref={slotFileInputRef}
                accept="image/*"
                onChange={handleSlotFileSelected}
                style={{ display: "none" }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#a15c2e", margin: 0 }}>
                  Bộ ảnh album dự án
                </label>
                <span style={{ fontSize: "11px", color: galleryUrls.length >= 10 ? "#b3733b" : "#47663b", fontWeight: "600" }}>
                  {galleryUrls.filter(Boolean).length} / 10 ảnh (Tối đa 10 ảnh)
                </span>
              </div>

              <p style={{ fontSize: "11px", color: "#6e6259", margin: "4px 0 12px 0" }}>
                Bấm trực tiếp vào từng vị trí Khung ảnh bên dưới để chọn ảnh tải lên.
              </p>

              <div className={styles.visualSlotGrid}>
                {Array.from({
                  length: Math.min(Math.max(galleryUrls.length + 1, activeSlotCount), 10),
                }).map((_, idx) => {
                  const slotDesc = ASYMMETRIC_SLOT_DESCS[idx % ASYMMETRIC_SLOT_DESCS.length];
                  const activeSpanKey = customSpans[idx] || slotDesc.spanKey;
                  const activeSpanClass = (styles as Record<string, string>)[activeSpanKey] || styles[slotDesc.spanKey];
                  const url = galleryUrls[idx];
                  const isCover = Boolean(url && url === formData.src);

                  return (
                    <div
                      key={`slot-${idx}`}
                      className={`${styles.visualSlotTile} ${activeSpanClass} ${url ? styles.visualSlotFilled : ""}`}
                      onClick={() => handleSlotClick(idx)}
                    >
                      {isCover && <span className={styles.visualSlotCoverBadge}>Ảnh bìa</span>}

                      <select
                        value={activeSpanKey}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCustomSpans((prev) => ({ ...prev, [idx]: e.target.value }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          left: "6px",
                          zIndex: 5,
                          backgroundColor: "rgba(255, 255, 255, 0.92)",
                          color: "#a15c2e",
                          border: "1px solid #e7ded0",
                          borderRadius: "4px",
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "2px 4px",
                          cursor: "pointer",
                          boxShadow: "0 1px 4px rgba(39, 22, 32, 0.08)",
                          maxWidth: "calc(100% - 12px)",
                        }}
                      >
                        <option value="span2x3">Hero Đại Diện (2x3)</option>
                        <option value="span4x2">Banner Ngang Rộng (4x2)</option>
                        <option value="span1x3">Dọc Cao Slim (1x3)</option>
                        <option value="span2x2">Nổi Bật Vừa (2x2)</option>
                        <option value="span1x2">Dọc Thường (1x2)</option>
                        <option value="span2x1">Ngang Thường (2x1)</option>
                        <option value="span3x2">Panorama (3x2)</option>
                        <option value="span1x1">Vuông Nhỏ (1x1)</option>
                      </select>

                      {url ? (
                        <>
                          <img
                            src={url}
                            alt={`Slot ${idx + 1}`}
                            className={styles.galleryThumb}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = SAMPLE_STOCK_IMAGES[0];
                            }}
                          />
                          <div className={styles.galleryItemActions} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`${styles.galleryActionBtn} ${styles.makeCoverBtn}`}
                              onClick={() => handleMakeCover(url)}
                              title="Đặt làm ảnh bìa chính"
                            >
                              Bìa
                            </button>
                            <button
                              type="button"
                              className={`${styles.galleryActionBtn} ${styles.makeCoverBtn}`}
                              style={{ backgroundColor: "#a15c2e", color: "#fff" }}
                              onClick={() => handleSlotClick(idx)}
                              title="Thay đổi ảnh khác"
                            >
                              Đổi
                            </button>
                            <button
                              type="button"
                              className={`${styles.galleryActionBtn} ${styles.deleteThumbBtn}`}
                              onClick={() => handleRemoveGalleryItem(idx)}
                              title="Xóa ảnh"
                            >
                              Xóa
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className={styles.visualSlotEmpty}>
                          <PlusIcon className="h-5 w-5" style={{ color: "#a15c2e" }} />
                          <span className={styles.visualSlotLabel}>{slotDesc.label}</span>
                          <span className={styles.visualSlotHint}>Bấm chọn ảnh</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setActiveSlotCount((prev) => Math.min(prev + 2, 10))}
                  disabled={galleryUrls.length >= 10 || activeSlotCount >= 10}
                  className={styles.cancelBtn}
                  style={{
                    backgroundColor: "#fbf7f1",
                    border: "1px solid #e7ded0",
                    color: galleryUrls.length >= 10 || activeSlotCount >= 10 ? "#9c9186" : "#a15c2e",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    borderRadius: "8px",
                    cursor: galleryUrls.length >= 10 || activeSlotCount >= 10 ? "not-allowed" : "pointer",
                  }}
                >
                  + Thêm Vị Trí Khung Ảnh Mới (Tối Đa 10)
                </button>

                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", color: "#6e6259" }}>
                  <CloudArrowUpIcon className="h-4 w-4" style={{ color: "#a15c2e" }} />
                  <u>Hoặc chọn tải lên cùng lúc nhiều tệp ảnh</u>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultiGalleryUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

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

        <div className={styles.modalFooter} style={{ borderTop: "1px solid #334155", paddingTop: "12px", marginTop: "16px" }}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={submitting}>
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
