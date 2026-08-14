import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import type { MaterialItem } from "../../../lib/types";
import styles from "./MaterialList.module.scss";

interface MaterialListProps {
  materials: MaterialItem[];
  onAdd: () => void;
  onEdit: (material: MaterialItem) => void;
  onDelete: (material: MaterialItem) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  fabric: "Rèm nền",
  drape_detail: "Rèm chi tiết",
  drape: "Rèm chi tiết",
  flowers: "Cụm hoa",
  flower: "Cụm hoa",
  text_name: "Dãy chữ số",
  text_date: "Dãy chữ số",
};

export function MaterialList({ materials, onAdd, onEdit, onDelete }: MaterialListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Danh sách vật liệu ({materials.length})</h2>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <PlusIcon className="h-4 w-4" style={{ width: 16, height: 16 }} /> Thêm vật liệu
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
                  <PhotoIcon className="h-8 w-8" style={{ width: 32, height: 32, color: "#cbd5e1" }} />
                )}
              </div>

              <div className={styles.body}>
                <div className={styles.name}>{mat.name}</div>
                <div className={styles.badge}>{CATEGORY_LABELS[mat.category] ?? mat.category}</div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => onEdit(mat)}
                  aria-label="Sửa"
                >
                  <PencilIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                  onClick={() => onDelete(mat)}
                  aria-label="Xoá"
                >
                  <TrashIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
