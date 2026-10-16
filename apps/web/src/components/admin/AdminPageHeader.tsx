import { ReactNode } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import styles from "./adminComponents.module.scss";

export interface AdminPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  addIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Header chuẩn cho mọi trang quản trị (tiêu đề, mô tả và nút hành động chính).
 * Rút gọn các đoạn headerRow trùng lặp giữa các trang Admin.
 */
export function AdminPageHeader({
  title,
  subtitle,
  action,
  onAdd,
  addLabel,
  addIcon,
  className = "",
  children,
}: AdminPageHeaderProps) {
  return (
    <div className={`${styles.headerRow} ${className}`}>
      <div className={styles.headerText}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      {action ? (
        action
      ) : onAdd && addLabel ? (
        <button type="button" onClick={onAdd} className={styles.addButton}>
          {addIcon || <PlusIcon className="h-4 w-4" style={{ width: 18, height: 18 }} />}
          <span>{addLabel}</span>
        </button>
      ) : null}

      {children}
    </div>
  );
}
