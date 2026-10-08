"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      {/* SVG in /public — next/image would require dangerouslyAllowSVG */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/base/404.svg" alt="Page not found" className="h-40 w-auto" />
      <h1 className="mt-6 text-xl font-semibold text-neutral-900">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-2 text-sm text-neutral-500 text-center">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Button variant="outline" size="lg" className="mt-6" onClick={() => router.back()}>
        Kembali ke Halaman Sebelumnya
      </Button>
    </div>
  );
}
