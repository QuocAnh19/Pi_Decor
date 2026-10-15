import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { Lead, LeadStatus } from "../../../lib/types";

export interface LeadsQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  enabled?: boolean;
}

/** Centralized query keys cho Leads */
export const leadsKeys = {
  all: ["leads"] as const,
  list: (params: { page: number; limit: number; q: string; status: string }) =>
    [...leadsKeys.all, "list", params] as const,
};

/** Query lấy danh sách leads phân trang và tìm kiếm */
export function useLeadsQuery({
  page = 1,
  limit = 20,
  q = "",
  status = "all",
  enabled = true,
}: LeadsQueryParams = {}) {
  const params = { page, limit, q, status };
  return useQuery<{ data: Lead[]; total: number }>({
    queryKey: leadsKeys.list(params),
    queryFn: () => api.getLeads(params),
    enabled,
  });
}

/** Mutation cập nhật trạng thái của lead */
export function useUpdateLeadStatusMutation() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không cập nhật được trạng thái khách hàng.");
    },
  });
}
