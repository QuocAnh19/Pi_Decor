import * as Sentry from "@sentry/react";

/**
 * Khởi tạo Sentry client nếu biến môi trường VITE_SENTRY_DSN được cấu hình.
 * Tự động che giấu thông tin nhạy cảm trước khi gửi sự kiện.
 */
export function initClientSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      if (event.request?.headers?.authorization) {
        event.request.headers.authorization = "[REDACTED]";
      }
      return event;
    },
  });
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
