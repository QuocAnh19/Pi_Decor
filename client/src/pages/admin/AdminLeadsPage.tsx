import { useState } from "react";
import {
  SparklesIcon,
  ListBulletIcon,
  Squares2X2Icon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useLeads, LeadTable, LeadDetailDrawer } from "../../features/leads";
import { SearchInput, Select } from "../../components/ui";
import { formatDate } from "../../lib/formatters";
import type { LeadStatus } from "../../lib/types";
import styles from "./AdminLeadsPage.module.scss";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "new", label: "Mới (Chưa xử lý)" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "closed", label: "Đã chốt hợp đồng" },
];

const statusLabel: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  closed: "Đã chốt",
};

export function AdminLeadsPage() {
  const {
    leads,
    total,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    updatingStatusId,
    status,
    selectedLead,
    setSelectedLead,
    error,
    totalPages,
    handleStatusChange,
  } = useLeads();

  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const statusTabs = [
    { id: "all", label: `Tất cả (${total})` },
    { id: "new", label: "Mới" },
    { id: "contacted", label: "Đã liên hệ" },
    { id: "closed", label: "Đã chốt" },
  ];

  return (
    <div>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quản Lý Khách Hàng &amp; Báo Giá</h1>
          <p className={styles.subtitle}>
            Theo dõi thông tin liên hệ, tiến độ tư vấn và xuất báo giá PDF cho khách hàng
          </p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm theo tên, SĐT, email khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "180px" }}>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "4px",
              backgroundColor: "#ffffff",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #e7ded0",
            }}
          >
            {/* Nút bên trái: Xem dạng bảng */}
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: viewMode === "grid" ? "#a15c2e" : "transparent",
                color: viewMode === "grid" ? "#ffffff" : "#6e6259",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s ease",
              }}
              title="Xem dạng bảng"
            >
              <ListBulletIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>

            {/* Nút bên phải: Xem dạng list / thẻ */}
            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 10px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: viewMode === "table" ? "#a15c2e" : "transparent",
                color: viewMode === "table" ? "#ffffff" : "#6e6259",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                transition: "all 0.15s ease",
              }}
              title="Xem dạng danh sách (thẻ)"
            >
              <Squares2X2Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Tabs Row */}
        <div className={styles.tabsRow}>
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`${styles.tabButton} ${
                statusFilter === tab.id ? styles.tabActive : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && <p className={styles.status}>Đang nạp danh sách khách hàng…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách, thử tải lại trang.</p>}

      {status === "ready" && (
        <>
          {viewMode === "table" ? (
            <LeadTable
              leads={leads}
              updatingStatusId={updatingStatusId}
              onSelect={(lead) => setSelectedLead(lead)}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className={styles.grid}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={styles.leadCard}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div>
                    <div className={styles.leadCardHeader}>
                      <div className={styles.leadName}>{lead.name}</div>
                      <div className={styles.leadDate}>{formatDate(lead.created_at)}</div>
                    </div>

                    <div className={styles.leadContactInfo}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <PhoneIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14, color: "#a15c2e" }} />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <EnvelopeIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14, color: "#6e6259" }} />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.wedding_date && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a15c2e", fontWeight: "600" }}>
                          <CalendarDaysIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                          <span>Ngày cưới: {formatDate(lead.wedding_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.leadCardFooter}>
                    {lead.design_snapshot ? (
                      <span className={styles.snapshotBadge}>
                        <SparklesIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Có thiết kế
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#9c9186" }}>Tư vấn dịch vụ</span>
                    )}

                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        fullWidth={false}
                        value={lead.status}
                        disabled={updatingStatusId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        options={(Object.keys(statusLabel) as LeadStatus[]).map((s) => ({
                          value: s,
                          label: statusLabel[s],
                        }))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.pagination}>
            <span>
              Trang {page} / {totalPages} (Tổng {total} khách hàng)
            </span>
            <div className={styles.pageButtons}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </button>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Trang sau
              </button>
            </div>
          </div>
        </>
      )}

      <LeadDetailDrawer
        lead={selectedLead}
        updatingStatusId={updatingStatusId}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
