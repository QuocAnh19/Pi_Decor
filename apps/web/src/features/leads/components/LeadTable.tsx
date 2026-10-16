import { SparklesIcon, DocumentTextIcon, EyeIcon } from "@heroicons/react/24/outline";
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
  onOpenQuotation?: (lead: Lead) => void;
}

export function LeadTable({
  leads,
  updatingStatusId,
  onSelect,
  onStatusChange,
  onOpenQuotation,
}: LeadTableProps) {
  if (leads.length === 0) {
    return <p className={styles.empty}>Chưa có khách hàng nào để lại thông tin phù hợp.</p>;
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
            <th>Ghi chú</th>
            <th>Trạng thái</th>
            <th style={{ textAlign: "right" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className={styles.row}>
              <td className={styles.dim}>{formatDate(lead.created_at)}</td>
              <td>
                <span className={styles.nameText}>{lead.name}</span>
              </td>
              <td>
                <div className={styles.phone}>{lead.phone}</div>
                {lead.email && <div className={styles.email}>{lead.email}</div>}
              </td>
              <td className={styles.dim}>
                {lead.wedding_date ? formatDate(lead.wedding_date) : "—"}
              </td>
              <td>
                {lead.design_snapshot ? (
                  <span className={styles.snapshotTag} title="Có kèm phối cảnh từ Studio">
                    <SparklesIcon
                      className="h-3.5 w-3.5 inline"
                      style={{ width: 14, height: 14 }}
                    />{" "}
                    Studio 3D
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", color: "#9c9186" }}>Tư vấn dịch vụ</span>
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
              <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "right" }}>
                <div className={styles.actionsCell}>
                  {onOpenQuotation && (
                    <button
                      type="button"
                      className={styles.quoteBtn}
                      onClick={() => onOpenQuotation(lead)}
                      title="Lập báo giá cho khách hàng này"
                    >
                      <DocumentTextIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      <span>Báo giá</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.detailBtn}
                    onClick={() => onSelect(lead)}
                    title="Xem chi tiết thông tin khách hàng"
                  >
                    <EyeIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                    <span>Chi tiết</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
