import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/auth.js";
import { validate } from "../../middlewares/validate.js";
import { loginSchema, refreshTokenSchema } from "../../schemas/auth.schema.js";
import { verifyToken, requireAdmin, requireOwner } from "../../middlewares/verifyToken.js";

export const authRouter = Router();

const DUMMY_HASH = bcrypt.hashSync("dummy_password_timing_protection", 10);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// POST /api/auth/login — admin login only
authRouter.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body ?? {};

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPassword = typeof password === "string" ? password : "";

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu." });
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ message: "Định dạng email không hợp lệ." });
  }

  const admins = await db.get("admins");
  const admin = admins.find(
    (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
  );

  const passwordHash = admin ? admin.password_hash : DUMMY_HASH;
  const isPasswordValid = await bcrypt.compare(cleanPassword, passwordHash);

  if (!admin || !isPasswordValid) {
    return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
  }

  const role = admin.role ?? "admin";
  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.insert("refresh_tokens", {
    id: uuid(),
    admin_id: admin.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    revoked_at: null,
    created_at: new Date().toISOString(),
  });

  res.json({
    token,
    refreshToken: rawRefreshToken,
    admin: { id: admin.id, email: admin.email, role },
  });
});

// POST /api/auth/refresh — get new access token via refresh token
authRouter.post("/refresh", validate(refreshTokenSchema), async (req, res) => {
  const { refresh_token } = req.body;

  const tokenHash = hashToken(refresh_token);
  const refreshTokens = await db.get("refresh_tokens");
  const match = refreshTokens.find(
    (rt) =>
      rt.token_hash === tokenHash &&
      !rt.revoked_at &&
      new Date(rt.expires_at) > new Date()
  );

  if (!match) {
    return res.status(401).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn." });
  }

  const admins = await db.get("admins");
  const admin = admins.find((a) => a.id === match.admin_id);
  if (!admin) {
    return res.status(401).json({ message: "Tài khoản admin không tồn tại." });
  }

  const role = admin.role ?? "admin";
  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({ token });
});

// POST /api/auth/logout — revoke refresh token
authRouter.post("/logout", async (req, res) => {
  const { refresh_token } = req.body ?? {};
  if (refresh_token && typeof refresh_token === "string") {
    const tokenHash = hashToken(refresh_token);
    await db.updateWhere(
      "refresh_tokens",
      "token_hash",
      tokenHash,
      { revoked_at: new Date().toISOString() }
    );
  }
  res.json({ message: "Đã đăng xuất thành công." });
});

// GET /api/auth/me — verify access token & return current admin profile
authRouter.get("/me", verifyToken, requireAdmin, async (req, res) => {
  const admins = await db.get("admins");
  const admin = admins.find((a) => a.id === req.user?.sub);
  if (!admin) {
    return res.status(401).json({ message: "Tài khoản admin không tồn tại." });
  }
  res.json({
    admin: { id: admin.id, email: admin.email, role: admin.role ?? "admin" },
  });
});

// PATCH /api/auth/me — change own email or password
authRouter.patch("/me", verifyToken, requireAdmin, async (req, res) => {
  const admins = await db.get("admins");
  const admin = admins.find((a) => a.id === req.user?.sub);
  if (!admin) {
    return res.status(404).json({ message: "Không tìm thấy tài khoản admin." });
  }

  const { email, password, current_password } = req.body ?? {};
  const patch = {};

  if (email !== undefined) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ message: "Email không được để trống." });
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ message: "Định dạng email không hợp lệ." });
    }
    const duplicate = admins.find(
      (a) => a.id !== admin.id && a.email && a.email.trim().toLowerCase() === cleanEmail
    );
    if (duplicate) {
      return res.status(400).json({ message: "Email này đã được sử dụng bởi tài khoản khác." });
    }
    patch.email = cleanEmail;
  }

  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }
    if (!current_password) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại để xác nhận." });
    }
    const isCurrentValid = await bcrypt.compare(current_password, admin.password_hash);
    if (!isCurrentValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác." });
    }
    patch.password_hash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(patch).length === 0) {
    return res.json({
      message: "Không có thay đổi nào.",
      admin: { id: admin.id, email: admin.email, role: admin.role ?? "admin" },
    });
  }

  const updated = await db.updateById("admins", admin.id, patch);
  const updatedAdmin = updated || { ...admin, ...patch };

  const role = updatedAdmin.role ?? admin.role ?? "admin";
  const newToken = jwt.sign(
    { sub: updatedAdmin.id, email: updatedAdmin.email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({
    message: "Cập nhật thông tin thành công.",
    token: newToken,
    admin: { id: updatedAdmin.id, email: updatedAdmin.email, role },
  });
});

// ── Admin Management Routes ──────────────────────────────────────────────────

// GET /api/auth/admins — admin only, view all admin accounts (passwords hidden)
authRouter.get("/admins", verifyToken, requireAdmin, async (_req, res) => {
  const admins = await db.get("admins");
  const safeList = admins.map((a) => ({
    id: a.id,
    email: a.email,
    role: a.role ?? "admin",
    created_at: a.created_at ?? null,
  }));
  res.json(safeList);
});

// POST /api/auth/admins — owner only, create new admin account (always role: admin)
authRouter.post("/admins", verifyToken, requireOwner, async (req, res) => {
  const { email, password } = req.body ?? {};
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPassword = typeof password === "string" ? password : "";

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu." });
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ message: "Định dạng email không hợp lệ." });
  }

  if (cleanPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
  }

  const admins = await db.get("admins");
  if (admins.some((a) => a.email && a.email.trim().toLowerCase() === cleanEmail)) {
    return res.status(400).json({ message: "Email này đã được sử dụng." });
  }

  const password_hash = await bcrypt.hash(cleanPassword, 10);
  const newAdmin = {
    id: uuid(),
    email: cleanEmail,
    password_hash,
    role: "admin", // hardcoded: cannot create owner via API
    created_at: new Date().toISOString(),
  };

  await db.insert("admins", newAdmin);
  res.status(201).json({
    id: newAdmin.id,
    email: newAdmin.email,
    role: newAdmin.role,
    created_at: newAdmin.created_at,
  });
});

// DELETE /api/auth/admins/:id — owner only, delete an admin account
authRouter.delete("/admins/:id", verifyToken, requireOwner, async (req, res) => {
  const { id } = req.params;

  // a. Cannot delete currently logged in account
  if (id === req.user?.sub) {
    return res.status(400).json({ message: "Không thể tự xoá tài khoản đang đăng nhập." });
  }

  // b. Target must exist
  const admins = await db.get("admins");
  const target = admins.find((a) => a.id === id);
  if (!target) {
    return res.status(404).json({ message: "Không tìm thấy tài khoản admin." });
  }

  // c. Cannot delete owner accounts via API
  if (target.role === "owner") {
    return res.status(403).json({ message: "Không thể xoá tài khoản owner qua API." });
  }

  // d. Remove from database
  await db.removeById("admins", id);
  res.status(204).send();
});
