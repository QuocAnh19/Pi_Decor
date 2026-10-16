import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { api } from "./api";
import { authStore } from "./authStore";
import type { Admin } from "./types";

interface AuthContextValue {
  token: string | null;
  refreshToken: string | null;
  admin: Admin | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateToken: (newToken: string, newAdmin?: Admin) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initAuth() {
      const currentToken = authStore.getToken();
      if (!currentToken) {
        setIsReady(true);
        return;
      }

      try {
        // Xác thực token lưu trữ với máy chủ; nếu token hết hạn, authRequest sẽ tự động refresh single-flight
        const meRes = await api.getMe();
        if (meRes.admin) {
          authStore.updateToken(authStore.getToken()!, meRes.admin);
        }
      } catch {
        // Nếu xác thực và refresh đều thất bại, xóa session để buộc đăng nhập lại
        authStore.clearSession();
      } finally {
        setIsReady(true);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.adminLogin({ email, password });
    authStore.setSession(res);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = authStore.getRefreshToken();
    if (refreshToken) {
      api.logout(refreshToken).catch(() => {});
    }
    authStore.clearSession();
  }, []);

  const updateToken = useCallback((newToken: string, newAdmin?: Admin) => {
    authStore.updateToken(newToken, newAdmin);
  }, []);

  const value = useMemo(
    () => ({
      token: session.token,
      refreshToken: session.refreshToken,
      admin: session.admin,
      isReady,
      login,
      logout,
      updateToken,
    }),
    [session.token, session.refreshToken, session.admin, isReady, login, logout, updateToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() phải được gọi bên trong <AuthProvider>.");
  return ctx;
}
