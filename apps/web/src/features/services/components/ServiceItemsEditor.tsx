import { ChangeEvent } from "react";
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Input } from "../../../components/ui";
import styles from "./ServiceFormModal.module.scss";

interface ServiceItemsEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
}

/** Component quản lý danh sách phân mục con động của dịch vụ */
export function ServiceItemsEditor({ items, onChange }: ServiceItemsEditorProps) {
  const handleAddItem = () => {
    onChange([...items, ""]);
  };

  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const next = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
  };

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Danh sách phân mục con (Items)</label>
      <span className={styles.hint}>Các hạng mục hiển thị trong popup chi tiết và Lookbook</span>
      <div className={styles.itemsList}>
        {items.map((it, idx) => (
          <div key={idx} className={styles.itemRow}>
            <div className={styles.itemInput}>
              <Input
                value={it}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleItemChange(idx, e.target.value)
                }
                placeholder={`Hạng mục ${idx + 1} (VD: Trang trí bàn gallery)`}
              />
            </div>
            <button
              type="button"
              className={styles.itemBtn}
              onClick={() => handleMoveItem(idx, "up")}
              disabled={idx === 0}
              title="Di chuyển lên"
              aria-label={`Di chuyển hạng mục ${idx + 1} lên`}
            >
              <ChevronUpIcon style={{ width: 14, height: 14 }} />
            </button>
            <button
              type="button"
              className={styles.itemBtn}
              onClick={() => handleMoveItem(idx, "down")}
              disabled={idx === items.length - 1}
              title="Di chuyển xuống"
              aria-label={`Di chuyển hạng mục ${idx + 1} xuống`}
            >
              <ChevronDownIcon style={{ width: 14, height: 14 }} />
            </button>
            <button
              type="button"
              className={`${styles.itemBtn} ${styles.itemDeleteBtn}`}
              onClick={() => handleRemoveItem(idx)}
              title="Xoá mục"
              aria-label={`Xoá hạng mục ${idx + 1}`}
            >
              <TrashIcon style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItemBtn} onClick={handleAddItem}>
        <PlusIcon style={{ width: 14, height: 14 }} />
        <span>Thêm hạng mục con</span>
      </button>
    </div>
  );
}
