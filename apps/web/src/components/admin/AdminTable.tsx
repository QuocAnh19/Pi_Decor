import { ReactNode, HTMLAttributes } from "react";
import styles from "./adminComponents.module.scss";

export interface AdminTableHeaderItem {
  label: ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface AdminTableProps {
  headers: (ReactNode | AdminTableHeaderItem)[];
  children: ReactNode;
  className?: string;
}

/**
 * Khung hiển thị bảng dữ liệu quản trị chuẩn (Table View).
 * Gom styling inline table lặp hơn 35 dòng ở AdminProjectsPage, AdminStudioPage, MaterialList.
 */
export function AdminTable({ headers, children, className = "" }: AdminTableProps) {
  return (
    <div className={`${styles.tableWrapper} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHeaderRow}>
            {headers.map((h, i) => {
              if (h && typeof h === "object" && "label" in h) {
                const item = h as AdminTableHeaderItem;
                return (
                  <th
                    key={i}
                    className={styles.tableTh}
                    style={{
                      textAlign: item.align || "left",
                      width: item.width,
                    }}
                  >
                    {item.label}
                  </th>
                );
              }
              return (
                <th key={i} className={styles.tableTh}>
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export interface AdminTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

export function AdminTableRow({ children, className = "", ...rest }: AdminTableRowProps) {
  return (
    <tr className={`${styles.tableRow} ${className}`} {...rest}>
      {children}
    </tr>
  );
}
