import { useEffect, useState } from "react";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { Lead, LeadStatus } from "../../lib/types";
import { LeadTable } from "../../components/admin/LeadTable";
import { LeadDetailDrawer } from "../../components/admin/LeadDetailDrawer";
import styles from "./AdminLeadsPage.module.scss";

/**
 * /admin/leads — Tab "Khách hàng" (M2 in the spec). GET /api/leads, PATCH
 * /api/leads/:id for status changes, with the design_snapshot playback
 * living in LeadDetailDrawer.
 */
export function AdminLeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getLeads(token)
      .then((data) => {
        setLeads(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  async function handleStatusChange(id: string, newStatus: LeadStatus) {
    if (!token) return;
    const previous = leads;
    // Optimistic update — the panel is single-admin, so conflicts are rare
    // and a snappy status change matters more than round-tripping first.
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    try {
      await api.updateLeadStatus(id, newStatus, token);
    } catch (err) {
      setLeads(previous);
      setError(err instanceof Error ? err.message : "Không đổi được trạng thái, thử lại.");
    }
  }

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Khách hàng</h1>
          <p className={styles.subtitle}>Danh sách khách đã để lại thông tin qua form liên hệ hoặc Studio.</p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách, thử tải lại trang.</p>}

      {status === "ready" && (
        <LeadTable leads={leads} onSelect={(lead) => setSelectedId(lead.id)} onStatusChange={handleStatusChange} />
      )}

      <LeadDetailDrawer lead={selected} onClose={() => setSelectedId(null)} onStatusChange={handleStatusChange} />
    </div>
  );
}
