import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { queryClient } from "../../../lib/queryClient";
import { toast } from "../../../lib/toast";
import type { TestimonialItem, TestimonialPayload } from "../../../lib/types";

/** Centralized query keys cho module Testimonials */
export const testimonialsKeys = {
  all: ["testimonials"] as const,
  publicList: () => [...testimonialsKeys.all, "public"] as const,
  adminList: (status?: string) => [...testimonialsKeys.all, "admin", { status }] as const,
};

/** Query lấy danh sách testimonials công khai (đã duyệt) */
export function useTestimonialsQuery() {
  return useQuery<TestimonialItem[]>({
    queryKey: testimonialsKeys.publicList(),
    queryFn: () => api.getTestimonials(),
  });
}

/** Query lấy danh sách testimonials cho trang quản trị */
export function useTestimonialsAdminQuery(status?: string, enabled = true) {
  return useQuery<TestimonialItem[]>({
    queryKey: testimonialsKeys.adminList(status),
    queryFn: () => api.getTestimonialsAdmin(status),
    enabled,
  });
}

/** Mutation gửi đánh giá mới (từ phía khách) */
export function useSubmitTestimonialMutation() {
  return useMutation({
    mutationFn: (payload: TestimonialPayload | FormData) =>
      api.submitTestimonial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Không thể gửi đánh giá.");
    },
  });
}

/** Mutation duyệt hoặc từ chối đánh giá (phía admin) */
export function useUpdateTestimonialStatusMutation() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateTestimonialStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Cập nhật trạng thái đánh giá thất bại.");
    },
  });
}

/** Mutation xoá đánh giá */
export function useDeleteTestimonialMutation() {
  return useMutation({
    mutationFn: (id: string) => api.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialsKeys.all });
    },
    onError: (err) => {
      toast.error(err, "Xoá đánh giá thất bại.");
    },
  });
}
