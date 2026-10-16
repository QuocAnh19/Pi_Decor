import { useNavigate } from "react-router-dom";
import {
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { Lead, LeadStatus } from "../../../lib/types";
import { formatDateTime, formatWeddingDate } from "../../../lib/formatters";
import { Modal } from "../../../components/ui";
import { LeadDesignSnapshotSection } from "./LeadDesignSnapshotSection";
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
  const navigate = useNavigate();
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

  const snapshot = lead.design_snapshot;

  const drawerTitle = (
    <div className={styles.headerContent}>
      <span className={styles.eyebrow}>
        Đăng ký lúc: {formatDateTime(lead.created_at)}
      </span>
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
      {/* Action Buttons: Lập Báo Giá & Mở Trong Studio */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          className={styles.createQuoteBtn}
          onClick={() => {
            if (onOpenQuotation) {
              onOpenQuotation(lead);
            }
          }}
        >
          <DocumentTextIcon
            className="h-4 w-4"
            style={{ width: 18, height: 18 }}
          />
          <span>Lập Báo Giá Chi Tiết &amp; Xuất PDF</span>
        </button>

        {snapshot && (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/studio?leadId=${lead.id}`);
            }}
            style={{
              padding: "10px 16px",
              backgroundColor: "#271620",
              color: "#fbf7f1",
              border: "1px solid #a15c2e",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(39, 22, 32, 0.15)",
              transition: "all 0.15s ease",
            }}
          >
            <SparklesIcon
              className="h-4 w-4"
              style={{ width: 16, height: 16, color: "#fbbf24" }}
            />
            <span>Mở &amp; Tinh Chỉnh Trong Studio 3D</span>
          </button>
        )}
      </div>

      {/* Thông tin liên hệ */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>
          <PhoneIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
          Thông Tin Liên Hệ Khách Hàng
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.contactRow}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <PhoneIcon className={styles.contactIcon} />
              <span className={styles.contactValue}>{lead.phone}</span>
            </div>
          </div>

          <div className={styles.contactRow}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <EnvelopeIcon className={styles.contactIcon} />
              <span className={styles.contactValue}>
                {lead.email || "Chưa cung cấp email"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trạng thái xử lý */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>
          <ChatBubbleLeftRightIcon
            className="h-4 w-4"
            style={{ width: 16, height: 16 }}
          />
          Trạng Thái Xử Lý &amp; Tư Vấn
        </p>
        <div className={styles.statusButtons}>
          {(Object.keys(statusLabel) as LeadStatus[]).map((s) => {
            const isActive = lead.status === s;
            const isUpdating = updatingStatusId === lead.id;

            let activeClass = styles.statusButtonActive;
            if (s === "new")
              activeClass = `${styles.statusButtonActive} ${styles.statusNewActive}`;
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

      {/* Chi tiết đơn đăng ký */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>
          <CalendarDaysIcon
            className="h-4 w-4"
            style={{ width: 16, height: 16 }}
          />
          Nhu Cầu Sự Kiện &amp; Ghi Chú
        </p>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phân mục dịch vụ quan tâm:</span>
            <div>
              <span className={styles.eventTypeBadge}>
                {eventType || "PiWedding — Trang Trí Cưới Hỏi Cao Cấp"}
              </span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày tổ chức tiệc dự kiến:</span>
            <div className={styles.formValueCard}>
              <span className={styles.dateText}>
                {formatWeddingDate(lead.wedding_date)}
              </span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              Ý tưởng &amp; Ghi chú của khách hàng:
            </span>
            <div className={styles.formValueCard}>
              {cleanMessage ? (
                <p
                  style={{
                    margin: 0,
                    fontStyle: "italic",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  "{cleanMessage}"
                </p>
              ) : (
                <p className={styles.emptyNotes}>
                  Khách hàng không để lại ghi chú thêm.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {snapshot && <LeadDesignSnapshotSection snapshot={snapshot} />}
    </Modal>
  );
}
