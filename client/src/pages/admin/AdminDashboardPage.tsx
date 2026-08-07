import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, MapPin, Palette, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../lib/authContext";
import { api } from "../../lib/api";
import type { AdminSummary, Venue } from "../../lib/types";
import styles from "./AdminDashboardPage.module.scss";

/**
 * /admin — Dashboard tổng quan (M5 in the spec's milestone table). Pulls
 * counts from GET /api/admin/summary, plus a venues count from the public
 * GET /api/venues (summary doesn't include venues/projects yet).
 */
export function AdminDashboardPage() {
  const { token, admin } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!token) return;
    Promise.all([api.getSummary(token), api.getVenues()])
      .then(([summaryRes, venuesRes]) => {
        setSummary(summaryRes);
        setVenues(venuesRes);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const totalProjects = venues.reduce((sum, v) => sum + v.project_count, 0);

  return (
    <div>
      <h1 className={styles.title}>Chào {admin?.email?.split("@")[0]}</h1>

      {status === "loading" && <p className={styles.status}>Đang tải…</p>}
      {status === "error" && <p className={styles.status}>Không tải được dữ liệu, thử tải lại trang.</p>}

      {status === "ready" && summary && (
        <>
          <div className={styles.grid}>
            <Link to="/admin/leads" className={styles.card}>
              <div className={styles.cardIcon}>
                <Users size={18} strokeWidth={1.75} />
              </div>
              <p className={styles.cardValue}>{summary.leads_total}</p>
              <p className={styles.cardLabel}>Tổng số khách để lại thông tin</p>
            </Link>

            <Link to="/admin/leads" className={styles.card}>
              <div className={`${styles.cardIcon} ${styles.cardIconAccent}`}>
                <Sparkles size={18} strokeWidth={1.75} />
              </div>
              <p className={styles.cardValue}>{summary.leads_new}</p>
              <p className={styles.cardLabel}>Lead mới, chưa liên hệ</p>
            </Link>

            <Link to="/admin/venues" className={styles.card}>
              <div className={styles.cardIcon}>
                <MapPin size={18} strokeWidth={1.75} />
              </div>
              <p className={styles.cardValue}>{venues.length}</p>
              <p className={styles.cardLabel}>Địa điểm trên Bản đồ</p>
            </Link>

            <Link to="/admin/venues" className={styles.card}>
              <div className={styles.cardIcon}>
                <Palette size={18} strokeWidth={1.75} />
              </div>
              <p className={styles.cardValue}>{totalProjects}</p>
              <p className={styles.cardLabel}>Dự án đã công khai</p>
            </Link>
          </div>

          <div className={styles.quickLinks}>
            <Link to="/admin/leads" className={styles.quickLink}>
              Xem danh sách khách hàng <ArrowRight size={14} />
            </Link>
            <Link to="/admin/venues" className={styles.quickLink}>
              Quản lý Bản đồ dự án <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
