import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/authContext";

export function AdminGuard() {
  const { token, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#f4eee3",
          color: "#271620",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "28px" }}>🔐</div>
        <p style={{ fontSize: "14px", color: "#6e6259", margin: 0 }}>
          Đang xác thực phiên đăng nhập Admin...
        </p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
