import "dotenv/config";
import { beforeAll, beforeEach, afterAll } from "vitest";
import { runMigrations } from "../database/migrate.js";
import { pool } from "../src/config/database.js";

/**
 * Thiết lập môi trường test cho server:
 * 1. Chạy migrate trước khi chạy test suite
 * 2. Dọn sạch dữ liệu các bảng nghiệp vụ giữa các test case để đảm bảo tính độc lập
 * 3. Đóng pool sau khi hoàn thành toàn bộ test
 */
beforeAll(async () => {
  // Chạy migration đảm bảo schema mới nhất
  await runMigrations();
});

beforeEach(async () => {
  if (pool) {
    // Dọn sạch dữ liệu các bảng giữa mỗi test case
    await pool.query(`
      truncate table 
        lead_activities,
        quotations,
        leads,
        projects,
        refresh_tokens
      cascade;
    `);
  }
});

afterAll(async () => {
  if (pool) {
    await pool.end();
  }
});
