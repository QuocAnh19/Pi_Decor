import { describe, it, expect, beforeEach, vi } from "vitest";
import { authStore } from "./authStore";
import type { Admin } from "./types";

describe("authStore", () => {
  const dummyAdmin: Admin = {
    id: "admin-1",
    email: "admin@pidecor.vn",
    role: "admin",
  };

  beforeEach(() => {
    authStore.clearSession();
  });

  it("khởi tạo với trạng thái rỗng", () => {
    const snap = authStore.getSnapshot();
    expect(snap.token).toBeNull();
    expect(snap.refreshToken).toBeNull();
    expect(snap.admin).toBeNull();
  });

  it("lưu phiên và đồng bộ qua getSnapshot / sessionStorage", () => {
    authStore.setSession({
      token: "access-token-123",
      refreshToken: "refresh-token-456",
      admin: dummyAdmin,
    });

    const snap = authStore.getSnapshot();
    expect(snap.token).toBe("access-token-123");
    expect(snap.refreshToken).toBe("refresh-token-456");
    expect(snap.admin?.email).toBe("admin@pidecor.vn");
    expect(authStore.getToken()).toBe("access-token-123");
    expect(authStore.getRefreshToken()).toBe("refresh-token-456");
  });

  it("cập nhật access token và refresh token sau khi xoay vòng", () => {
    authStore.setSession({
      token: "old-access",
      refreshToken: "old-refresh",
      admin: dummyAdmin,
    });

    authStore.updateTokens("new-access", "new-refresh");

    expect(authStore.getToken()).toBe("new-access");
    expect(authStore.getRefreshToken()).toBe("new-refresh");
  });

  it("xóa sạch phiên và bắn sự kiện auth:unauthorized khi gọi clearSession", () => {
    authStore.setSession({
      token: "token-to-clear",
      refreshToken: "refresh-to-clear",
      admin: dummyAdmin,
    });

    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);

    authStore.clearSession();

    expect(authStore.getToken()).toBeNull();
    expect(authStore.getRefreshToken()).toBeNull();
    expect(authStore.getAdmin()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener("auth:unauthorized", listener);
  });
});
