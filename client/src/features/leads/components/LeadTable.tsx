import { SparklesIcon } from "@heroicons/react/24/outline";
import type { Lead, LeadStatus } from "../../../lib/types";
import { formatDate } from "../../../lib/formatters";
import { Select } from "../../../components/ui";
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

interface LeadTableProps {
  leads: Lead[];
  updatingStatusId?: string | null;
  onSelect: (lead: Lead) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

export function LeadTable({ leads, updatingStatusId, onSelect, onStatusChange }: LeadTableProps) {
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
            <tr
              key={lead.id}
              className={styles.row}
              onClick={() => onSelect(lead)}
              style={{ cursor: "pointer" }}
            >
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
                    <SparklesIcon className="h-3.5 w-3.5 inline" style={{ width: 14, height: 14 }} /> Studio
                  </span>
                )}
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <Select
                  fullWidth={false}
                  value={lead.status}
                  disabled={updatingStatusId === lead.id}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className={`${styles.statusSelect} ${statusClass[lead.status]}`}
                  options={(Object.keys(statusLabel) as LeadStatus[]).map((s) => ({
                    value: s,
                    label: statusLabel[s],
                  }))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
