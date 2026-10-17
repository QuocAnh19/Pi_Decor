import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/config/database.js";
import {
  resolveSslConfig,
  isConnectionError,
  runWithRetry,
  testDbConnection,
} from "../src/config/database.pg.js";
import { materialsService } from "../src/modules/materials/materials.service.js";
import { materialsRepository } from "../src/modules/materials/materials.repository.js";
import * as mediaService from "../src/shared/media.service.js";

describe("Infrastructure & Resilience Tests (P27B)", () => {
  describe("SSL Configuration (resolveSslConfig)", () => {
    it("tắt SSL đối với localhost hoặc postgres host nội bộ", () => {
      const configLocal = resolveSslConfig("postgresql://pidecor:secret@localhost:5432/pidecor");
      expect(configLocal).toBe(false);

      const configPostgresHost = resolveSslConfig("postgresql://pidecor:secret@postgres:5432/pidecor");
      expect(configPostgresHost).toBe(false);
    });

    it("bật verify-full (rejectUnauthorized: true) cho host bên ngoài (Neon)", () => {
      const configNeon = resolveSslConfig(
        "postgresql://user:pass@ep-cool-db.ap-southeast-1.aws.neon.tech/pidecor"
      );
      expect(configNeon).toEqual({ rejectUnauthorized: true });
    });
  });

  describe("Connection Error Detection & Retry (runWithRetry)", () => {
    it("nhận diện đúng các mã lỗi ngắt kết nối mạng", () => {
      expect(isConnectionError({ code: "ECONNRESET" })).toBe(true);
      expect(isConnectionError({ code: "ETIMEDOUT" })).toBe(true);
      expect(isConnectionError({ code: "57P01" })).toBe(true);
      expect(isConnectionError({ message: "Connection terminated unexpectedly" })).toBe(true);
      expect(isConnectionError({ message: "syntax error at or near 'SELECT'" })).toBe(false);
      expect(isConnectionError(null)).toBe(false);
    });

    it("tự động thử lại 1 lần khi gặp lỗi kết nối và thành công ở lần 2", async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        if (callCount === 1) {
          const err = new Error("Connection terminated unexpectedly");
          err.code = "ECONNRESET";
          throw err;
        }
        return { success: true };
      };

      const result = await runWithRetry(fn);
      expect(result).toEqual({ success: true });
      expect(callCount).toBe(2);
    });

    it("không thử lại nếu lỗi không phải là lỗi kết nối mạng (ví dụ lỗi logic)", async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        throw new Error("Invalid column name");
      };

      await expect(runWithRetry(fn)).rejects.toThrow("Invalid column name");
      expect(callCount).toBe(1);
    });

    it("testDbConnection thử lại khi gặp lỗi kết nối ban đầu", async () => {
      let attempts = 0;
      const mockPool = {
        connect: async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error("Neon compute scaling up");
          }
          return {
            query: async () => true,
            release: () => {},
          };
        },
      };

      const ok = await testDbConnection(mockPool, 3, 50);
      expect(ok).toBe(true);
      expect(attempts).toBe(2);
    });
  });

  describe("Split Health Check (/api/health và /api/health/ready)", () => {
    it("GET /api/health trả về 200 liveness mà không phụ thuộc DB", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body).toHaveProperty("uptime");
      expect(res.body).toHaveProperty("timestamp");
    });

    it("GET /api/health/ready trả về 200 khi kết nối DB thành công", async () => {
      const res = await request(app).get("/api/health/ready");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.db).toBe("connected");
      expect(res.body).toHaveProperty("latency_ms");
    });

    it("GET /api/health/ready trả về 503 degraded khi DB gặp lỗi", async () => {
      const querySpy = vi.spyOn(pool, "query").mockRejectedValueOnce(new Error("Connection refused"));

      try {
        const res = await request(app).get("/api/health/ready");
        expect(res.status).toBe(503);
        expect(res.body).toEqual({ status: "degraded", db: "unreachable" });
      } finally {
        querySpy.mockRestore();
      }
    });
  });

  describe("Media Deletion Order Safety", () => {
    it("không gọi xóa Cloudinary nếu cập nhật DB thất bại", async () => {
      const cleanupSpy = vi.spyOn(mediaService, "cleanupRemovedMedia").mockResolvedValue();
      const findSpy = vi.spyOn(materialsRepository, "findById").mockResolvedValue({
        id: "mat-123",
        name: "Vải hoa",
        category: "fabric",
        image_url: "https://res.cloudinary.com/pidecor/image/upload/v1/old.jpg",
      });
      const updateSpy = vi
        .spyOn(materialsRepository, "updateById")
        .mockRejectedValue(new Error("DB constraint violation"));

      try {
        await expect(
          materialsService.updateMaterial(
            "mat-123",
            { category: "fabric" },
            { filename: "new.jpg", mimetype: "image/jpeg" },
            { protocol: "http", get: () => "localhost" }
          )
        ).rejects.toThrow("DB constraint violation");

        // Đảm bảo cleanupRemovedMedia KHÔNG được gọi trước khi updateById thành công
        expect(cleanupSpy).not.toHaveBeenCalled();
      } finally {
        cleanupSpy.mockRestore();
        findSpy.mockRestore();
        updateSpy.mockRestore();
      }
    });
  });
});
