import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.js";

/**
 * verifyToken / requireAdmin / requireOwner
 * ──────────────────────────────────────────
 * Middleware xác thực và phân quyền cho các endpoint quản trị:
 * - verifyToken: kiểm tra JWT bearer token trong Authorization header.
 * - requireAdmin: yêu cầu role 'admin' hoặc 'owner'.
 * - requireOwner: yêu cầu role 'owner' cho các tác vụ nhạy cảm (quản lý admin khác).
 */
export function verifyToken(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Thiếu token xác thực." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin" && req.user?.role !== "owner") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập khu vực này." });
  }
  next();
}

export function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res
      .status(403)
      .json({ message: "Chỉ chủ sở hữu (owner) mới có quyền thực hiện thao tác này." });
  }
  next();
}
