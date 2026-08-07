import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import type { Project, ProjectPayload } from "../../lib/types";
import styles from "./ProjectForm.module.scss";

interface ProjectFormProps {
  venueName: string;
  project: Project | null; // null = create mode
  onCancel: () => void;
  onSubmit: (payload: ProjectPayload) => Promise<void>;
}

/** Add/edit a project (dự án đã làm) inside a venue — title, wedding date,
 * style tags, cover image, gallery, per §4/§5 of the spec. */
export function ProjectForm({ venueName, project, onCancel, onSubmit }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [weddingDate, setWeddingDate] = useState(project?.wedding_date ?? "");
  const [styleTags, setStyleTags] = useState(project?.style_tags.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(project?.cover_image ?? "");
  const [gallery, setGallery] = useState(project?.gallery.join("\n") ?? "");
  const [published, setPublished] = useState(project?.published ?? true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tên dự án.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        wedding_date: weddingDate.trim() || null,
        style_tags: styleTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        cover_image: coverImage.trim() || null,
        gallery: gallery
          .split("\n")
          .map((g) => g.trim())
          .filter(Boolean),
        published,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{project ? "Sửa dự án" : "Thêm dự án"}</h2>
            <p className={styles.subtitle}>{venueName}</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onCancel} aria-label="Đóng">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Tên dự án *</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={styles.input} />
          </label>

          <label className={styles.field}>
            <span>Ngày cưới</span>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span>Style tags (cách nhau bởi dấu phẩy)</span>
            <input
              value={styleTags}
              onChange={(e) => setStyleTags(e.target.value)}
              placeholder="pastel, sen hồng, ngoài trời"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span>Ảnh bìa (URL)</span>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={styles.input} />
          </label>

          <label className={styles.field}>
            <span>Gallery (mỗi URL một dòng)</span>
            <textarea
              value={gallery}
              onChange={(e) => setGallery(e.target.value)}
              rows={4}
              className={styles.textarea}
            />
          </label>

          <label className={styles.checkboxField}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span>Công khai trên Bản đồ</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Huỷ
            </button>
            <button type="submit" disabled={submitting} className={styles.submitButton}>
              {submitting ? "Đang lưu…" : "Lưu dự án"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
