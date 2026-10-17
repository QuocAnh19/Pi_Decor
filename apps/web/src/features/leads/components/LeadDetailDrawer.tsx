import { useState } from "react";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import type { Lead, LeadStatus } from "../../../lib/types";
import { formatDateTime } from "../../../lib/formatters";
import { Modal } from "../../../components/ui";
import { LeadOverviewTab } from "./LeadOverviewTab";
import { LeadActivityTimeline } from "./LeadActivityTimeline";
import styles from "./LeadDetailDrawer.module.scss";

const statusLabel: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  closed: "Đã chốt",
};

interface LeadDetailDrawerProps {
  lead: Lead | null;
  updatingStatusId?: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onOpenQuotation?: (lead: Lead) => void;
}

export function LeadDetailDrawer({
  lead,
  updatingStatusId,
  onClose,
  onStatusChange,
  onOpenQuotation,
}: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "activities">("overview");

  if (!lead) return null;

  let eventType = "";
  let cleanMessage = (lead.message || "").trim();

  // Strip all bracketed prefix tags (e.g. [Loại sự kiện: ...], [Lưu thiết kế Studio])
  while (cleanMessage.startsWith("[")) {
    const endIdx = cleanMessage.indexOf("]");
    if (endIdx === -1) break;
    const tagContent = cleanMessage.substring(1, endIdx).trim();
    if (tagContent.toLowerCase().startsWith("loại sự kiện:")) {
      eventType = tagContent.substring(13).trim();
    } else if (
      tagContent.toLowerCase().includes("studio") ||
      tagContent.toLowerCase().includes("thiết kế")
    ) {
      eventType = "PiWedding — Studio Phối Cảnh";
    } else if (!eventType) {
      eventType = tagContent;
    }
    cleanMessage = cleanMessage.substring(endIdx + 1).trim();
  }

  if (!eventType && lead.design_snapshot) {
    eventType = "PiWedding — Studio Phối Cảnh";
  }

  const drawerTitle = (
    <div className={styles.headerContent}>
      <span className={styles.eyebrow}>Đăng ký lúc: {formatDateTime(lead.created_at)}</span>
      <h2 className={styles.name}>
        <UserIcon className={styles.userIcon} />
        {lead.name}
      </h2>
    </div>
  );

  return (
    <Modal
      isOpen={Boolean(lead)}
      onClose={onClose}
      title={drawerTitle}
      variant="drawer"
      maxWidth="540px"
      closeOnBackdropClick={false}
    >
      {/* Thanh chuyển Tab: Tổng quan vs Hoạt động */}
      <div className={styles.drawerTabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`${styles.tabItem} ${activeTab === "overview" ? styles.tabItemActive : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <IdentificationIcon style={{ width: 16, height: 16 }} />
          <span>Thông tin chi tiết</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "activities"}
          className={`${styles.tabItem} ${activeTab === "activities" ? styles.tabItemActive : ""}`}
          onClick={() => setActiveTab("activities")}
        >
          <ClockIcon style={{ width: 16, height: 16 }} />
          <span>Hoạt động &amp; Lịch sử</span>
        </button>
      </div>

      {/* Trạng thái xử lý luôn xuất hiện trên cả 2 tab để thao tác nhanh */}
      <section className={styles.section} style={{ marginBottom: 16 }}>
        <p className={styles.sectionTitle}>
          <ChatBubbleLeftRightIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
          Trạng Thái Xử Lý &amp; Tư Vấn
        </p>
        <div className={styles.statusButtons}>
          {(Object.keys(statusLabel) as LeadStatus[]).map((s) => {
            const isActive = lead.status === s;
            const isUpdating = updatingStatusId === lead.id;

            let activeClass = styles.statusButtonActive;
            if (s === "new") activeClass = `${styles.statusButtonActive} ${styles.statusNewActive}`;
            if (s === "closed")
              activeClass = `${styles.statusButtonActive} ${styles.statusClosedActive}`;

            return (
              <button
                key={s}
                type="button"
                disabled={isUpdating}
                className={`${styles.statusButton} ${isActive ? activeClass : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isActive) {
                    onStatusChange(lead.id, s);
                  }
                }}
              >
                {isActive ? `${statusLabel[s]}` : statusLabel[s]}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === "overview" ? (
        <LeadOverviewTab
          lead={lead}
          eventType={eventType}
          cleanMessage={cleanMessage}
          snapshot={lead.design_snapshot}
          onClose={onClose}
          onOpenQuotation={onOpenQuotation}
        />
      ) : (
        <LeadActivityTimeline leadId={lead.id} />
      )}
    </Modal>
  );
}
