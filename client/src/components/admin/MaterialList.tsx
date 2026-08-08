import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { MaterialItem } from "../../lib/types";
import styles from "./MaterialList.module.scss";

interface MaterialListProps {
  materials: MaterialItem[];
  onAdd: () => void;
  onEdit: (material: MaterialItem) => void;
  onDelete: (material: MaterialItem) => void;
}

export function MaterialList({ materials, onAdd, onEdit, onDelete }: MaterialListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Danh sách vật liệu ({materials.length})</h2>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <Plus size={16} strokeWidth={2} /> Thêm vật liệu
        </button>
      </div>

      {materials.length === 0 ? (
        <div className={styles.empty}>Chưa có vật liệu nào. Nhấn "Thêm vật liệu" để bắt đầu.</div>
      ) : (
        <div className={styles.grid}>
          {materials.map((mat) => (
            <div key={mat.id} className={styles.card}>
              <div className={styles.preview}>
                {mat.image_url ? (
                  <img src={mat.image_url} alt={mat.name} className={styles.image} />
                ) : mat.color_hex ? (
                  <div className={styles.swatch} style={{ backgroundColor: mat.color_hex }} />
                ) : (
                  <ImageIcon size={32} strokeWidth={1} color="#cbd5e1" />
                )}
              </div>

              <div className={styles.body}>
                <div className={styles.name}>{mat.name}</div>
                <div className={styles.badge}>{mat.category}</div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => onEdit(mat)}
                  aria-label="Sửa"
                >
                  <Pencil size={14} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => onDelete(mat)}
                  aria-label="Xoá"
                >
                  <Trash2 size={14} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
