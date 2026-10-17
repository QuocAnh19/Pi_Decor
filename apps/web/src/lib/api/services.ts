import { request, authRequest } from "../http";
import type { ServiceCategory } from "../types";

export const servicesApi = {
  getServices: () => request<ServiceCategory[]>("/services"),

  createService: (data: FormData | Partial<ServiceCategory>) => {
    const isFormData = data instanceof FormData;
    return authRequest<ServiceCategory>("/services", {
      method: "POST",
      body: isFormData ? data : JSON.stringify(data),
      ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
    });
  },

  updateService: (id: string, data: FormData | Partial<ServiceCategory>) => {
    const isFormData = data instanceof FormData;
    return authRequest<ServiceCategory>(`/services/${id}`, {
      method: "PATCH",
      body: isFormData ? data : JSON.stringify(data),
      ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
    });
  },

  deleteService: (id: string) => authRequest<void>(`/services/${id}`, { method: "DELETE" }),
};
