import {
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  SwatchIcon,
  UserIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
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
  onOpenQuotation?: (lead: Lead) => void;
}

export function LeadDetailDrawer({
  lead,
  updatingStatusId,
  onClose,
  onStatusChange,
  onOpenQuotation,
}: LeadDetailDrawerProps) {
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
  const flowerEntries = snapshot?.flowers
    ? Object.entries(snapshot.flowers).filter(([, v]) => v)
    : [];

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

  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, "") : "";

  return (
    <Modal
      isOpen={Boolean(lead)}
      onClose={onClose}
      title={drawerTitle}
      variant="drawer"
      maxWidth="540px"
      closeOnBackdropClick={false}
    >
      {/* Primary Action Button: Lập Báo Giá Chi Tiết */}
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
            {cleanPhone && (
              <div style={{ display: "flex", gap: "6px" }}>
                <a
                  href={`tel:${cleanPhone}`}
                  className={styles.contactActionBtn}
                  title="Gọi điện trực tiếp"
                >
                  Gọi điện
                </a>
                <a
                  href={`https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.contactActionBtn}
                  style={{ backgroundColor: "#0068ff" }}
                  title="Nhắn tin Zalo"
                >
                  Zalo
                </a>
              </div>
            )}
          </div>

          <div className={styles.contactRow}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <EnvelopeIcon className={styles.contactIcon} />
              <span className={styles.contactValue}>
                {lead.email || "Chưa cung cấp email"}
              </span>
            </div>
            {/* {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className={styles.contactActionBtn}
                style={{ backgroundColor: "#6e6259" }}
              >
                Gửi Mail
              </a>
            )} */}
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

      {/* Phối cảnh thiết kế từ Studio 3D (nếu có) */}
      {snapshot && (
        <section className={styles.section}>
          <p className={styles.sectionTitle}>
            <SwatchIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            Phối Cảnh Thiết Kế Khách Hàng Đã Tự Phối
          </p>

          <div className={styles.snapshotContainer}>
            {snapshot.preview_image && (
              <div
                style={{
                  marginBottom: "14px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e7ded0",
                }}
              >
                <img
                  src={snapshot.preview_image}
                  alt="Ảnh phối cảnh thiết kế của khách hàng"
                  style={{
                    width: "100%",
                    maxHeight: "260px",
                    objectFit: "contain",
                    backgroundColor: "#0f172a",
                    display: "block",
                  }}
                />
              </div>
            )}

            {snapshot.baseFabric && (
              <div className={styles.snapshotRow}>
                {snapshot.baseFabric.hex && (
                  <span
                    className={styles.swatch}
                    style={{ background: snapshot.baseFabric.hex }}
                  />
                )}
                <span className={styles.snapshotLabel}>Vải rèm nền:</span>
                <span className={styles.snapshotValue}>
                  {snapshot.baseFabric.style} · {snapshot.baseFabric.color}
                </span>
              </div>
            )}

            {snapshot.valance?.enabled !== false && snapshot.valance?.style && (
              <div className={styles.snapshotRow}>
                <span className={styles.snapshotLabel}>Mảng rèm vắt:</span>
                <span className={styles.snapshotValue}>
                  {snapshot.valance.style} · {snapshot.valance.color}
                </span>
              </div>
            )}

            {flowerEntries.map(([key, value]) => (
              <div key={key} className={styles.snapshotRow}>
                <span className={styles.snapshotLabel}>{value!.slot}:</span>
                <span className={styles.snapshotValue}>
                  {value!.shape} · {value!.tone}
                </span>
              </div>
            ))}

            {snapshot.details && (
              <div className={styles.snapshotRow}>
                <span className={styles.snapshotLabel}>Chi tiết bảng tên:</span>
                <span className={styles.snapshotValue}>
                  {[
                    snapshot.details.monogram?.enabled &&
                      `Tên "${snapshot.details.monogram.text || "—"}"`,
                    snapshot.details.ribbon && "Dải ruy băng",
                    snapshot.details.lights && "Dây đèn LED",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Không có chi tiết phụ"}
                </span>
              </div>
            )}
          </div>
        </section>
      )}
    </Modal>
  );
}
