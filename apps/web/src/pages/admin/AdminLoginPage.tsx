import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../lib/authContext";
import { Input } from "../../components/ui";
import { SEO } from "../../components/common/SEO";
import styles from "./AdminLoginPage.module.scss";

/**
 * /admin/login — the only door into the admin area (§2 of the spec: no
 * public UI links here, the admin types/bookmarks the URL themselves).
 */
export function AdminLoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (e.g. bookmarked /admin/login while a session is
  // still valid) — skip straight past the form.
  if (token) {
    return <Navigate to={location.state?.from ?? "/admin"} replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(location.state?.from ?? "/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <SEO title="Đăng nhập quản trị" noindex />
      <form onSubmit={handleSubmit} className={styles.card}>
        <div className={styles.iconWrap}>
          <LockClosedIcon className="h-5 w-5" />
        </div>
        <h1 className={styles.title}>Đăng nhập quản trị</h1>
        <p className={styles.subtitle}>Pi Decor — khu vực nội bộ</p>

        <div className={styles.fieldGroup}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            placeholder="admin@pidecor.vn"
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={submitting} className={styles.submit}>
          {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
