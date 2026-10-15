import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { MaterialItem } from "../../../lib/types";

/** Centralized query keys cho module Materials */
export const materialsKeys = {
  all: ["materials"] as const,
};

/** Query lấy toàn bộ danh sách vật liệu */
export function useMaterialsQuery() {
  return useQuery<MaterialItem[]>({
    queryKey: materialsKeys.all,
    queryFn: () => api.getMaterials(),
  });
}

/** Mutation tạo vật liệu mới */
export function useCreateMaterialMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => api.createMaterial(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không tạo được vật liệu mới.");
    },
  });
}

/** Mutation cập nhật vật liệu */
export function useUpdateMaterialMutation() {
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      api.updateMaterial(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không cập nhật được vật liệu.");
    },
  });
}

/**
 * Mutation xoá vật liệu với cơ chế xóa lạc quan (optimistic delete)
 * và tự động rollback khi máy chủ trả về lỗi.
 */
export function useDeleteMaterialMutation() {
  return useMutation({
    mutationFn: (id: string) => api.deleteMaterial(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: materialsKeys.all });
      const previousMaterials = queryClient.getQueryData<MaterialItem[]>(materialsKeys.all);

      queryClient.setQueryData<MaterialItem[]>(materialsKeys.all, (old) =>
        old ? old.filter((m) => m.id !== id) : [],
      );

      return { previousMaterials };
    },
    onError: (err, _id, context) => {
      if (context?.previousMaterials) {
        queryClient.setQueryData(materialsKeys.all, context.previousMaterials);
      }
      toast.error(err, "Lỗi khi xoá vật liệu.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.all });
    },
  });
}
