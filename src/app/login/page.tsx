"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/server/validators";

/**
 * Demo credential — must match the seeded admin (prisma/seed.ts).
 * The form is pre-filled so you can log in with one click after running
 * `npm run db:migrate && npm run db:seed`. Replace with a blank form once you
 * have real accounts.
 */
const DEMO = { email: "admin@demo.com", password: "password" };

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/dashboard";
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: DEMO,
  });

  const onSubmit = (values: LoginInput) => {
    setServerError(null);
    login.mutate(values, {
      onSuccess: () => {
        toast.success("Login berhasil");
        router.replace(redirectTo);
      },
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Gagal login";
        setServerError(message);
      },
    });
  };

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Boiraa";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold tracking-tight">
              {appName.charAt(0)}
            </span>
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">Masuk</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gunakan kredensial demo yang sudah terisi
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            autoComplete="username"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <p className="text-xs text-error-600" role="alert">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={login.isPending}
          >
            {login.isPending ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
