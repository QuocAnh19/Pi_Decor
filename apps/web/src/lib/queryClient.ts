import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./http";

/**
 * Cấu hình tập trung QueryClient cho toàn bộ ứng dụng.
 * - staleTime: 30s giúp tận dụng cache, tránh gọi lại API liên tục.
 * - retry: tối đa 1 lần, bỏ qua các mã lỗi 4xx phía client.
 * - refetchOnWindowFocus: tắt để không ghi đè dữ liệu khi admin đang nhập form.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
