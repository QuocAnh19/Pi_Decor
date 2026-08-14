import { useLeads, LeadTable, LeadDetailDrawer } from "../../features/leads";
import { SearchInput, Select } from "../../components/ui";
import styles from "./AdminLeadsPage.module.scss";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "closed", label: "Đã chốt" },
];

/**
 * /admin/leads — Tab "Khách hàng" with pagination, status filter & search.
 */
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

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Khách hàng</h1>
        </div>
      </div>

      <div className={styles.filterControls}>
        <div style={{ flex: 1, maxWidth: "320px" }}>
          <SearchInput
            placeholder="Tìm theo tên, SĐT, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: "160px" }}>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={STATUS_FILTER_OPTIONS}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách, thử tải lại trang.</p>}

      {status === "ready" && (
        <>
          <LeadTable
            leads={leads}
            updatingStatusId={updatingStatusId}
            onSelect={(lead) => setSelectedLead(lead)}
            onStatusChange={handleStatusChange}
          />

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
