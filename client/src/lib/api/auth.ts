import { request, authRequest } from "../http";
import type { Admin, AdminSummary } from "../types";

export const authApi = {
  adminLogin: (payload: { email: string; password: string }) =>
    request<{ token: string; refreshToken?: string; admin: Admin }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),

  refreshToken: (refreshToken: string) =>
    request<{ token: string; refreshToken?: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (refreshToken: string) =>
    request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logoutAll: () =>
    authRequest<{ message: string }>("/auth/logout-all", { method: "POST" }),

  getMe: () => authRequest<{ admin: Admin }>("/auth/me"),

  updateMe: (payload: {
    email?: string;
    current_password?: string;
    password?: string;
  }) =>
    authRequest<{ message: string; token: string; admin: Admin }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  listAdmins: () => authRequest<Admin[]>("/auth/admins"),

  createAdmin: (payload: { email: string; password: string }) =>
    authRequest<Admin>("/auth/admins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteAdmin: (id: string) =>
    authRequest<void>(`/auth/admins/${id}`, { method: "DELETE" }),

  getSummary: () => authRequest<AdminSummary>("/admin/summary"),
};
