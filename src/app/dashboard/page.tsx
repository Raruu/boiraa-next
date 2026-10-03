"use client";

import { useMe } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useMe();
  const user = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-neutral-500">Sesi tidak valid</p>
          <a
            href="/login?redirectTo=/dashboard"
            className="inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-colors"
          >
            Login Ulang
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Selamat Datang, {user.fullname}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Role</p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">
            {user.role}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Email</p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">
            {user.email}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Status</p>
          <p className="mt-1 text-lg font-semibold text-success-600">Aktif</p>
        </div>
      </div>
    </div>
  );
}
