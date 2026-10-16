import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { request, authRequest, ApiError } from "./http";
import { authStore } from "./authStore";

describe("http utility", () => {
  beforeEach(() => {
    authStore.clearSession();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ném lỗi ApiError với status code và message khi phản hồi không thành công", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Dữ liệu không hợp lệ." }),
    } as Response);

    await expect(request("/test-fail")).rejects.toThrow(ApiError);
    await expect(request("/test-fail")).rejects.toMatchObject({
      status: 400,
      message: "Dữ liệu không hợp lệ.",
    });
  });

  it("thực hiện single-flight refresh khi nhận 401 và thử lại request thành công", async () => {
    authStore.setSession({
      token: "expired-access-token",
      refreshToken: "valid-refresh-token",
      admin: { id: "a1", email: "a@pi.vn", role: "admin" },
    });

    const fetchMock = vi.spyOn(globalThis, "fetch");

    // Lần 1: request ban đầu nhận 401
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Token expired" }),
    } as Response);

    // Lần 2: gọi endpoint /auth/refresh thành công
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        token: "fresh-new-token",
        refreshToken: "fresh-new-refresh",
      }),
    } as Response);

    // Lần 3: thử lại request ban đầu với token mới -> thành công 200
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [1, 2, 3] }),
    } as Response);

    const result = await authRequest<{ success: boolean; data: number[] }>("/protected/data");

    expect(result).toEqual({ success: true, data: [1, 2, 3] });
    expect(authStore.getToken()).toBe("fresh-new-token");
    expect(authStore.getRefreshToken()).toBe("fresh-new-refresh");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
