import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/config/database.js";
import { TEST_ADMIN, seedTestAdmin, generateTestAdminToken } from "./helpers.js";

describe("Auth Integration Tests", () => {
  beforeEach(async () => {
    await seedTestAdmin();
  });

  it("cho phép đăng nhập thành công với thông tin đúng", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body.admin.email).toBe(TEST_ADMIN.email);
  });

  it("từ chối đăng nhập với mật khẩu sai", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: "WrongPassword" });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Sai email hoặc mật khẩu/);
  });

  it("xoay vòng refresh token hợp lệ và cấp access token mới", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    const originalRefreshToken = loginRes.body.refreshToken;

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: originalRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty("token");
    expect(refreshRes.body).toHaveProperty("refreshToken");
    expect(refreshRes.body.refreshToken).not.toBe(originalRefreshToken);
  });

  it("phát hiện việc sử dụng lại refresh token cũ và thu hồi toàn bộ phiên (Token Reuse Detection - P10)", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    const originalRefreshToken = loginRes.body.refreshToken;

    // Lần 1: Dùng refresh token hợp lệ để xoay vòng
    const firstRefresh = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: originalRefreshToken });
    expect(firstRefresh.status).toBe(200);

    // Lần 2: Cố tình sử dụng lại chính refresh token cũ đã bị thu hồi
    const reusedRefresh = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: originalRefreshToken });

    expect(reusedRefresh.status).toBe(401);
    expect(reusedRefresh.body.message).toMatch(/Phát hiện refresh token bị sử dụng lại/);

    // Kiểm tra toàn bộ token của admin này trong database đều bị revoked
    const { rows } = await pool.query(
      "select * from refresh_tokens where admin_id = $1 and revoked_at is null",
      [TEST_ADMIN.id]
    );
    expect(rows.length).toBe(0);
  });

  it("thu hồi toàn bộ phiên khi gọi POST /api/auth/logout-all", async () => {
    // Đăng nhập 2 lần giả lập 2 thiết bị khác nhau
    await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    const token = generateTestAdminToken();

    const logoutAllRes = await request(app)
      .post("/api/auth/logout-all")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutAllRes.status).toBe(200);
    expect(logoutAllRes.body.message).toMatch(/Đã thu hồi tất cả phiên/);

    const { rows } = await pool.query(
      "select * from refresh_tokens where admin_id = $1 and revoked_at is null",
      [TEST_ADMIN.id]
    );
    expect(rows.length).toBe(0);
  });
});
