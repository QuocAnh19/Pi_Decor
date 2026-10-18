import crypto from "crypto";
import bcrypt from "bcryptjs";

export const DUMMY_HASH = bcrypt.hashSync("dummy_password_timing_protection", 10);
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
