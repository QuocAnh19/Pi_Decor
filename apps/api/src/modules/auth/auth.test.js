import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { pool } from "../../config/database.js";
import {
  TEST_ADMIN,
  TEST_OWNER,
  seedTestAdmin,
  seedTestOwner,
  generateTestAdminToken,
} from "../../../tests/helpers.js";

describe("Auth Integration Tests", () => {
  beforeEach(async () => {
    await pool.query("delete from refresh_tokens");
    await pool.query("delete from admins where id not in ($1, $2)", [TEST_ADMIN.id, TEST_OWNER.id]);
    await seedTestAdmin();
    await seedTestOwner();
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

  it("từ chối đăng nhập với mật khẩu sai và email không tồn tại cùng trả 401 (chống user enumeration)", async () => {
    const wrongPassRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: "WrongPassword123!" });

    expect(wrongPassRes.status).toBe(401);
    expect(wrongPassRes.body.message).toBe("Sai email hoặc mật khẩu.");

    const nonexistentRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@pidecor.vn", password: "SomePassword123!" });

    expect(nonexistentRes.status).toBe(401);
    expect(nonexistentRes.body.message).toBe("Sai email hoặc mật khẩu.");
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

    const firstRefresh = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: originalRefreshToken });
    expect(firstRefresh.status).toBe(200);

    const reusedRefresh = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: originalRefreshToken });

    expect(reusedRefresh.status).toBe(401);
    expect(reusedRefresh.body.message).toMatch(/Phát hiện refresh token bị sử dụng lại/);

    const { rows } = await pool.query(
      "select * from refresh_tokens where admin_id = $1 and revoked_at is null",
      [TEST_ADMIN.id]
    );
    expect(rows.length).toBe(0);
  });

  it("thu hồi toàn bộ phiên khi gọi POST /api/auth/logout-all", async () => {
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

  it("tạo admin mới: yêu cầu owner, kiểm tra mật khẩu 12-128 ký tự, báo 409 khi trùng email", async () => {
    const adminToken = generateTestAdminToken(TEST_ADMIN);
    const ownerToken = generateTestAdminToken(TEST_OWNER);

    // Quyền admin không được tạo tài khoản admin khác (403)
    const forbiddenRes = await request(app)
      .post("/api/auth/admins")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "newadmin@pidecor.vn", password: "Password12345!" });
    expect(forbiddenRes.status).toBe(403);

    // Mật khẩu < 12 ký tự bị từ chối (400)
    const shortPassRes = await request(app)
      .post("/api/auth/admins")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: "newadmin@pidecor.vn", password: "short" });
    expect(shortPassRes.status).toBe(400);

    // Email trùng trả 409
    const dupRes = await request(app)
      .post("/api/auth/admins")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: TEST_ADMIN.email, password: "Password12345!" });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.message).toMatch(/Email này đã được sử dụng/);

    // Tạo thành công (201)
    const createdRes = await request(app)
      .post("/api/auth/admins")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: "newstaff@pidecor.vn", password: "ValidPassword123!" });
    expect(createdRes.status).toBe(201);
    expect(createdRes.body).toHaveProperty("id");
    expect(createdRes.body.email).toBe("newstaff@pidecor.vn");
  });

  it("đổi mật khẩu qua PATCH /api/auth/me: bắt buộc currentPassword, thu hồi token khi thành công", async () => {
    const adminToken = generateTestAdminToken(TEST_ADMIN);

    // Tạo một refresh token cho admin này trong DB để kiểm tra tính năng thu hồi
    await pool.query(
      `insert into refresh_tokens (admin_id, token_hash, expires_at)
       values ($1, 'dummy_token_hash_for_test', now() + interval '30 days')`,
      [TEST_ADMIN.id]
    );

    // Đổi mật khẩu nhưng thiếu currentPassword (400)
    const missingCurrentRes = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ newPassword: "NewSecretPassword123!" });
    expect(missingCurrentRes.status).toBe(400);

    // Sai currentPassword (400)
    const wrongCurrentRes = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: "WrongCurrentPassword123!",
        newPassword: "NewSecretPassword123!",
      });
    expect(wrongCurrentRes.status).toBe(400);
    expect(wrongCurrentRes.body.message).toMatch(/Mật khẩu hiện tại không chính xác/);

    // Thành công đổi mật khẩu (200)
    const successRes = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        currentPassword: TEST_ADMIN.password,
        newPassword: "NewSecretPassword123!",
      });
    expect(successRes.status).toBe(200);

    // Refresh token cũ trước đó bị thu hồi
    const { rows } = await pool.query(
      "select * from refresh_tokens where admin_id = $1 and revoked_at is null",
      [TEST_ADMIN.id]
    );
    expect(rows.length).toBe(0);

    // Đăng nhập lại với mật khẩu mới thành công
    const newLoginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: "NewSecretPassword123!" });
    expect(newLoginRes.status).toBe(200);
  });

  it("xóa admin qua DELETE /api/auth/admins/:id: không thể tự xóa và không xóa owner cuối cùng", async () => {
    const ownerToken = generateTestAdminToken(TEST_OWNER);

    // Owner không thể tự xóa chính mình
    const selfDeleteRes = await request(app)
      .delete(`/api/auth/admins/${TEST_OWNER.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(selfDeleteRes.status).toBe(400);
    expect(selfDeleteRes.body.message).toMatch(/Không thể tự xoá tài khoản/);

    // Giả lập admin khác là owner
    const secondOwnerRes = await pool.query(
      `insert into admins (id, email, password_hash, role)
       values ($1, $2, 'hash', 'owner')
       on conflict (id) do nothing
       returning id`,
      ["a0000000-0000-4000-8000-000000000003", "owner2@pidecor.vn"]
    );
    const secondOwnerId = secondOwnerRes.rows[0]?.id || "a0000000-0000-4000-8000-000000000003";

    // Xóa secondOwner khi có 2 owner -> thành công
    const deleteOwnerRes = await request(app)
      .delete(`/api/auth/admins/${secondOwnerId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(deleteOwnerRes.status).toBe(204);

    // Xóa admin thường -> thành công
    const deleteAdminRes = await request(app)
      .delete(`/api/auth/admins/${TEST_ADMIN.id}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(deleteAdminRes.status).toBe(204);
  });

  it("trả về 400 Bad Request khi param :id không phải UUID trên ít nhất 4 module khác nhau", async () => {
    const ownerToken = generateTestAdminToken(TEST_OWNER);
    const adminToken = generateTestAdminToken(TEST_ADMIN);

    // 1. Auth module: DELETE /api/auth/admins/:id
    const authRes = await request(app)
      .delete("/api/auth/admins/invalid-uuid-123")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(authRes.status).toBe(400);
    expect(authRes.body.message).toMatch(/định dạng UUID/);

    // 2. Leads module: GET /api/leads/:id
    const leadsRes = await request(app)
      .get("/api/leads/not-a-valid-uuid")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(leadsRes.status).toBe(400);
    expect(leadsRes.body.message).toMatch(/định dạng UUID/);

    // 3. Quotations module: GET /api/quotations/:id
    const quotationsRes = await request(app)
      .get("/api/quotations/12345")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(quotationsRes.status).toBe(400);
    expect(quotationsRes.body.message).toMatch(/định dạng UUID/);

    // 4. Venues module: GET /api/venues/:id (route công khai)
    const venuesRes = await request(app).get("/api/venues/abc-xyz");
    expect(venuesRes.status).toBe(400);
    expect(venuesRes.body.message).toMatch(/định dạng UUID/);

    // 5. Projects module: DELETE /api/projects/:id
    const projectsRes = await request(app)
      .delete("/api/projects/not-uuid")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(projectsRes.status).toBe(400);
    expect(projectsRes.body.message).toMatch(/định dạng UUID/);
  });
});
