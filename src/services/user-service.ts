import { api } from "@/lib/api-client";
import type { PaginatedResponse, ApiSingleResponse } from "@/types/api";
import type { User } from "@/types/user";

export const userService = {
  getUsers: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<User>>("/api/users", params),

  getUserById: (id: string) =>
    api.get<ApiSingleResponse<User>>(`/api/users/${id}`),

  createUser: (data: Record<string, unknown>) =>
    api.post<ApiSingleResponse<User>>("/api/users", data),

  updateUser: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.put<ApiSingleResponse<User>>(`/api/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/api/users/${id}`),
};
