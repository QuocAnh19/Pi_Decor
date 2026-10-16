import { Link } from "react-router-dom";
import { UsersIcon, MapPinIcon, SwatchIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import { useAdminSummaryQuery } from "../../features/dashboard";
import styles from "./AdminDashboardPage.module.scss";

/**
 * /admin — Dashboard tổng quan.
 * Sử dụng TanStack Query lấy số liệu từ GET /api/admin/summary.
 */
export function AdminDashboardPage() {
  const { token } = useAuth();
  const query = useAdminSummaryQuery(Boolean(token));

  const summary = query.data ?? null;
  const status: "loading" | "ready" | "error" = query.isLoading
    ? "loading"
    : query.isError
      ? "error"
      : "ready";

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Bảng Điều Khiển Tổng Quan</h1>
          <p className={styles.subtitle}>
            Nắm bắt nhanh chỉ số hiệu suất, tiến độ dự án và hoạt động kinh doanh nổi bật
          </p>
        </div>
      </div>

      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && (
        <p className={styles.status}>Không tải được dữ liệu, thử tải lại trang.</p>
      )}

      {status === "ready" && summary && (
        <div className={styles.grid}>
          <Link to="/admin/leads" className={styles.card}>
            <div className={styles.cardIcon}>
              <UsersIcon className="h-5 w-5" />
            </div>
            <p className={styles.cardValue}>{summary.leads_total}</p>
            <p className={styles.cardLabel}>Tổng số khách để lại thông tin</p>
          </Link>

          <Link to="/admin/leads" className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.cardIconAccent}`}>
              <SparklesIcon className="h-5 w-5" />
            </div>
            <p className={styles.cardValue}>{summary.leads_new}</p>
            <p className={styles.cardLabel}>Lead mới, chưa liên hệ</p>
          </Link>

          <Link to="/admin/venues" className={styles.card}>
            <div className={styles.cardIcon}>
              <MapPinIcon className="h-5 w-5" />
            </div>
            <p className={styles.cardValue}>{summary.venues_total}</p>
            <p className={styles.cardLabel}>Địa điểm trên Bản đồ</p>
          </Link>

          <Link to="/admin/projects" className={styles.card}>
            <div className={styles.cardIcon}>
              <SwatchIcon className="h-5 w-5" />
            </div>
            <p className={styles.cardValue}>{summary.projects_published_total}</p>
            <p className={styles.cardLabel}>Dự án đã công khai</p>
          </Link>
        </div>
      )}
    </div>
  );
}
