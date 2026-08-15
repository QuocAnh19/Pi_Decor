import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  MapPinIcon,
  SwatchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { AdminSummary } from "../../lib/types";
import styles from "./AdminDashboardPage.module.scss";

/**
 * /admin — Dashboard tổng quan (M5 in the spec's milestone table).
 * Pulls counts directly from GET /api/admin/summary.
 */
export function AdminDashboardPage() {
  const { token, admin } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) return;
    api
      .getSummary(token)
      .then((summaryRes) => {
        setSummary(summaryRes);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div>
      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && (
        <p className={styles.status}>
          Không tải được dữ liệu, thử tải lại trang.
        </p>
      )}

      {status === "ready" && summary && (
        <>
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
              <p className={styles.cardValue}>
                {summary.projects_published_total}
              </p>
              <p className={styles.cardLabel}>Dự án đã công khai</p>
            </Link>
          </div>

          {/* <div className={styles.quickLinks}>
            <Link to="/admin/leads" className={styles.quickLink}>
              Xem danh sách khách hàng <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link to="/admin/venues" className={styles.quickLink}>
              Quản lý Bản đồ dự án <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div> */}
        </>
      )}
    </div>
  );
}
