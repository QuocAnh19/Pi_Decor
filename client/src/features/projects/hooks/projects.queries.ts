import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { Project, ProjectPayload } from "../../../lib/types";

/** Centralized query keys cho module Projects */
export const projectsKeys = {
  all: ["projects"] as const,
  list: (isAdmin: boolean) => [...projectsKeys.all, "list", { isAdmin }] as const,
};

/** Query lấy danh sách projects (hỗ trợ cả public lẫn admin) */
export function useProjectsQuery(isAdmin = false) {
  return useQuery<Project[]>({
    queryKey: projectsKeys.list(isAdmin),
    queryFn: () => (isAdmin ? api.getProjectsAdmin() : api.getProjects()),
  });
}

/** Mutation tạo dự án mới */
export function useCreateProjectMutation() {
  return useMutation({
    mutationFn: (payload: FormData | object) => api.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không thể tạo dự án mới.");
    },
  });
}

/** Mutation cập nhật dự án */
export function useUpdateProjectMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData | object }) =>
      api.updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không thể cập nhật dự án.");
    },
  });
}

/** Mutation xóa dự án */
export function useDeleteProjectMutation() {
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Xóa dự án thất bại.");
    },
  });
}

/** Mutation tạo dự án gắn với địa điểm (venue) */
export function useCreateVenueProjectMutation() {
  return useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: ProjectPayload }) =>
      api.createVenueProject(venueId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
    onError: (err) => {
      toast.error(err, "Không thể tạo dự án cho địa điểm.");
    },
  });
}
