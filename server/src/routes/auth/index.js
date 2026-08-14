import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { db } from "../../config/database.js";
import { validate } from "../../middlewares/validate.js";
import { loginSchema } from "../../schemas/auth.schema.js";
import { verifyToken, requireAdmin } from "../../middlewares/verifyToken.js";

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

  const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
  if (process.env.NODE_ENV === "production" && jwtSecret === "dev-secret") {
    console.warn(
      "[SECURITY WARNING] Auth: JWT_SECRET đang dùng 'dev-secret' mặc định trong môi trường Production."
    );
  }

  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role: "admin" },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" }
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
    admin: { id: admin.id, email: admin.email },
  });
});

// POST /api/auth/refresh — get new access token via refresh token
authRouter.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body ?? {};
  if (!refresh_token || typeof refresh_token !== "string") {
    return res.status(401).json({ message: "Thiếu refresh token." });
  }

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

  const jwtSecret = process.env.JWT_SECRET ?? "dev-secret";
  const token = jwt.sign(
    { sub: admin.id, email: admin.email, role: "admin" },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" }
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
    admin: { id: admin.id, email: admin.email },
  });
});
