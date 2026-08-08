import { useCallback, useEffect, useState } from "react";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { TestimonialItem } from "../../lib/types";
import styles from "./AdminTestimonialsPage.module.scss";

const statusBadgeClass: Record<string, string> = {
  pending: styles.badgePending,
  approved: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

const statusTextMap: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export function AdminTestimonialsPage() {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTestimonials = useCallback(() => {
    if (!token) return;
    const filter = statusFilter === "all" ? undefined : statusFilter;
    return api
      .getTestimonialsAdmin(token, filter)
      .then((data) => {
        setTestimonials(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token, statusFilter]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    if (!token || updatingId) return;
    setUpdatingId(id);
    setError(null);
    setSuccessMsg(null);

    // Optimistic UI update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus as any } : t))
    );

    try {
      await api.updateTestimonialStatus(id, newStatus, token);
      setSuccessMsg(newStatus === "approved" ? "✓ Đã duyệt đánh giá thành công!" : "✓ Đã chuyển trạng thái từ chối.");
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadTestimonials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại.");
      await loadTestimonials(); // Revert on failure
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!token || updatingId) return;
    if (!confirm("Xoá đánh giá này khỏi hệ thống?")) return;
    setUpdatingId(id);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.deleteTestimonial(id, token);
      setSuccessMsg("✓ Đã xóa đánh giá.");
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadTestimonials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xoá đánh giá thất bại.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>Quản lý Đánh giá (Testimonials)</h1>

      {successMsg && (
        <div style={{ padding: "10px 16px", backgroundColor: "#065f46", color: "#34d399", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      <div className={styles.filterBar}>
        <label htmlFor="st-filter">Lọc theo trạng thái:</label>
        <select
          id="st-filter"
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {status === "loading" && <p className={styles.status}>Đang tải danh sách đánh giá…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách đánh giá.</p>}

      {status === "ready" && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tác giả / Dịch vụ</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>
                    Không có đánh giá nào.
                  </td>
                </tr>
              ) : (
                testimonials.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.author}</strong>
                      <br />
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t.role ?? "—"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: "320px", wordBreak: "break-word" }}>
                      <em>"{t.quote}"</em>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusBadgeClass[t.status ?? "pending"]}`}>
                        {statusTextMap[t.status ?? "pending"] ?? t.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {t.status !== "approved" && (
                          <button
                            type="button"
                            className={styles.btnApprove}
                            onClick={() => handleUpdateStatus(t.id, "approved")}
                            disabled={updatingId === t.id}
                            title="Duyệt đánh giá"
                          >
                            <CheckCircle size={14} style={{ display: "inline", marginRight: "4px" }} />
                            {updatingId === t.id ? "Đang xử lý..." : "Duyệt"}
                          </button>
                        )}
                        {t.status !== "rejected" && (
                          <button
                            type="button"
                            className={styles.btnReject}
                            onClick={() => handleUpdateStatus(t.id, "rejected")}
                            disabled={updatingId === t.id}
                            title="Từ chối"
                          >
                            <XCircle size={14} style={{ display: "inline", marginRight: "4px" }} />
                            Từ chối
                          </button>
                        )}
                        <button
                          type="button"
                          className={styles.btnDelete}
                          onClick={() => handleDelete(t.id)}
                          disabled={updatingId === t.id}
                          title="Xoá"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
