import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Squares2X2Icon,
  UsersIcon,
  FolderIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  SwatchIcon,
  SquaresPlusIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: Squares2X2Icon, end: true },
  { to: "/admin/leads", label: "Khách hàng", icon: UsersIcon, end: false },
  { to: "/admin/projects", label: "Dự án", icon: FolderIcon, end: false },
  { to: "/admin/venues", label: "Bản đồ", icon: MapPinIcon, end: false },
  { to: "/admin/materials", label: "Vật liệu", icon: SquaresPlusIcon, end: false },
  { to: "/admin/testimonials", label: "Đánh giá", icon: ChatBubbleLeftRightIcon, end: false },
  { to: "/admin/studio", label: "Studio Builder", icon: SwatchIcon, end: false },
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
              <Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        <a href="/" className={styles.viewSite}>
          <ArrowTopRightOnSquareIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
          Xem web công khai
        </a>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.headerEmail}>{admin?.email}</span>
          <button type="button" className={styles.logoutButton} onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
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
