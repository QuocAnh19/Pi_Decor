import React, { useEffect, useState } from "react";
import {
  X,
  Phone,
  Mail,
  CalendarHeart,
  MessageSquare,
  ArrowRightLeft,
  StickyNote,
  FileText,
  Palette,
  Clock,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/authContext";
import { QuotationModal } from "./QuotationModal";
import type { ActivityType, Lead, LeadActivity, LeadStatus } from "../../lib/types";
import styles from "./LeadDetailDrawer.module.scss";

const statusLabel: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  closed: "Đã chốt",
};

const activityTypeLabel: Record<ActivityType, string> = {
  status_change: "Đổi trạng thái",
  note: "Ghi chú",
  call: "Cuộc gọi",
  email: "Email",
  quotation_sent: "Gửi báo giá",
  design_saved: "Lưu phối cảnh",
};

const activityIconMap: Record<ActivityType, React.ElementType> = {
  status_change: ArrowRightLeft,
  note: StickyNote,
  call: Phone,
  email: Mail,
  quotation_sent: FileText,
  design_saved: Palette,
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
 * Slide-in drawer for one lead — includes design_snapshot playback and activity timeline.
 */
export function LeadDetailDrawer({ lead, onClose, onStatusChange }: LeadDetailDrawerProps) {
  const { token } = useAuth();
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);

  useEffect(() => {
    if (!lead || !token) return;
    setActivitiesLoading(true);
    api
      .getLeadActivities(lead.id, token)
      .then(setActivities)
      .catch((err) => console.warn("Failed to load activities:", err))
      .finally(() => setActivitiesLoading(false));
  }, [lead?.id, token]);

  if (!lead) return null;

  const snapshot = lead.design_snapshot;
  const flowerEntries = snapshot ? Object.entries(snapshot.flowers).filter(([, v]) => v) : [];

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!lead || !token || !noteBody.trim()) return;

    setSubmittingNote(true);
    try {
      const newAct = await api.addLeadActivity(
        lead.id,
        { activity_type: "note", body: noteBody.trim() },
        token
      );
      setActivities((prev) => [newAct, ...prev]);
      setNoteBody("");
    } catch (err) {
      console.error("Failed to add note activity:", err);
    } finally {
      setSubmittingNote(false);
    }
  }

  function renderActivityContent(act: LeadActivity) {
    if (act.activity_type === "status_change" && act.metadata?.from && act.metadata?.to) {
      const fromText = statusLabel[act.metadata.from as LeadStatus] ?? act.metadata.from;
      const toText = statusLabel[act.metadata.to as LeadStatus] ?? act.metadata.to;
      return `Trạng thái chuyển từ "${fromText}" sang "${toText}"`;
    }
    return act.body ?? "—";
  }

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

          <section className={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <p className={styles.sectionTitle} style={{ margin: 0 }}>Báo giá dịch vụ</p>
              <button
                type="button"
                className={styles.statusButton}
                style={{ flex: "none", padding: "6px 12px", background: "#7c3aed", color: "#fff", borderColor: "#7c3aed", cursor: "pointer" }}
                onClick={() => setQuotationModalOpen(true)}
              >
                + Tạo báo giá
              </button>
            </div>
          </section>

          {/* Timeline & Lead Activities */}
          <section className={styles.section}>
            <p className={styles.sectionTitle}>
              <Clock size={13} strokeWidth={1.75} /> Timeline hoạt động
            </p>

            {activitiesLoading ? (
              <p className={styles.timelineContent}>Đang tải timeline...</p>
            ) : activities.length === 0 ? (
              <p className={styles.timelineContent}>Chưa có lịch sử hoạt động.</p>
            ) : (
              <div className={styles.timelineList}>
                {activities.map((act) => {
                  const IconComp = activityIconMap[act.activity_type] ?? Clock;
                  return (
                    <div key={act.id} className={styles.timelineItem}>
                      <div className={styles.timelineIcon}>
                        <IconComp size={14} strokeWidth={1.75} />
                      </div>
                      <div className={styles.timelineBody}>
                        <div className={styles.timelineHeader}>
                          <span className={styles.timelineType}>
                            {activityTypeLabel[act.activity_type] ?? act.activity_type}
                          </span>
                          <span className={styles.timelineTime}>{formatDate(act.created_at)}</span>
                        </div>
                        <div className={styles.timelineContent}>{renderActivityContent(act)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note form */}
            <form className={styles.noteForm} onSubmit={handleAddNote}>
              <textarea
                className={styles.noteTextarea}
                placeholder="Thêm ghi chú riêng cho lead này..."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
              />
              <button
                type="submit"
                className={styles.noteSubmitBtn}
                disabled={submittingNote || !noteBody.trim()}
              >
                {submittingNote ? "Đang gửi..." : "Ghi chú"}
              </button>
            </form>
          </section>
        </div>
      </aside>

      {quotationModalOpen && (
        <QuotationModal
          lead={lead}
          onClose={() => setQuotationModalOpen(false)}
          onSaved={() => {
            if (token) {
              api.getLeadActivities(lead.id, token).then(setActivities).catch(() => {});
            }
          }}
        />
      )}
    </>
  );
}
