import { Sparkles } from "lucide-react";
import type { Lead, LeadStatus } from "../../lib/types";
import styles from "./LeadTable.module.scss";

const statusLabel: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  closed: "Đã chốt",
};

const statusClass: Record<LeadStatus, string> = {
  new: styles.statusNew,
  contacted: styles.statusContacted,
  closed: styles.statusClosed,
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface LeadTableProps {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

export function LeadTable({ leads, onSelect, onStatusChange }: LeadTableProps) {
  if (leads.length === 0) {
    return <p className={styles.empty}>Chưa có khách nào để lại thông tin.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ngày gửi</th>
            <th>Khách hàng</th>
            <th>Liên hệ</th>
            <th>Ngày dự kiến</th>
            <th></th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className={styles.row}>
              <td className={styles.dim}>{formatDate(lead.created_at)}</td>
              <td>
                <button type="button" className={styles.nameButton} onClick={() => onSelect(lead)}>
                  {lead.name}
                </button>
              </td>
              <td className={styles.dim}>
                <div>{lead.phone}</div>
                {lead.email && <div className={styles.email}>{lead.email}</div>}
              </td>
              <td className={styles.dim}>{lead.wedding_date ? formatDate(lead.wedding_date) : "—"}</td>
              <td>
                {lead.design_snapshot && (
                  <span className={styles.snapshotTag} title="Có kèm thiết kế từ Studio">
                    <Sparkles size={12} strokeWidth={1.75} /> Studio
                  </span>
                )}
              </td>
              <td>
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className={`${styles.statusSelect} ${statusClass[lead.status]}`}
                >
                  {(Object.keys(statusLabel) as LeadStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
