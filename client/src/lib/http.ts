import { authStore } from "./authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Hàm gọi API duy nhất cho cả JSON payload và FormData (tự động điều chỉnh Content-Type).
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...restOptions } = options;
  const isFormData = restOptions.body instanceof FormData;
  const defaultHeaders: Record<string, string> = isFormData
    ? {}
    : { "Content-Type": "application/json" };

  const res = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: { ...defaultHeaders, ...(headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message ?? `Yêu cầu máy chủ thất bại (${res.status})`, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

/** Biến giữ promise refresh đang thực thi để gom các request 401 đồng thời thành single-flight */
let refreshPromise: Promise<string> | null = null;

async function performSingleFlightRefresh(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefreshToken = authStore.getRefreshToken();
  if (!currentRefreshToken) {
    authStore.clearSession();
    throw new ApiError("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.", 401);
  }

  refreshPromise = (async () => {
    try {
      const res = await request<{ token: string }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      });
      authStore.updateToken(res.token);
      return res.token;
    } catch (err) {
      // Khi refresh token thất bại hoặc bị thu hồi, xóa sạch phiên và buộc người dùng đăng nhập lại
      authStore.clearSession();
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Wrapper request tự động gắn Authorization Bearer từ authStore.
 * Khi nhận lỗi 401, thực hiện single-flight refresh token và thử lại đúng 1 lần.
 */
export async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authStore.getToken();
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const mergedHeaders = {
    ...authHeaders,
    ...(options.headers as Record<string, string>),
  };

  try {
    return await request<T>(path, { ...options, headers: mergedHeaders });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const newToken = await performSingleFlightRefresh();
      const retryHeaders = {
        ...mergedHeaders,
        Authorization: `Bearer ${newToken}`,
      };
      return await request<T>(path, { ...options, headers: retryHeaders });
    }
    throw err;
  }
}
