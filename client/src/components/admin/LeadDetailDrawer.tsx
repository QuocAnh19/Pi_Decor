import { X, Phone, Mail, CalendarHeart, MessageSquare } from "lucide-react";
import type { Lead, LeadStatus } from "../../lib/types";
import styles from "./LeadDetailDrawer.module.scss";

const statusLabel: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  closed: "Đã chốt",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

/**
 * Slide-in drawer for one lead — includes design_snapshot playback (§4 of
 * the spec: "hiện lại đúng vải/rèm/hoa/chi tiết khách đã chọn trong
 * Studio") for leads that came from the Studio's "Lưu thiết kế" flow.
 */
export function LeadDetailDrawer({ lead, onClose, onStatusChange }: LeadDetailDrawerProps) {
  if (!lead) return null;

  const snapshot = lead.design_snapshot;
  const flowerEntries = snapshot ? Object.entries(snapshot.flowers).filter(([, v]) => v) : [];

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{formatDate(lead.created_at)}</p>
            <h2 className={styles.name}>{lead.name}</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <div className={styles.contactRow}>
              <Phone size={14} strokeWidth={1.75} />
              <span>{lead.phone}</span>
            </div>
            {lead.email && (
              <div className={styles.contactRow}>
                <Mail size={14} strokeWidth={1.75} />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.wedding_date && (
              <div className={styles.contactRow}>
                <CalendarHeart size={14} strokeWidth={1.75} />
                <span>{lead.wedding_date}</span>
              </div>
            )}
          </section>

          {lead.message && (
            <section className={styles.section}>
              <p className={styles.sectionTitle}>
                <MessageSquare size={13} strokeWidth={1.75} /> Lời nhắn
              </p>
              <p className={styles.message}>{lead.message}</p>
            </section>
          )}

          <section className={styles.section}>
            <p className={styles.sectionTitle}>Trạng thái</p>
            <div className={styles.statusButtons}>
              {(Object.keys(statusLabel) as LeadStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.statusButton} ${lead.status === s ? styles.statusButtonActive : ""}`}
                  onClick={() => onStatusChange(lead.id, s)}
                >
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </section>

          {snapshot && (
            <section className={styles.section}>
              <p className={styles.sectionTitle}>Thiết kế đã phối trong Studio</p>

              {snapshot.baseFabric && (
                <div className={styles.snapshotRow}>
                  {snapshot.baseFabric.hex && (
                    <span className={styles.swatch} style={{ background: snapshot.baseFabric.hex }} />
                  )}
                  <span className={styles.snapshotLabel}>Vải nền</span>
                  <span className={styles.snapshotValue}>
                    {snapshot.baseFabric.style} · {snapshot.baseFabric.color}
                  </span>
                </div>
              )}

              {snapshot.valance?.enabled !== false && snapshot.valance?.style && (
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
        </div>
      </aside>
    </>
  );
}
