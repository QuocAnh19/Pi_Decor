import type { Admin } from "./types";

export interface AuthSession {
  token: string | null;
  refreshToken: string | null;
  admin: Admin | null;
}

const STORAGE_KEY = "pidecor_admin_auth";

/**
 * Đọc phiên đăng nhập được lưu trữ trong sessionStorage khi khởi động ứng dụng.
 */
function readSessionFromStorage(): AuthSession {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, refreshToken: null, admin: null };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.token === "string" && parsed.admin) {
      return {
        token: parsed.token,
        refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : null,
        admin: parsed.admin,
      };
    }
  } catch {
    // Bỏ qua nếu dữ liệu sessionStorage bị hỏng hoặc trình duyệt chặn lưu trữ
  }
  return { token: null, refreshToken: null, admin: null };
}

let currentSession: AuthSession = readSessionFromStorage();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export const authStore = {
  /** Lấy snapshot phiên đăng nhập hiện tại cho useSyncExternalStore */
  getSnapshot(): AuthSession {
    return currentSession;
  },

  /** Đăng ký lắng nghe các thay đổi về phiên đăng nhập */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** Lưu phiên đăng nhập mới sau khi xác thực thành công */
  setSession(session: { token: string; refreshToken?: string | null; admin: Admin }): void {
    currentSession = {
      token: session.token,
      refreshToken: session.refreshToken ?? null,
      admin: session.admin,
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession));
    } catch {
      // Trình duyệt có thể chặn lưu trữ ở chế độ ẩn danh nghiêm ngặt
    }
    notify();
  },

  /** Cập nhật token mới khi refresh single-flight thành công */
  updateToken(newToken: string, newAdmin?: Admin): void {
    currentSession = {
      ...currentSession,
      token: newToken,
      ...(newAdmin ? { admin: newAdmin } : {}),
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession));
    } catch {
      // Bỏ qua lỗi lưu trữ
    }
    notify();
  },

  /** Xóa phiên đăng nhập khi logout hoặc khi refresh token thất bại */
  clearSession(): void {
    currentSession = { token: null, refreshToken: null, admin: null };
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi xóa
    }
    notify();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  },

  /** Lấy access token hiện tại */
  getToken(): string | null {
    return currentSession.token;
  },

  /** Lấy refresh token hiện tại */
  getRefreshToken(): string | null {
    return currentSession.refreshToken;
  },

  /** Lấy thông tin tài khoản admin hiện tại */
  getAdmin(): Admin | null {
    return currentSession.admin;
  },
};
