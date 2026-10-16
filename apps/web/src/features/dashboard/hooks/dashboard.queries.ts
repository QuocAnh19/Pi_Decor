import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import type { AdminSummary } from "../../../lib/types";

/** Centralized query keys cho module Dashboard / Admin Summary */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

/** Query lấy số liệu thống kê tổng quan của trang admin */
export function useAdminSummaryQuery(enabled = true) {
  return useQuery<AdminSummary>({
    queryKey: dashboardKeys.summary(),
    queryFn: () => api.getSummary(),
    enabled,
  });
}
