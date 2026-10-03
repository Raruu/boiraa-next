import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),
  fullname: z.string().min(3, "Nama minimal 3 karakter").max(200),
  roleId: z.string().min(1, "Role wajib dipilih"),
  phone: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
});

export const updateUserSchema = z.object({
  fullname: z.string().min(3).max(200).optional(),
  roleId: z.string().min(1).optional(),
  phone: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
