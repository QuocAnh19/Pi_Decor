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
    expect(parsed.DATABASE_URL_DIRECT).toBe(validConfig.DATABASE_URL);
    expect(parsed.DB_POOL_MAX).toBe(5);
    expect(parsed.CLOUDINARY_FOLDER_PREFIX).toBe("pidecor/dev");
  });

  it("giữ nguyên DATABASE_URL_DIRECT riêng biệt nếu được cung cấp", () => {
    const validConfig = {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://user:pass@ep-pooler.neon.tech/db",
      DATABASE_URL_DIRECT: "postgresql://user:pass@ep-direct.neon.tech/db",
      JWT_SECRET: "this_is_a_very_long_valid_jwt_secret_with_more_than_32_characters",
    };

    const parsed = validateEnv(validConfig);
    expect(parsed.DATABASE_URL).toBe(validConfig.DATABASE_URL);
    expect(parsed.DATABASE_URL_DIRECT).toBe(validConfig.DATABASE_URL_DIRECT);
  });

  it("bắt buộc cung cấp CLOUDINARY_FOLDER_PREFIX khi NODE_ENV là production", () => {
    const mockExit = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
    const mockStderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    try {
      expect(() => {
        validateEnv({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://localhost:5432/prod",
          JWT_SECRET: "this_is_a_very_long_valid_jwt_secret_with_more_than_32_characters",
          CLOUDINARY_CLOUD_NAME: "demo",
          CLOUDINARY_API_KEY: "12345",
          CLOUDINARY_API_SECRET: "abcdef",
          // Không có CLOUDINARY_FOLDER_PREFIX
        });
      }).toThrow("process.exit: 1");

      expect(mockExit).toHaveBeenCalledWith(1);
    } finally {
      mockExit.mockRestore();
      mockStderr.mockRestore();
    }
  });

  it("gán mặc định RETENTION_DAYS=180 và chấp nhận giá trị số dương hợp lệ", () => {
    const defaultConfig = {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://localhost:5432/test",
      JWT_SECRET: "this_is_a_very_long_valid_jwt_secret_with_more_than_32_characters",
    };
    const parsedDefault = validateEnv(defaultConfig);
    expect(parsedDefault.RETENTION_DAYS).toBe(180);

    const customConfig = {
      ...defaultConfig,
      RETENTION_DAYS: "365",
    };
    const parsedCustom = validateEnv(customConfig);
    expect(parsedCustom.RETENTION_DAYS).toBe(365);
  });
});

