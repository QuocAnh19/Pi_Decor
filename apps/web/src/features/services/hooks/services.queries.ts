import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { ServiceCategory } from "../../../lib/types";

/** Centralized query keys cho module Services */
export const servicesKeys = {
  all: ["services"] as const,
  list: () => [...servicesKeys.all, "list"] as const,
};

/** Query lấy danh sách toàn bộ dịch vụ Bento */
export function useServicesQuery() {
  return useQuery<ServiceCategory[]>({
    queryKey: servicesKeys.list(),
    queryFn: () => api.getServices(),
  });
}

/** Mutation tạo mới dịch vụ */
export function useCreateServiceMutation() {
  return useMutation({
    mutationFn: (data: FormData | Partial<ServiceCategory>) => api.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success("Tạo dịch vụ thành công!");
    },
    onError: (err) => {
      toast.error(err, "Không thể tạo dịch vụ.");
    },
  });
}

/** Mutation cập nhật thông tin dịch vụ (từng phần / multipart) */
export function useUpdateServiceMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | Partial<ServiceCategory> }) =>
      api.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success("Cập nhật dịch vụ thành công!");
    },
    onError: (err) => {
      toast.error(err, "Cập nhật dịch vụ thất bại.");
    },
  });
}

/** Mutation xoá dịch vụ khỏi hệ thống */
export function useDeleteServiceMutation() {
  return useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
      toast.success("Xoá dịch vụ thành công!");
    },
    onError: (err) => {
      toast.error(err, "Xoá dịch vụ thất bại.");
    },
  });
}
