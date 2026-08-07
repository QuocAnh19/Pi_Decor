import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/database.js";

export const authRouter = Router();

// Pre-computed dummy hash to prevent timing attacks / user enumeration
const DUMMY_HASH = bcrypt.hashSync("dummy_password_timing_protection", 10);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/login — admin login only (no public customer accounts yet,
// matching the current scope: the Studio doesn't require sign-in). Run
// `npm run seed` first to create the admin row from .env.
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  // Input sanitization & normalization
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPassword = typeof password === "string" ? password : "";

  if (!cleanEmail || !cleanPassword) {
    return res.status(400).json({ message: "Thiếu email hoặc mật khẩu." });
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return res.status(400).json({ message: "Định dạng email không hợp lệ." });
  }

  // Lookup admin with case-insensitive email match
  const admins = await db.get("admins");
  const admin = admins.find(
    (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
  );

  // Timing attack safe password verification (always executes bcrypt.compare)
  const passwordHash = admin ? admin.password_hash : DUMMY_HASH;
  const isPasswordValid = await bcrypt.compare(cleanPassword, passwordHash);

  if (!admin || !isPasswordValid) {
    return res.status(401).json({ message: "Sai email hoặc mật khẩu." });
  }

  // Security check for JWT Secret in Production
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

  res.json({ token, admin: { id: admin.id, email: admin.email } });
});

