import { ChangeEvent } from "react";
import { Input } from "../../../components/ui";
import styles from "./ServiceFormModal.module.scss";

interface ServiceMediaUploaderProps {
  coverUrlId: string;
  imageUrlId: string;
  coverUrl: string;
  imageUrl: string;
  onCoverFileChange: (file: File | null) => void;
  onCoverUrlChange: (url: string) => void;
  onImageFileChange: (file: File | null) => void;
  onImageUrlChange: (url: string) => void;
}

/** Component quản lý upload/nhập link ảnh cover và image phụ cho dịch vụ */
export function ServiceMediaUploader({
  coverUrlId,
  imageUrlId,
  coverUrl,
  imageUrl,
  onCoverFileChange,
  onCoverUrlChange,
  onImageFileChange,
  onImageUrlChange,
}: ServiceMediaUploaderProps) {
  return (
    <div className={styles.row}>
      <div className={styles.fieldGroup}>
        <label htmlFor={coverUrlId} className={styles.label}>
          Ảnh bìa thẻ (Cover Image)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onCoverFileChange(e.target.files?.[0] || null)}
        />
        <Input
          id={coverUrlId}
          value={coverUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onCoverUrlChange(e.target.value)}
          placeholder="Hoặc dán URL ảnh bìa..."
        />
        {coverUrl && (
          <div className={styles.imagePreviewWrap}>
            <img src={coverUrl} alt="Cover preview" className={styles.previewThumb} />
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={imageUrlId} className={styles.label}>
          Ảnh minh họa phụ (Image URL)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
        />
        <Input
          id={imageUrlId}
          value={imageUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onImageUrlChange(e.target.value)}
          placeholder="Hoặc dán URL ảnh phụ..."
        />
        {imageUrl && (
          <div className={styles.imagePreviewWrap}>
            <img src={imageUrl} alt="Image preview" className={styles.previewThumb} />
          </div>
        )}
      </div>
    </div>
  );
}
