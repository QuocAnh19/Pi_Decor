import { useNavigate } from "react-router-dom";
import {
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { Lead, DesignSnapshot } from "../../../lib/types";
import { formatWeddingDate } from "../../../lib/formatters";
import { LeadDesignSnapshotSection } from "./LeadDesignSnapshotSection";
import styles from "./LeadDetailDrawer.module.scss";

interface LeadOverviewTabProps {
  lead: Lead;
  eventType: string;
  cleanMessage: string;
  snapshot?: DesignSnapshot | null;
  onClose: () => void;
  onOpenQuotation?: (lead: Lead) => void;
}

export function LeadOverviewTab({
  lead,
  eventType,
  cleanMessage,
  snapshot,
  onClose,
  onOpenQuotation,
}: LeadOverviewTabProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Action Buttons: Lập Báo Giá & Mở Trong Studio */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          className={styles.createQuoteBtn}
          onClick={() => {
            if (onOpenQuotation) onOpenQuotation(lead);
          }}
        >
          <DocumentTextIcon style={{ width: 18, height: 18 }} />
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
            <SparklesIcon style={{ width: 16, height: 16, color: "#fbbf24" }} />
            <span>Mở &amp; Tinh Chỉnh Trong Studio 3D</span>
          </button>
        )}
      </div>

      {/* Thông tin liên hệ */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>
          <PhoneIcon style={{ width: 16, height: 16 }} />
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
              <span className={styles.contactValue}>{lead.email || "Chưa cung cấp email"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chi tiết đơn đăng ký */}
      <section className={styles.section}>
        <p className={styles.sectionTitle}>
          <CalendarDaysIcon style={{ width: 16, height: 16 }} />
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
              <span className={styles.dateText}>{formatWeddingDate(lead.wedding_date)}</span>
            </div>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ý tưởng &amp; Ghi chú của khách hàng:</span>
            <div className={styles.formValueCard}>
              {cleanMessage ? (
                <p style={{ margin: 0, fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                  "{cleanMessage}"
                </p>
              ) : (
                <p className={styles.emptyNotes}>Khách hàng không để lại ghi chú thêm.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {snapshot && <LeadDesignSnapshotSection snapshot={snapshot} />}
    </>
  );
}
