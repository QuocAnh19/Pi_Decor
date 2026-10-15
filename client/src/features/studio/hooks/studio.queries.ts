import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { StudioTemplateRow } from "../../../lib/types";

/** Centralized query keys cho module Studio */
export const studioKeys = {
  all: ["studio"] as const,
  templates: (isAdmin: boolean) => [...studioKeys.all, "templates", { isAdmin }] as const,
  slots: (templateId: string) => [...studioKeys.all, "slots", templateId] as const,
  rules: (templateId: string) => [...studioKeys.all, "rules", templateId] as const,
};

/** Query lấy danh sách templates phía admin */
export function useStudioTemplatesAdminQuery(enabled = true) {
  return useQuery<StudioTemplateRow[]>({
    queryKey: studioKeys.templates(true),
    queryFn: () => api.getStudioTemplatesAdmin(),
    enabled,
  });
}

/** Query lấy danh sách templates công khai cho khách hàng */
export function useStudioTemplatesQuery() {
  return useQuery<StudioTemplateRow[]>({
    queryKey: studioKeys.templates(false),
    queryFn: () => api.getStudioTemplates(),
  });
}

/** Mutation cập nhật studio template */
export function useUpdateStudioTemplateMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<StudioTemplateRow> }) =>
      api.updateStudioTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không thể cập nhật mẫu thiết kế.");
    },
  });
}

/** Mutation xoá studio template */
export function useDeleteStudioTemplateMutation() {
  return useMutation({
    mutationFn: (id: string) => api.deleteStudioTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không thể xoá mẫu thiết kế.");
    },
  });
}
