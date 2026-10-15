import { useState } from "react";
import {
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useLeads, LeadTable, LeadDetailDrawer, QuotationModal } from "../../features/leads";
import { SearchInput, Select } from "../../components/ui";
import { AdminPageHeader, ViewToggle, StatusTabs } from "../../components/admin";
import { formatDate } from "../../lib/formatters";
import type { Lead, LeadStatus } from "../../lib/types";
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
  const [quotingLead, setQuotingLead] = useState<Lead | null>(null);

  const statusTabs = [
    { id: "all", label: `Tất cả (${total})` },
    { id: "new", label: "Mới" },
    { id: "contacted", label: "Đã liên hệ" },
    { id: "closed", label: "Đã chốt" },
  ];

  const handleOpenQuotation = (lead: Lead) => {
    setSelectedLead(null);
    setQuotingLead(lead);
  };

  const handleBackToDetail = () => {
    if (quotingLead) {
      const current = quotingLead;
      setQuotingLead(null);
      setSelectedLead(current);
    }
  };

  return (
    <div>
      {/* Header Row */}
      <AdminPageHeader
        title="Quản Lý Khách Hàng &amp; Báo Giá"
        subtitle="Theo dõi thông tin liên hệ, nhu cầu tư vấn và lập báo giá chi tiết xuất file PDF cho khách hàng"
      />

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

          <ViewToggle
            viewMode={viewMode}
            onChange={setViewMode}
            gridTitle="Xem dạng thẻ"
            tableTitle="Xem dạng bảng"
          />
        </div>

        {/* Tabs Row */}
        <StatusTabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={(tabId) => {
            setStatusFilter(tabId);
            setPage(1);
          }}
        />
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
              onOpenQuotation={handleOpenQuotation}
            />
          ) : (
            <div className={styles.grid}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={styles.leadCard}
                >
                  <div>
                    <div className={styles.leadCardHeader}>
                      <div className={styles.leadName}>{lead.name}</div>
                      <div className={styles.leadDate}>{formatDate(lead.created_at)}</div>
                    </div>

                    <div className={styles.leadContactInfo}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <PhoneIcon className="h-3.5 w-3.5" style={{ width: 15, height: 15, color: "#a15c2e" }} />
                        <span style={{ fontWeight: 600, color: "#271620" }}>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <EnvelopeIcon className="h-3.5 w-3.5" style={{ width: 15, height: 15, color: "#6e6259" }} />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.wedding_date && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a15c2e", fontWeight: "600" }}>
                          <CalendarDaysIcon className="h-3.5 w-3.5" style={{ width: 15, height: 15 }} />
                          <span>Ngày tiệc: {formatDate(lead.wedding_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.leadCardFooter}>
                    <div>
                      {lead.design_snapshot ? (
                        <span className={styles.snapshotBadge}>
                          <SparklesIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} /> Studio 3D
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#9c9186" }}>Tư vấn dịch vụ</span>
                      )}
                    </div>

                    <div className={styles.leadCardActions}>
                      <button
                        type="button"
                        className={styles.cardQuoteBtn}
                        onClick={() => handleOpenQuotation(lead)}
                        title="Lập báo giá"
                      >
                        <DocumentTextIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                        <span>Báo giá</span>
                      </button>

                      <button
                        type="button"
                        className={styles.cardDetailBtn}
                        onClick={() => setSelectedLead(lead)}
                        title="Xem chi tiết thông tin khách hàng"
                      >
                        <EyeIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                        <span>Chi tiết</span>
                      </button>

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

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        updatingStatusId={updatingStatusId}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onOpenQuotation={handleOpenQuotation}
      />

      {/* Quotation Modal — Rendered only when quoting, eliminating overlapping conflicts */}
      {quotingLead && (
        <QuotationModal
          lead={quotingLead}
          onClose={() => setQuotingLead(null)}
          onSaved={() => {}}
          onBackToDetail={handleBackToDetail}
        />
      )}
    </div>
  );
}
