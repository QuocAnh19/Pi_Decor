import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { AdminGuard } from "./components/admin/AdminGuard";
import { AdminLayout } from "./components/admin/AdminLayout";
import styles from "./App.module.scss";

// Lazy routes
const StudioPage = lazy(() =>
  import("./pages/StudioPage").then((m) => ({ default: m.StudioPage }))
);
const MapPage = lazy(() => import("./pages/MapPage").then((m) => ({ default: m.MapPage })));
const PrivacyPolicyPage = lazy(() =>
  import("./pages/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage }))
);
const AdminLoginPage = lazy(() =>
  import("./pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import("./pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminLeadsPage = lazy(() =>
  import("./pages/admin/AdminLeadsPage").then((m) => ({ default: m.AdminLeadsPage }))
);
const AdminProjectsPage = lazy(() =>
  import("./pages/admin/AdminProjectsPage").then((m) => ({ default: m.AdminProjectsPage }))
);
const AdminVenuesPage = lazy(() =>
  import("./pages/admin/AdminVenuesPage").then((m) => ({ default: m.AdminVenuesPage }))
);
const AdminMaterialsPage = lazy(() =>
  import("./pages/admin/AdminMaterialsPage").then((m) => ({ default: m.AdminMaterialsPage }))
);
const AdminTestimonialsPage = lazy(() =>
  import("./pages/admin/AdminTestimonialsPage").then((m) => ({ default: m.AdminTestimonialsPage }))
);
const AdminStudioPage = lazy(() =>
  import("./pages/admin/AdminStudioPage").then((m) => ({ default: m.AdminStudioPage }))
);
const AdminSettingsPage = lazy(() =>
  import("./pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage }))
);

function RouteLoadingFallback() {
  return (
    <div className={styles.loadingFallback} role="status" aria-label="Đang tải trang">
      <div className={styles.spinner} />
    </div>
  );
}

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
        <Suspense fallback={<RouteLoadingFallback />}>
          <Outlet />
        </Suspense>
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
        <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicyPage />} />
      </Route>

      {/* Admin — public login, then everything else behind AdminGuard. */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<RouteLoadingFallback />}>
            <AdminLoginPage />
          </Suspense>
        }
      />
      <Route path="/admin" element={<AdminGuard />}>
        <Route
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="venues" element={<AdminVenuesPage />} />
          <Route path="materials" element={<AdminMaterialsPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="studio" element={<AdminStudioPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
