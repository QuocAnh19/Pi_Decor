import { useState } from "react";
import {
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  SwatchIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { QuotationModal } from "./QuotationModal";
import type { Lead, LeadStatus } from "../../../lib/types";
import { formatDateTime, formatWeddingDate } from "../../../lib/formatters";
import { Modal } from "../../../components/ui";
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
}

export function LeadDetailDrawer({
  lead,
  updatingStatusId,
  onClose,
  onStatusChange,
}: LeadDetailDrawerProps) {
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);

  if (!lead) return null;

  let eventType = "";
  let cleanMessage = lead.message || "";
  if (cleanMessage.startsWith("[Loại sự kiện:")) {
    const endIdx = cleanMessage.indexOf("]");
    if (endIdx !== -1) {
      eventType = cleanMessage.substring(15, endIdx).trim();
      cleanMessage = cleanMessage.substring(endIdx + 1).trim();
    }
  }

  const snapshot = lead.design_snapshot;
  const flowerEntries = snapshot
    ? Object.entries(snapshot.flowers).filter(([, v]) => v)
    : [];

  const drawerTitle = (
    <div>
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
    <>
      <Modal
        isOpen={Boolean(lead)}
        onClose={onClose}
        title={drawerTitle}
        variant="drawer"
        maxWidth="520px"
      >
          <section className={styles.section}>
            <p className={styles.sectionTitle}>Thông Tin Liên Hệ Khách Hàng</p>

            <div className={styles.infoGrid}>
              <div className={styles.contactRow}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <PhoneIcon className={styles.contactIcon} />
                  <span style={{ fontWeight: 600 }}>{lead.phone}</span>
                </div>
              </div>

              <div className={styles.contactRow}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <EnvelopeIcon className={styles.contactIcon} />
                  <span style={{ fontWeight: 600 }}>
                    {lead.email || "Chưa cung cấp"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <p className={styles.sectionTitle}>Chi Tiết Đơn Đăng Ký Tư Vấn</p>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Loại sự kiện quan tâm:</span>
                <div>
                  <span className={styles.eventTypeBadge}>
                    {eventType || "PiWedding — Trang Trí Cưới Hỏi"}
                  </span>
                </div>
              </div>

              <div className={styles.infoItem} style={{ marginTop: "6px" }}>
                <span className={styles.infoLabel}>Ngày tổ chức dự kiến:</span>
                <div
                  className={styles.formValueCard}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span className={styles.dateText}>
                    {formatWeddingDate(lead.wedding_date)}
                  </span>
                </div>
              </div>

              <div className={styles.infoItem} style={{ marginTop: "6px" }}>
                <span className={styles.infoLabel}>
                  Ý tưởng &amp; Ghi chú thêm của Khách hàng:
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

          <section className={styles.section}>
            <p className={styles.sectionTitle}>Trạng thái xử lý</p>
            <div
              className={styles.statusButtons}
              style={{ marginBottom: "12px" }}
            >
              {(Object.keys(statusLabel) as LeadStatus[]).map((s) => {
                const isActive = lead.status === s;
                const isUpdating = updatingStatusId === lead.id;

                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isUpdating}
                    className={`${styles.statusButton} ${isActive ? styles.statusButtonActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isActive) {
                        onStatusChange(lead.id, s);
                      }
                    }}
                    style={{
                      cursor: isUpdating
                        ? "wait"
                        : isActive
                          ? "default"
                          : "pointer",
                      opacity: isUpdating ? 0.7 : 1,
                    }}
                  >
                    {isActive && "✓ "}
                    {statusLabel[s]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className={styles.createQuoteBtn}
              onClick={() => setQuotationModalOpen(true)}
            >
              <DocumentTextIcon
                className="h-4 w-4"
                style={{ width: 16, height: 16 }}
              />
              Lập báo giá chi tiết cho khách hàng
            </button>
          </section>

          {snapshot && (
            <section className={styles.section}>
              <p className={styles.sectionTitle}>
                <SwatchIcon
                  className="h-4 w-4 inline"
                  style={{ width: 16, height: 16 }}
                />{" "}
                Phối Cảnh Thiết Kế Từ Studio 3D
              </p>

              {snapshot.baseFabric && (
                <div className={styles.snapshotRow}>
                  {snapshot.baseFabric.hex && (
                    <span
                      className={styles.swatch}
                      style={{ background: snapshot.baseFabric.hex }}
                    />
                  )}
                  <span className={styles.snapshotLabel}>Vải nền</span>
                  <span className={styles.snapshotValue}>
                    {snapshot.baseFabric.style} · {snapshot.baseFabric.color}
                  </span>
                </div>
              )}

              {snapshot.valance?.enabled !== false &&
                snapshot.valance?.style && (
                  <div className={styles.snapshotRow}>
                    <span className={styles.snapshotLabel}>Mảng rèm</span>
                    <span className={styles.snapshotValue}>
                      {snapshot.valance.style} · {snapshot.valance.color}
                    </span>
                  </div>
                )}

              {flowerEntries.map(([key, value]) => (
                <div key={key} className={styles.snapshotRow}>
                  <span className={styles.snapshotLabel}>{value!.slot}</span>
                  <span className={styles.snapshotValue}>
                    {value!.shape} · {value!.tone}
                  </span>
                </div>
              ))}

              {snapshot.details && (
                <div className={styles.snapshotRow}>
                  <span className={styles.snapshotLabel}>Chi tiết</span>
                  <span className={styles.snapshotValue}>
                    {[
                      snapshot.details.monogram?.enabled &&
                        `Monogram "${snapshot.details.monogram.text || "—"}"`,
                      snapshot.details.ribbon && "Dải ruy băng",
                      snapshot.details.lights && "Đèn trang trí",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Không có"}
                  </span>
                </div>
              )}
            </section>
          )}
      </Modal>

      {quotationModalOpen && (
        <QuotationModal
          lead={lead}
          onClose={() => setQuotationModalOpen(false)}
          onSaved={() => {}}
        />
      )}
    </>
  );
}
