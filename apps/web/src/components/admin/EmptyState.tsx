import { ReactNode } from "react";
import styles from "./adminComponents.module.scss";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Hiển thị trạng thái danh sách trống hoặc không có kết quả tìm kiếm.
 * Giúp giao diện nhất quán giữa các trang quản trị.
 */
export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <p className={styles.emptyTitle}>{title}</p>
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}
