import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Admin } from "./types";

/**
 * authContext — the one place that knows the admin is logged in.
 *
 * Deliberately tiny: there's exactly one account type in this app (see
 * PiDecor_AdminPanel.md §2), so this holds a single { token, admin } pair,
 * not a generic multi-role user object. Token lives in localStorage so a
 * page refresh on /admin doesn't bounce the admin back to /admin/login —
 * see §7 of the spec for the tradeoff that comes with that (XSS exposure vs
 * a real httpOnly cookie), accepted for now at "1 admin" scale.
 */

const STORAGE_KEY = "pidecor_admin_auth";

interface StoredAuth {
  token: string;
  admin: Admin;
}

interface AuthContextValue {
  token: string | null;
  admin: Admin | null;
  /** False until the initial localStorage read has happened — used by
   * AdminGuard to avoid a flash-redirect to /login before we've had a
   * chance to check for an existing session. */
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredAuth;
        if (parsed.token && parsed.admin) {
          setToken(parsed.token);
          setAdmin(parsed.admin);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  async function login(email: string, password: string) {
    const res = await api.adminLogin({ email, password });
    setToken(res.token);
    setAdmin(res.admin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
  }

  function logout() {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({ token, admin, isReady, login, logout }),
    [token, admin, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() phải được gọi bên trong <AuthProvider>.");
  return ctx;
}
