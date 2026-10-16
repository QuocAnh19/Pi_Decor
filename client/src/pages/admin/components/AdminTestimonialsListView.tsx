import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import type { TestimonialItem } from "../../../lib/types";
import styles from "../AdminTestimonialsPage.module.scss";

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

interface AdminTestimonialsListViewProps {
  testimonials: TestimonialItem[];
  viewMode: "grid" | "table";
  updatingId: string | null;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Hiển thị danh sách đánh giá khách hàng dạng thẻ (grid) hoặc bảng (table).
 */
export function AdminTestimonialsListView({
  testimonials,
  viewMode,
  updatingId,
  onUpdateStatus,
  onDelete,
}: AdminTestimonialsListViewProps) {
  if (viewMode === "grid") {
    return (
      <div className={styles.grid}>
        {testimonials.map((t) => (
          <div key={t.id} className={styles.card}>
            <div>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.authorName}>{t.author}</div>
                  <div className={styles.authorRole}>
                    {t.role ?? "Khách hàng"}
                  </div>
                </div>
                <span
                  className={`${styles.badge} ${statusBadgeClass[t.status ?? "pending"]}`}
                >
                  {statusTextMap[t.status ?? "pending"] ?? t.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <StarSolid
                    key={i}
                    className="h-3.5 w-3.5"
                    style={{ width: 14, height: 14, color: "#b98a3e" }}
                  />
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
                    onClick={() => onUpdateStatus(t.id, "approved")}
                    disabled={updatingId === t.id}
                    title="Duyệt đánh giá"
                  >
                    <CheckCircleIcon
                      className="h-3.5 w-3.5"
                      style={{ width: 14, height: 14 }}
                    />
                    {updatingId === t.id ? "Đang lưu..." : "Duyệt"}
                  </button>
                )}
                {t.status !== "rejected" && (
                  <button
                    type="button"
                    className={styles.btnReject}
                    onClick={() => onUpdateStatus(t.id, "rejected")}
                    disabled={updatingId === t.id}
                    title="Từ chối"
                  >
                    <XCircleIcon
                      className="h-3.5 w-3.5"
                      style={{ width: 14, height: 14 }}
                    />
                    Từ chối
                  </button>
                )}
              </div>
              <button
                type="button"
                className={styles.btnDelete}
                onClick={() => onDelete(t.id)}
                disabled={updatingId === t.id}
                title="Xoá đánh giá"
              >
                <TrashIcon
                  className="h-3.5 w-3.5"
                  style={{ width: 14, height: 14 }}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
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
          {testimonials.map((t) => (
            <tr key={t.id}>
              <td>
                <strong>{t.author}</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#6e6259" }}>
                  {t.role ?? "—"}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                    <StarSolid
                      key={i}
                      className="h-3 w-3"
                      style={{ width: 13, height: 13, color: "#b98a3e" }}
                    />
                  ))}
                </div>
              </td>
              <td style={{ maxWidth: "340px", wordBreak: "break-word" }}>
                <em>"{t.quote}"</em>
              </td>
              <td>
                <span
                  className={`${styles.badge} ${statusBadgeClass[t.status ?? "pending"]}`}
                >
                  {statusTextMap[t.status ?? "pending"] ?? t.status}
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                <div
                  className={styles.actions}
                  style={{ justifyContent: "flex-end" }}
                >
                  {t.status !== "approved" && (
                    <button
                      type="button"
                      className={styles.btnApprove}
                      onClick={() => onUpdateStatus(t.id, "approved")}
                      disabled={updatingId === t.id}
                      title="Duyệt đánh giá"
                    >
                      <CheckCircleIcon
                        className="h-3.5 w-3.5"
                        style={{ width: 14, height: 14 }}
                      />
                      {updatingId === t.id ? "Đang..." : "Duyệt"}
                    </button>
                  )}
                  {t.status !== "rejected" && (
                    <button
                      type="button"
                      className={styles.btnReject}
                      onClick={() => onUpdateStatus(t.id, "rejected")}
                      disabled={updatingId === t.id}
                      title="Từ chối"
                    >
                      <XCircleIcon
                        className="h-3.5 w-3.5"
                        style={{ width: 14, height: 14 }}
                      />
                      Từ chối
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnDelete}
                    onClick={() => onDelete(t.id)}
                    disabled={updatingId === t.id}
                    title="Xoá"
                  >
                    <TrashIcon
                      className="h-3.5 w-3.5"
                      style={{ width: 14, height: 14 }}
                    />
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
