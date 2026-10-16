import * as Sentry from "@sentry/node";
import { env } from "./env.js";

/**
 * Khởi tạo Sentry cho backend nếu có biến SENTRY_DSN.
 * Redact toàn bộ thông tin nhạy cảm: token, password, thông tin cá nhân trong request body.
 */
export function initSentry() {
  if (!env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    beforeSend(event) {
      if (event.request) {
        // Che header Authorization và Cookie
        if (event.request.headers) {
          if (event.request.headers.authorization) {
            event.request.headers.authorization = "[REDACTED]";
          }
          if (event.request.headers.cookie) {
            event.request.headers.cookie = "[REDACTED]";
          }
        }

        // Che thông tin nhạy cảm trong body (đăng nhập, số điện thoại/email của lead)
        if (event.request.data) {
          try {
            const data =
              typeof event.request.data === "string"
                ? JSON.parse(event.request.data)
                : { ...event.request.data };

            if (data.password) data.password = "[REDACTED]";
            if (data.token) data.token = "[REDACTED]";
            if (data.refreshToken) data.refreshToken = "[REDACTED]";
            if (data.phone) data.phone = "[REDACTED]";
            if (data.email) data.email = "[REDACTED]";

            event.request.data = data;
          } catch {
            // Trường hợp data không phải JSON hợp lệ thì giữ nguyên
          }
        }
      }
      return event;
    },
  });
}

/**
 * Ghi nhận lỗi server vào Sentry, tự động bỏ qua toàn bộ lỗi 4xx (client errors).
 */
export function captureServerError(err, req) {
  if (!env.SENTRY_DSN) return;

  const status = Number(err?.status || err?.statusCode || 500);
  // Bỏ qua lỗi 4xx
  if (status >= 400 && status < 500) {
    return;
  }

  Sentry.withScope((scope) => {
    if (req) {
      scope.setExtra("reqId", req.id || req.headers?.["x-request-id"]);
      scope.setExtra("path", req.path);
      scope.setExtra("method", req.method);
    }
    Sentry.captureException(err);
  });
}
