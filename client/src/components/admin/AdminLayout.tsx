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
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import { SEO } from "../common/SEO";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: Squares2X2Icon, end: true },
  { to: "/admin/leads", label: "Khách hàng", icon: UsersIcon, end: false },
  { to: "/admin/projects", label: "Dự án", icon: FolderIcon, end: false },
  { to: "/admin/venues", label: "Bản đồ", icon: MapPinIcon, end: false },
  {
    to: "/admin/materials",
    label: "Vật liệu",
    icon: SquaresPlusIcon,
    end: false,
  },
  {
    to: "/admin/testimonials",
    label: "Đánh giá",
    icon: ChatBubbleLeftRightIcon,
    end: false,
  },
  {
    to: "/admin/studio",
    label: "Studio Builder",
    icon: SwatchIcon,
    end: false,
  },
  {
    to: "/admin/settings",
    label: "Cài đặt",
    icon: Cog6ToothIcon,
    end: false,
  },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const pageTitle =
    navItems.find(({ to, end }) =>
      end ? location.pathname === to : location.pathname.startsWith(to)
    )?.label ?? navItems[0].label;

  return (
    <div className={styles.shell}>
      <SEO title={`Admin — ${pageTitle}`} noindex />
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
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
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
          <h1 className={styles.headerTitle}>{pageTitle}</h1>

          <div className={styles.headerRight}>
            <span className={styles.headerEmail}>{admin?.email}</span>
            <button type="button" className={styles.logoutButton} onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="h-4 w-4" style={{ width: 16, height: 16 }} />
              Đăng xuất
            </button>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
