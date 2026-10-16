import { ReactNode } from "react";
import styles from "./adminComponents.module.scss";

export interface StatusTabItem {
  id: string;
  label: ReactNode;
}

export interface StatusTabsProps {
  tabs: StatusTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

/**
 * Thanh chuyển tabs trạng thái / phân mục dùng chung cho các màn quản trị.
 * Chuẩn hoá giao diện tab pill và rút gọn logic lặp tabsRow.
 */
export function StatusTabs({ tabs, activeTab, onChange, className = "" }: StatusTabsProps) {
  return (
    <div className={`${styles.tabsRow} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ""}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
