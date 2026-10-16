import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { Venue, VenueDetail, VenuePayload, ProjectPayload } from "../../../lib/types";

/** Centralized query keys cho module Venues */
export const venuesKeys = {
  all: ["venues"] as const,
  list: () => [...venuesKeys.all, "list"] as const,
  detail: (id: string) => [...venuesKeys.all, "detail", id] as const,
};

/** Query lấy danh sách tất cả địa điểm */
export function useVenuesQuery() {
  return useQuery<Venue[]>({
    queryKey: venuesKeys.list(),
    queryFn: () => api.getVenues(),
  });
}

/** Query lấy chi tiết một địa điểm kèm các dự án */
export function useVenueDetailQuery(id: string | null) {
  return useQuery<VenueDetail>({
    queryKey: venuesKeys.detail(id || ""),
    queryFn: () => api.getVenue(id!),
    enabled: Boolean(id),
  });
}

/** Mutation tạo mới địa điểm */
export function useCreateVenueMutation() {
  return useMutation({
    mutationFn: (payload: VenuePayload) => api.createVenue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venuesKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không thể tạo địa điểm mới.");
    },
  });
}

/** Mutation cập nhật thông tin địa điểm */
export function useUpdateVenueMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VenuePayload> }) =>
      api.updateVenue(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venuesKeys.all });
      queryClient.invalidateQueries({ queryKey: venuesKeys.detail(variables.id) });
    },
    onError: (err) => {
      toast.error(err, "Không thể cập nhật địa điểm.");
    },
  });
}

/** Mutation xoá địa điểm */
export function useDeleteVenueMutation() {
  return useMutation({
    mutationFn: (id: string) => api.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venuesKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không xoá được địa điểm.");
    },
  });
}

/** Mutation tạo dự án gắn vào địa điểm */
export function useCreateVenueProjectMutation() {
  return useMutation({
    mutationFn: ({ venueId, payload }: { venueId: string; payload: ProjectPayload }) =>
      api.createVenueProject(venueId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venuesKeys.all });
      queryClient.invalidateQueries({ queryKey: venuesKeys.detail(variables.venueId) });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err) => {
      toast.error(err, "Không tạo được dự án cho địa điểm.");
    },
  });
}

/** Mutation xoá dự án thuộc địa điểm */
export function useDeleteVenueProjectMutation() {
  return useMutation({
    mutationFn: ({ projectId }: { projectId: string; venueId?: string }) =>
      api.deleteProject(projectId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venuesKeys.all });
      if (variables.venueId) {
        queryClient.invalidateQueries({ queryKey: venuesKeys.detail(variables.venueId) });
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err) => {
      toast.error(err, "Không xoá được dự án.");
    },
  });
}
