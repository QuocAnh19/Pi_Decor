import { describe, it, expect, vi } from "vitest";
import { validateEnv } from "../src/config/env.js";

describe("Environment Validation Tests", () => {
  it("thoát với exit code 1 khi thiếu JWT_SECRET", () => {
    const mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const mockStderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    try {
      expect(() => {
        validateEnv({
          NODE_ENV: "test",
          DATABASE_URL: "postgresql://localhost:5432/test",
          // Không có JWT_SECRET
        });
      }).toThrow("process.exit: 1");

      expect(mockExit).toHaveBeenCalledWith(1);
    } finally {
      mockExit.mockRestore();
      mockStderr.mockRestore();
    }
  });

  it("thoát với exit code 1 khi JWT_SECRET có độ dài nhỏ hơn 32 ký tự", () => {
    const mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const mockStderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    try {
      expect(() => {
        validateEnv({
          NODE_ENV: "test",
          DATABASE_URL: "postgresql://localhost:5432/test",
          JWT_SECRET: "short-secret-less-than-32-chars",
        });
      }).toThrow("process.exit: 1");

      expect(mockExit).toHaveBeenCalledWith(1);
    } finally {
      mockExit.mockRestore();
      mockStderr.mockRestore();
    }
  });

  it("thành công khi cấu hình biến môi trường đầy đủ và hợp lệ", () => {
    const validConfig = {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://localhost:5432/test",
      JWT_SECRET: "this_is_a_very_long_valid_jwt_secret_with_more_than_32_characters",
    };

    const parsed = validateEnv(validConfig);
    expect(parsed.JWT_SECRET).toBe(validConfig.JWT_SECRET);
    expect(parsed.DATABASE_URL).toBe(validConfig.DATABASE_URL);
  });
});
