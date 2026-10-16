import { request, authRequest } from "../http";
import type { TestimonialItem, TestimonialPayload } from "../types";

export const testimonialsApi = {
  getTestimonials: () => request<TestimonialItem[]>("/testimonials"),

  submitTestimonial: (payload: TestimonialPayload | FormData) =>
    request<TestimonialItem>("/testimonials", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),

  getTestimonialsAdmin: (status?: string) =>
    authRequest<TestimonialItem[]>(
      status
        ? `/testimonials/admin?status=${encodeURIComponent(status)}`
        : "/testimonials/admin"
    ),

  updateTestimonialStatus: (id: string, status: string) =>
    authRequest<TestimonialItem>(`/testimonials/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTestimonial: (id: string) =>
    authRequest<void>(`/testimonials/${id}`, { method: "DELETE" }),
};
