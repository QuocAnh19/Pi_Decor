import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, LogOut, ExternalLink, Palette } from "lucide-react";
import { useAuth } from "../../lib/authContext";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Khách hàng", icon: Users, end: false },
  { to: "/admin/venues", label: "Bản đồ", icon: MapPin, end: false },
  { to: "/admin/studio", label: "Studio Builder", icon: Palette, end: false },
];

/**
 * AdminLayout — sidebar + header, deliberately not reusing the public
 * Navbar/Footer (§5 of the spec: "khác hẳn Navbar/Footer khách"). Rendered
 * only for authenticated admin routes; App.tsx never mounts this alongside
 * the public site's chrome.
 */
export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          Pi Decor <span className={styles.brandTag}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <a href="/" className={styles.viewSite}>
          <ExternalLink size={15} strokeWidth={1.75} />
          Xem web công khai
        </a>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.headerEmail}>{admin?.email}</span>
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={15} strokeWidth={1.75} />
            Đăng xuất
          </button>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
