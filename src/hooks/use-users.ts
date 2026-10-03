"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user-service";
import { toast } from "sonner";

export function useUsers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getUserById(id!),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => userService.createUser(data),
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error & { data?: Record<string, unknown> }) => {
      toast.error((error.data?.message as string) || "Gagal membuat user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      userService.updateUser({ id, data }),
    onSuccess: () => {
      toast.success("User berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error & { data?: Record<string, unknown> }) => {
      toast.error((error.data?.message as string) || "Gagal memperbarui user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      toast.success("User berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error & { data?: Record<string, unknown> }) => {
      toast.error((error.data?.message as string) || "Gagal menghapus user");
    },
  });
}
