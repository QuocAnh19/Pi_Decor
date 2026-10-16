import { request, authRequest } from "../http";
import type { MaterialItem, ServiceCategory } from "../types";

export const materialsApi = {
  getMaterials: (category?: string) =>
    request<MaterialItem[]>(
      category ? `/materials?category=${encodeURIComponent(category)}` : "/materials"
    ),

  createMaterial: (formData: FormData) =>
    authRequest<MaterialItem>("/materials", {
      method: "POST",
      body: formData,
    }),

  updateMaterial: (id: string, formData: FormData) =>
    authRequest<MaterialItem>(`/materials/${id}`, {
      method: "PATCH",
      body: formData,
    }),

  deleteMaterial: (id: string) => authRequest<void>(`/materials/${id}`, { method: "DELETE" }),

  getServices: () => request<ServiceCategory[]>("/services"),
};
