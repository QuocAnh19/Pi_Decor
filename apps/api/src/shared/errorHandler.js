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

  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Kích thước tệp ảnh vượt quá giới hạn 10MB." });
  }
  if (err && (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE")) {
    return res.status(400).json({ message: "Số lượng tệp ảnh vượt quá giới hạn cho phép." });
  }
  if (err && err.code === "LIMIT_FIELD_VALUE") {
    return res.status(400).json({ message: "Kích thước trường dữ liệu quá lớn." });
  }
  if (err && (err.type === "entity.too.large" || err.status === 413)) {
    return res.status(413).json({ message: "Dung lượng dữ liệu vượt quá giới hạn cho phép." });
  }

  const isCloudinaryQuota =
    err &&
    (err.http_code === 420 ||
      (typeof err.message === "string" &&
        (err.message.toLowerCase().includes("quota") ||
          err.message.toLowerCase().includes("resource limit"))));
  if (isCloudinaryQuota) {
    return res.status(503).json({
      message: "Dịch vụ lưu trữ ảnh tạm thời quá tải hoặc hết hạn mức. Vui lòng thử lại sau.",
    });
  }

  const isCloudinaryTimeout =
    err &&
    (err.http_code === 499 ||
      err.code === "ETIMEDOUT" ||
      (typeof err.message === "string" && err.message.toLowerCase().includes("timeout")));
  if (isCloudinaryTimeout) {
    return res.status(504).json({
      message: "Thời gian tải ảnh lên máy chủ Cloudinary quá hạn. Vui lòng thử lại.",
    });
  }

  const statusCode = err.http_code || err.status || (res.statusCode >= 400 ? res.statusCode : 500);

  // Ở production, che giấu chi tiết lỗi máy chủ 5xx để đảm bảo an toàn thông tin
  if (statusCode >= 500 && env.NODE_ENV === "production") {
    return res.status(statusCode).json({ message: "Lỗi máy chủ." });
  }
  res.status(statusCode).json({ message: err.message ?? "Lỗi máy chủ." });
}
