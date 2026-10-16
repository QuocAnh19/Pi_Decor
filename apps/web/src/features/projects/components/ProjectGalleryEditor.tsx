import React from "react";
import { PlusIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { ASYMMETRIC_SLOT_DESCS, SAMPLE_STOCK_IMAGES } from "../types";
import styles from "../../../pages/admin/AdminProjectsPage.module.scss";

export interface ProjectGalleryEditorProps {
  galleryUrls: string[];
  customSpans: Record<number, string>;
  setCustomSpans: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  activeSlotCount: number;
  setActiveSlotCount: React.Dispatch<React.SetStateAction<number>>;
  coverSrc: string;
  slotFileInputRef: React.RefObject<HTMLInputElement>;
  onSlotClick: (slotIdx: number) => void;
  onSlotFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMultiGalleryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGalleryItem: (idx: number) => void;
  onMakeCover: (url: string) => void;
}

/**
 * Bộ chọn và sắp xếp khung ảnh album dự án bất đối xứng (tối đa 10 ảnh).
 */
export function ProjectGalleryEditor({
  galleryUrls,
  customSpans,
  setCustomSpans,
  activeSlotCount,
  setActiveSlotCount,
  coverSrc,
  slotFileInputRef,
  onSlotClick,
  onSlotFileSelected,
  onMultiGalleryUpload,
  onRemoveGalleryItem,
  onMakeCover,
}: ProjectGalleryEditorProps) {
  return (
    <div
      className={`${styles.formGroup} ${styles.formFull}`}
      style={{ marginTop: "8px", borderTop: "1px solid #e7ded0", paddingTop: "16px" }}
    >
      <input
        type="file"
        ref={slotFileInputRef}
        accept="image/*"
        onChange={onSlotFileSelected}
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: "13px", fontWeight: "700", color: "#a15c2e", margin: 0 }}>
          Bộ ảnh album dự án
        </label>
        <span
          style={{
            fontSize: "11px",
            color: galleryUrls.length >= 10 ? "#b3733b" : "#47663b",
            fontWeight: "600",
          }}
        >
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
          const activeSpanClass =
            (styles as Record<string, string>)[activeSpanKey] || styles[slotDesc.spanKey];
          const url = galleryUrls[idx];
          const isCover = Boolean(url && url === coverSrc);

          return (
            <div
              key={`slot-${idx}`}
              className={`${styles.visualSlotTile} ${activeSpanClass} ${url ? styles.visualSlotFilled : ""}`}
              onClick={() => onSlotClick(idx)}
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
                      onClick={() => onMakeCover(url)}
                      title="Đặt làm ảnh bìa chính"
                    >
                      Bìa
                    </button>
                    <button
                      type="button"
                      className={`${styles.galleryActionBtn} ${styles.makeCoverBtn}`}
                      style={{ backgroundColor: "#a15c2e", color: "#fff" }}
                      onClick={() => onSlotClick(idx)}
                      title="Thay đổi ảnh khác"
                    >
                      Đổi
                    </button>
                    <button
                      type="button"
                      className={`${styles.galleryActionBtn} ${styles.deleteThumbBtn}`}
                      onClick={() => onRemoveGalleryItem(idx)}
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
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

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            fontSize: "12px",
            color: "#6e6259",
          }}
        >
          <CloudArrowUpIcon className="h-4 w-4" style={{ color: "#a15c2e" }} />
          <u>Hoặc chọn tải lên cùng lúc nhiều tệp ảnh</u>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onMultiGalleryUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>
    </div>
  );
}
