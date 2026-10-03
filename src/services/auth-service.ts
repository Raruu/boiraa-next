import { api } from "@/lib/api-client";
import type { ApiSingleResponse } from "@/types/api";
import type { AuthUser, LoginInput } from "@/types/auth";

export const authService = {
  login: (input: LoginInput) =>
    api.post<ApiSingleResponse<AuthUser>>("/api/auth/login", input),

  logout: () => api.post<ApiSingleResponse<null>>("/api/auth/logout"),

  getMe: () => api.get<ApiSingleResponse<AuthUser>>("/api/auth/me"),

  refresh: () => api.post<ApiSingleResponse<null>>("/api/auth/refresh"),
};
