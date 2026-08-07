import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { StudioPage } from "./pages/StudioPage";
import { MapPage } from "./pages/MapPage";
import { AdminGuard } from "./components/admin/AdminGuard";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminLeadsPage } from "./pages/admin/AdminLeadsPage";
import { AdminVenuesPage } from "./pages/admin/AdminVenuesPage";
import { AdminStudioPage } from "./pages/admin/AdminStudioPage";
import styles from "./App.module.scss";

/** Chrome for every public page. Never mounted under /admin — per
 * PiDecor_AdminPanel.md §2/§5 the admin area has its own layout and no
 * public UI links point into it. */
function PublicLayout() {
  const location = useLocation();
  const isStudio = location.pathname === "/studio";

  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      {!isStudio && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/ban-do" element={<MapPage />} />
      </Route>

      {/* Admin — public login, then everything else behind AdminGuard. */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="venues" element={<AdminVenuesPage />} />
        </Route>
        {/* Full-screen editor route for Admin Studio Builder (outside AdminLayout sidebar) */}
        <Route path="studio" element={<AdminStudioPage />} />
      </Route>
    </Routes>
  );
}
