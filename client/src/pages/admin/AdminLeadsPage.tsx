import { useEffect, useState } from "react";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { Lead, LeadStatus } from "../../lib/types";
import { LeadTable } from "../../components/admin/LeadTable";
import { LeadDetailDrawer } from "../../components/admin/LeadDetailDrawer";
import styles from "./AdminLeadsPage.module.scss";

/**
 * /admin/leads — Tab "Khách hàng" with pagination & search.
 */
export function AdminLeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input (~300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search term
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch leads when page, debouncedSearch, or statusFilter changes
  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    api
      .getLeads(token, {
        page,
        limit: 20,
        q: debouncedSearch,
        status: statusFilter,
      })
      .then((res) => {
        setLeads(res.data);
        setTotal(res.total);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token, page, debouncedSearch, statusFilter]);

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    if (!token) return;
    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    try {
      await api.updateLeadStatus(id, newStatus, token);
    } catch (err) {
      setLeads(previous);
      setError(err instanceof Error ? err.message : "Không đổi được trạng thái, thử lại.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Khách hàng</h1>
        </div>
      </div>

      <div className={styles.filterControls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm theo tên, SĐT, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.statusSelect}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="new">Mới</option>
          <option value="contacted">Đã liên hệ</option>
          <option value="closed">Đã chốt</option>
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách, thử tải lại trang.</p>}

      {status === "ready" && (
        <>
          <LeadTable leads={leads} onSelect={(lead) => setSelectedId(lead.id)} onStatusChange={handleStatusChange} />

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

      <LeadDetailDrawer lead={selected} onClose={() => setSelectedId(null)} onStatusChange={handleStatusChange} />
    </div>
  );
}
