import { describe, it, expect, vi } from "vitest";
import { logger } from "../src/config/logger.js";
import { logSecurityEvent } from "../src/shared/securityLogger.js";
import { authService } from "../src/modules/auth/auth.service.js";

describe("Structured Security Audit Logging", () => {
  it("ghi nhật ký sự kiện bảo mật với cờ security_audit: true", () => {
    const spy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    logSecurityEvent(
      "test_security_event",
      { user_id: "test-user-id" },
      "Mô tả sự kiện thử nghiệm"
    );

    expect(spy).toHaveBeenCalled();
    const [payload, message] = spy.mock.calls[0];
    expect(payload.security_audit).toBe(true);
    expect(payload.event).toBe("test_security_event");
    expect(payload.user_id).toBe("test-user-id");
    expect(message).toContain("[SECURITY_AUDIT]");

    spy.mockRestore();
  });

  it("ghi log auth_login_failed khi đăng nhập thất bại", async () => {
    const spy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    await expect(
      authService.login({ email: "invalid_user@pidecor.vn", password: "wrong_password_123" })
    ).rejects.toThrow("Sai email hoặc mật khẩu.");

    const loginFailCall = spy.mock.calls.find(
      (c) => c[0] && c[0].event === "auth_login_failed"
    );
    expect(loginFailCall).toBeDefined();
    expect(loginFailCall[0].email).toBe("invalid_user@pidecor.vn");

    spy.mockRestore();
  });
});
