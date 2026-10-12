import pino from "pino";
import pinoHttp from "pino-http";
import { v4 as uuid } from "uuid";
import { env } from "./env.js";

const isDev = env.NODE_ENV === "development";

/**
 * Cấu hình Pino logger chuẩn production:
 * - Level lấy theo env.LOG_LEVEL (mặc định 'info').
 * - Format dạng human-readable (pino-pretty) chỉ bật khi ở môi trường development.
 * - Redact thông tin nhạy cảm (Authorization header, Cookie, Token) tránh lộ lọt trong log.
 */
export const logger = pino({
  level: env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "headers.authorization",
      "headers.cookie",
      "authorization",
      "cookie",
      "token",
      "refreshToken",
      "password",
    ],
    censor: "[REDACTED]",
  },
});

/**
 * Middleware pino-http ghi log HTTP request/response:
 * - Gắn hoặc sinh request ID (x-request-id).
 * - Tự động thiết lập response header 'x-request-id' để client tiện truy vết.
 * - Tự động bỏ qua spam log từ health check probes (/api/health).
 */
export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const id = existing && typeof existing === "string" ? existing : uuid();
    if (res && typeof res.setHeader === "function") {
      res.setHeader("x-request-id", id);
    }
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: {
    ignore: (req) => req.url === "/api/health",
  },
});
