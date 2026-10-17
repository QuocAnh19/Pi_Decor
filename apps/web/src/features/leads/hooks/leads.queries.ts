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
  activities: (leadId: string) => [...leadsKeys.all, "activities", leadId] as const,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      queryClient.invalidateQueries({ queryKey: leadsKeys.activities(variables.id) });
    },
    onError: (err) => {
      toast.error(err, "Không cập nhật được trạng thái khách hàng.");
    },
  });
}

/** Query lấy dòng thời gian hoạt động của một lead */
export function useLeadActivitiesQuery(leadId: string, enabled = true) {
  return useQuery({
    queryKey: leadsKeys.activities(leadId),
    queryFn: () => api.getLeadActivities(leadId, { limit: 50 }),
    enabled: Boolean(leadId) && enabled,
  });
}

/** Mutation thêm hoạt động/ghi chú mới cho lead */
export function useAddLeadActivityMutation() {
  return useMutation({
    mutationFn: ({
      leadId,
      activity_type,
      body,
    }: {
      leadId: string;
      activity_type: string;
      body?: string | null;
    }) => api.addLeadActivity(leadId, { activity_type, body }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.activities(variables.leadId) });
      toast.success("Đã thêm hoạt động vào dòng thời gian!");
    },
    onError: (err) => {
      toast.error(err, "Không thể thêm hoạt động.");
    },
  });
}
