import React, { useState } from "react";
import { X } from "lucide-react";
import type { MaterialItem } from "../../lib/types";
import styles from "./MaterialForm.module.scss";

interface MaterialFormProps {
  material: MaterialItem | null;
  onCancel: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const CATEGORIES = [
  "fabric",
  "flowers",
  "arch",
  "lighting",
  "drape",
  "drape_detail",
  "flower",
  "text_name",
  "text_date",
  "color_accent",
  "prop",
];

export function MaterialForm({ material, onCancel, onSubmit }: MaterialFormProps) {
  const [name, setName] = useState(material?.name ?? "");
  const [category, setCategory] = useState(material?.category ?? "fabric");
  const [colorHex, setColorHex] = useState(material?.color_hex ?? "#E7B6BB");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(material?.image_url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên vật liệu.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category);
    if (colorHex) formData.append("color_hex", colorHex);
    if (file) formData.append("image", file);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{material ? "Chỉnh sửa vật liệu" : "Thêm vật liệu mới"}</h3>
          <button type="button" className={styles.closeButton} onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="mat-name">Tên vật liệu *</label>
            <input
              id="mat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Voan Lụa Hồng Phấn"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="mat-cat">Phân mục (Category) *</label>
            <select id="mat-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="mat-color">Mã màu swatch (HEX)</label>
            <div className={styles.colorRow}>
              <input
                type="color"
                value={colorHex.startsWith("#") ? colorHex : "#E7B6BB"}
                onChange={(e) => setColorHex(e.target.value)}
              />
              <input
                id="mat-color"
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>

          <div className={`${styles.field} ${styles.fileBox}`}>
            <label htmlFor="mat-file">Ảnh đại diện vật liệu (File upload)</label>
            <input id="mat-file" type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" className={styles.imagePreview} />}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Đang lưu..." : material ? "Lưu thay đổi" : "Tạo vật liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
