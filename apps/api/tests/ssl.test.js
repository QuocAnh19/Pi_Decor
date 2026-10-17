import { describe, expect, it } from "vitest";
import {
  extractHost,
  normalizeConnectionString,
  resolveEffectiveSslMode,
  resolveSslConfig,
} from "../src/config/db/ssl.js";

describe("Database SSL Configuration & Normalization (pg v9 compatibility)", () => {
  const localUrl = "postgresql://pidecor:dev@localhost:5432/pidecor";
  const remoteUrl = "postgresql://user:pass@ep-sparkling.neon.tech:5432/neondb";

  describe("extractHost", () => {
    it("trích xuất hostname chính xác từ URL", () => {
      expect(extractHost(localUrl)).toBe("localhost");
      expect(extractHost(remoteUrl)).toBe("ep-sparkling.neon.tech");
    });
  });

  describe("resolveEffectiveSslMode", () => {
    it("mặc định disable khi host là localhost", () => {
      expect(resolveEffectiveSslMode(localUrl, null)).toBe("disable");
      expect(resolveEffectiveSslMode("postgresql://u:p@127.0.0.1:5432/db", null)).toBe("disable");
      expect(resolveEffectiveSslMode("postgresql://u:p@postgres:5432/db", null)).toBe("disable");
    });

    it("mặc định verify-full khi host ngoài localhost", () => {
      expect(resolveEffectiveSslMode(remoteUrl, null)).toBe("verify-full");
    });

    it("ưu tiên explicitMode nếu được cung cấp", () => {
      expect(resolveEffectiveSslMode(remoteUrl, "disable")).toBe("disable");
      expect(resolveEffectiveSslMode(localUrl, "require")).toBe("require");
      expect(resolveEffectiveSslMode(localUrl, "verify-full")).toBe("verify-full");
    });
  });

  describe("resolveSslConfig", () => {
    it("chế độ disable trả về false", () => {
      const config = resolveSslConfig(remoteUrl, "disable");
      expect(config).toBe(false);
    });

    it("chế độ require trả về rejectUnauthorized: false", () => {
      const config = resolveSslConfig(remoteUrl, "require");
      expect(config).toEqual({ rejectUnauthorized: false });
    });

    it("chế độ verify-full trả về rejectUnauthorized: true", () => {
      const config = resolveSslConfig(remoteUrl, "verify-full");
      expect(config).toEqual({ rejectUnauthorized: true });
    });

    it("gán CA cert nếu có caInput", () => {
      const config = resolveSslConfig(remoteUrl, "verify-full", "-----BEGIN CERTIFICATE-----TEST");
      expect(config).toEqual({
        rejectUnauthorized: true,
        ca: "-----BEGIN CERTIFICATE-----TEST",
      });
    });
  });

  describe("normalizeConnectionString", () => {
    it("chế độ disable đặt sslmode=disable và xóa uselibpqcompat", () => {
      const input = "postgresql://user:pass@host:5432/db?sslmode=require&uselibpqcompat=true";
      const normalized = normalizeConnectionString(input, "disable");
      const url = new URL(normalized);
      expect(url.searchParams.get("sslmode")).toBe("disable");
      expect(url.searchParams.has("uselibpqcompat")).toBe(false);
    });

    it("chế độ require đặt sslmode=require kèm uselibpqcompat=true cho pg v9", () => {
      const input = "postgresql://user:pass@host:5432/db?sslmode=require";
      const normalized = normalizeConnectionString(input, "require");
      const url = new URL(normalized);
      expect(url.searchParams.get("sslmode")).toBe("require");
      expect(url.searchParams.get("uselibpqcompat")).toBe("true");
    });

    it("chế độ verify-full đặt sslmode=verify-full tường minh", () => {
      const input = "postgresql://user:pass@host:5432/db?sslmode=require";
      const normalized = normalizeConnectionString(input, "verify-full");
      const url = new URL(normalized);
      expect(url.searchParams.get("sslmode")).toBe("verify-full");
      expect(url.searchParams.has("uselibpqcompat")).toBe(false);
    });
  });
});
