import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { captureServerError } from "../config/sentry.js";

/**
 * Express error handler middleware
 */
export function errorHandler(err, req, res, _next) {
  captureServerError(err, req);
  const reqId = req.id || req.headers?.["x-request-id"];
  if (req.log) {
    req.log.error({ reqId, err }, err.message || "Unhandled server error");
  } else {
    logger.error({ reqId, err }, err.message || "Unhandled server error");
  }

  if (err && err.code === "LIMIT_FIELD_VALUE") {
    return res.status(400).json({ message: "Kích thước trường dữ liệu quá lớn." });
  }
  if (err && (err.type === "entity.too.large" || err.status === 413)) {
    return res.status(413).json({ message: "Dung lượng dữ liệu vượt quá giới hạn cho phép." });
  }
  const statusCode = err.http_code || err.status || (res.statusCode >= 400 ? res.statusCode : 500);

  // Ở production, che giấu chi tiết lỗi máy chủ 5xx để đảm bảo an toàn thông tin
  if (statusCode >= 500 && env.NODE_ENV === "production") {
    return res.status(statusCode).json({ message: "Lỗi máy chủ." });
  }
  res.status(statusCode).json({ message: err.message ?? "Lỗi máy chủ." });
}
