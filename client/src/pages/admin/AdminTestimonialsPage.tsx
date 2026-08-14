import { useCallback, useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import { Select } from "../../components/ui";
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
        <div style={{ minWidth: "200px" }}>
          <Select
            label="Lọc theo trạng thái:"
            id="st-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "pending", label: "Chờ duyệt" },
              { value: "approved", label: "Đã duyệt" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />
        </div>
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
                          <StarSolid key={i} className="h-3 w-3" style={{ width: 13, height: 13, color: "#f59e0b" }} />
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
                            <CheckCircleIcon className="h-3.5 w-3.5 inline mr-1" style={{ display: "inline", marginRight: "4px", width: 14, height: 14 }} />
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
                            <XCircleIcon className="h-3.5 w-3.5 inline mr-1" style={{ display: "inline", marginRight: "4px", width: 14, height: 14 }} />
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
                          <TrashIcon className="h-3.5 w-3.5" />
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
