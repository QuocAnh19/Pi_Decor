import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Admin } from "./types";

const STORAGE_KEY = "pidecor_admin_auth";

interface StoredAuth {
  token: string;
  refreshToken?: string;
  admin: Admin;
}

interface AuthContextValue {
  token: string | null;
  refreshToken: string | null;
  admin: Admin | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initAuth() {
      // Clear any legacy persistent credentials in localStorage
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsReady(true);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as StoredAuth;
        if (parsed.token && parsed.admin) {
          try {
            // Verify stored access token with backend
            const meRes = await api.getMe(parsed.token);
            setToken(parsed.token);
            if (parsed.refreshToken) setRefreshToken(parsed.refreshToken);
            setAdmin(meRes.admin || parsed.admin);
          } catch {
            // Token expired or invalid — try to refresh token if available
            if (parsed.refreshToken) {
              try {
                const refreshed = await api.refreshToken(parsed.refreshToken);
                parsed.token = refreshed.token;
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                setToken(refreshed.token);
                setRefreshToken(parsed.refreshToken);
                setAdmin(parsed.admin);
              } catch {
                sessionStorage.removeItem(STORAGE_KEY);
                setToken(null);
                setRefreshToken(null);
                setAdmin(null);
              }
            } else {
              sessionStorage.removeItem(STORAGE_KEY);
              setToken(null);
              setRefreshToken(null);
              setAdmin(null);
            }
          }
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsReady(true);
      }
    }

    initAuth();
  }, []);

  async function login(email: string, password: string) {
    const res = await api.adminLogin({ email, password });
    setToken(res.token);
    if (res.refreshToken) setRefreshToken(res.refreshToken);
    setAdmin(res.admin);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res));
  }

  function updateToken(newToken: string) {
    setToken(newToken);
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredAuth;
        parsed.token = newToken;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }
  }

  function logout() {
    if (refreshToken) {
      api.logout(refreshToken).catch(() => {});
    }
    setToken(null);
    setRefreshToken(null);
    setAdmin(null);
    sessionStorage.removeItem(STORAGE_KEY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  const value = useMemo(
    () => ({ token, refreshToken, admin, isReady, login, logout, updateToken }),
    [token, refreshToken, admin, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() phải được gọi bên trong <AuthProvider>.");
  return ctx;
}
