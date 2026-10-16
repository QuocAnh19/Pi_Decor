import React, { useState } from "react";
import type { MaterialItem } from "../../../lib/types";
import { Modal, Input, Select } from "../../../components/ui";
import styles from "./MaterialForm.module.scss";

interface MaterialFormProps {
  material: MaterialItem | null;
  onCancel: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: "fabric", label: "Rèm nền" },
  { value: "drape_detail", label: "Rèm chi tiết" },
  { value: "flowers", label: "Cụm hoa" },
  { value: "text_name", label: "Dãy chữ số" },
];

export function MaterialForm({ material, onCancel, onSubmit }: MaterialFormProps) {
  const [name, setName] = useState(material?.name ?? "");
  const [category, setCategory] = useState(material?.category ?? "fabric");
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
    <Modal
      isOpen
      onClose={onCancel}
      title={material ? "Chỉnh sửa vật liệu" : "Thêm vật liệu mới"}
      maxWidth="480px"
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <Input
          label="Tên vật liệu"
          required
          id="mat-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Voan Lụa Hồng Phấn"
        />

        <Select
          label="Phân mục (Category)"
          required
          id="mat-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
        />

        <div className={styles.fileBox}>
          <Input
            label="Ảnh đại diện vật liệu (File upload)"
            id="mat-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
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
    </Modal>
  );
}
