import { Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
import styles from "./adminComponents.module.scss";

export type ViewMode = "grid" | "table";

export interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  gridTitle?: string;
  tableTitle?: string;
  className?: string;
}

/**
 * Nút chuyển đổi giao diện Lưới (Grid) / Bảng (Table) dùng chung cho các màn quản trị.
 * Thay thế hơn 20 dòng code inline trùng lặp ở từng trang.
 */
export function ViewToggle({
  viewMode,
  onChange,
  gridTitle = "Xem dạng lưới",
  tableTitle = "Xem dạng bảng",
  className = "",
}: ViewToggleProps) {
  return (
    <div className={`${styles.viewToggle} ${className}`}>
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleActive : ""}`}
        title={gridTitle}
      >
        <Squares2X2Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`${styles.viewToggleBtn} ${viewMode === "table" ? styles.viewToggleActive : ""}`}
        title={tableTitle}
      >
        <ListBulletIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}
