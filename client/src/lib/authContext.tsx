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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredAuth;
        if (parsed.token && parsed.admin) {
          setToken(parsed.token);
          if (parsed.refreshToken) setRefreshToken(parsed.refreshToken);
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
    if (res.refreshToken) setRefreshToken(res.refreshToken);
    setAdmin(res.admin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
  }

  function updateToken(newToken: string) {
    setToken(newToken);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredAuth;
        parsed.token = newToken;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
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
    localStorage.removeItem(STORAGE_KEY);
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
