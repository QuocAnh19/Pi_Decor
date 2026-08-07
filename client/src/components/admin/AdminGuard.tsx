import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/authContext";

/**
 * AdminGuard — wraps every /admin/* route (except /admin/login itself).
 *
 * Per §2 of PiDecor_AdminPanel.md this is UX only, not security: the real
 * protection is verifyToken + requireAdmin on the API. This just avoids
 * showing an empty admin shell before bouncing an unauthenticated visitor
 * back to the login page.
 */
export function AdminGuard() {
  const { token, isReady } = useAuth();
  const location = useLocation();

  // Wait for the localStorage read in authContext before deciding — avoids
  // a redirect flash on refresh for an admin who *is* logged in.
  if (!isReady) return null;

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
