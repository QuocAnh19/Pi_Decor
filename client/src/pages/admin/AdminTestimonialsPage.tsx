import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import { SearchInput, Select } from "../../components/ui";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTestimonials = useCallback(() => {
    if (!token) return;
    return api
      .getTestimonialsAdmin(token)
      .then((data) => {
        setTestimonials(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const counts = useMemo(() => {
    return {
      all: testimonials.length,
      pending: testimonials.filter((t) => (t.status ?? "pending") === "pending").length,
      approved: testimonials.filter((t) => t.status === "approved").length,
      rejected: testimonials.filter((t) => t.status === "rejected").length,
    };
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      // 1. Status Filter
      if (statusFilter !== "all" && (t.status ?? "pending") !== statusFilter) {
        return false;
      }
      // 2. Rating Filter
      if (ratingFilter !== "all" && String(t.rating ?? 5) !== ratingFilter) {
        return false;
      }
      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAuthor = t.author?.toLowerCase().includes(q);
        const matchQuote = t.quote?.toLowerCase().includes(q);
        const matchRole = t.role?.toLowerCase().includes(q);
        if (!matchAuthor && !matchQuote && !matchRole) return false;
      }
      return true;
    });
  }, [testimonials, statusFilter, ratingFilter, searchQuery]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    if (!token || updatingId) return;
    setUpdatingId(id);
    setError(null);
    setSuccessMsg(null);

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
      await loadTestimonials();
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

  const statusTabs = [
    { id: "all", label: `Tất cả (${counts.all})` },
    { id: "pending", label: `Chờ duyệt (${counts.pending})` },
    { id: "approved", label: `Đã duyệt (${counts.approved})` },
    { id: "rejected", label: `Từ chối (${counts.rejected})` },
  ];

  return (
    <div>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quản Lý Đánh Giá Khách Hàng</h1>
          <p className={styles.subtitle}>
            Kiểm duyệt, phê duyệt và quản lý các phản hồi, đánh giá từ cô dâu &amp; chú rể
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: "10px 16px", backgroundColor: "#eef4ea", color: "#47663b", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(71, 102, 59, 0.3)" }}>
          {successMsg}
        </div>
      )}

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchRow}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <SearchInput
              placeholder="Tìm theo tên tác giả, nội dung đánh giá..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <Select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              options={[
                { value: "all", label: "Tất cả số sao ⭐" },
                { value: "5", label: "5 Sao ⭐⭐⭐⭐⭐" },
                { value: "4", label: "4 Sao ⭐⭐⭐⭐" },
                { value: "3", label: "3 Sao ⭐⭐⭐" },
                { value: "2", label: "2 Sao ⭐⭐" },
                { value: "1", label: "1 Sao ⭐" },
              ]}
            />
          </div>

          <div style={{ minWidth: "160px" }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "pending", label: "Chờ duyệt" },
                { value: "approved", label: "Đã duyệt" },
                { value: "rejected", label: "Từ chối" },
              ]}
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
              title="Xem dạng thẻ"
            >
              <Squares2X2Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
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
              title="Xem dạng bảng"
            >
              <ListBulletIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Tabs Row */}
        <div className={styles.tabsRow}>
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`${styles.tabButton} ${
                statusFilter === tab.id ? styles.tabActive : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && <p className={styles.status}>Đang tải danh sách đánh giá…</p>}
      {status === "error" && <p className={styles.status}>Không tải được danh sách đánh giá.</p>}

      {status === "ready" && (
        filteredTestimonials.length === 0 ? (
          <div className={styles.empty}>
            <ChatBubbleBottomCenterTextIcon className="h-10 w-10" style={{ width: 40, height: 40, color: "#9c9186" }} />
            <div style={{ fontWeight: "700", color: "#271620" }}>Không tìm thấy đánh giá phù hợp</div>
            <div style={{ fontSize: "12px", color: "#9c9186" }}>Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className={styles.grid}>
            {filteredTestimonials.map((t) => (
              <div key={t.id} className={styles.card}>
                <div>
                  <div className={styles.cardHeader}>
                    <div>
                      <div className={styles.authorName}>{t.author}</div>
                      <div className={styles.authorRole}>{t.role ?? "Khách hàng"}</div>
                    </div>
                    <span className={`${styles.badge} ${statusBadgeClass[t.status ?? "pending"]}`}>
                      {statusTextMap[t.status ?? "pending"] ?? t.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <StarSolid key={i} className="h-3.5 w-3.5" style={{ width: 14, height: 14, color: "#b98a3e" }} />
                    ))}
                  </div>

                  <p className={styles.quoteText}>"{t.quote}"</p>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.actions}>
                    {t.status !== "approved" && (
                      <button
                        type="button"
                        className={styles.btnApprove}
                        onClick={() => handleUpdateStatus(t.id, "approved")}
                        disabled={updatingId === t.id}
                        title="Duyệt đánh giá"
                      >
                        <CheckCircleIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                        {updatingId === t.id ? "Đang lưu..." : "Duyệt"}
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
                        <XCircleIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                        Từ chối
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.btnDelete}
                    onClick={() => handleDelete(t.id)}
                    disabled={updatingId === t.id}
                    title="Xoá đánh giá"
                  >
                    <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tác giả / Dịch vụ</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonials.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.author}</strong>
                      <br />
                      <span style={{ fontSize: "12px", color: "#6e6259" }}>{t.role ?? "—"}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                          <StarSolid key={i} className="h-3 w-3" style={{ width: 13, height: 13, color: "#b98a3e" }} />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: "340px", wordBreak: "break-word" }}>
                      <em>"{t.quote}"</em>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${statusBadgeClass[t.status ?? "pending"]}`}>
                        {statusTextMap[t.status ?? "pending"] ?? t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                        {t.status !== "approved" && (
                          <button
                            type="button"
                            className={styles.btnApprove}
                            onClick={() => handleUpdateStatus(t.id, "approved")}
                            disabled={updatingId === t.id}
                            title="Duyệt đánh giá"
                          >
                            <CheckCircleIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                            {updatingId === t.id ? "Đang..." : "Duyệt"}
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
                            <XCircleIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
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
                          <TrashIcon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
