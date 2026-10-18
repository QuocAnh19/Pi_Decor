import rateLimit from "express-rate-limit";
import { logSecurityEvent } from "../shared/securityLogger.js";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    logSecurityEvent(
      "auth_login_rate_limit_exceeded",
      {
        ip: req.ip,
        email: req.body?.email ? String(req.body.email).trim().toLowerCase() : undefined,
      },
      "Vượt quá số lần thử đăng nhập sai tối đa (Rate Limit)"
    );
    res.status(options.statusCode).json(options.message);
  },
  message: { message: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút." },
});

export const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau." },
});

export const testimonialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Bạn đã gửi quá nhiều đánh giá. Vui lòng thử lại sau ít phút." },
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 requests / 15 phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều yêu cầu làm mới phiên. Vui lòng thử lại sau ít phút." },
});
