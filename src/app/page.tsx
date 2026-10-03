import Link from "next/link";
import { Badge } from "@/components/ui/badge";

/**
 * Landing page — replace with your product's real home page.
 * Kept as a functional index so a fresh clone is explorable.
 */
const STACK = [
  "Next.js 16",
  "Prisma v7",
  "Zod v4",
  "React Query",
  "Tailwind CSS",
  "TypeScript",
];

export default function Home() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Boiraa";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm w-full gap-6">
        {/* Logo mark */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-neutral-900 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold tracking-tight">
              {appName.charAt(0)}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success-400 border-2 border-white flex items-center justify-center">
            <svg
              className="h-2.5 w-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
            {appName}
          </h1>
          <p className="text-sm text-neutral-500">
            Arsitektur berhasil dimuat dan siap digunakan.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-neutral-100" />

        {/* Stack badges */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {STACK.map((name) => (
            <Badge key={name} variant="default">
              {name}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-2">
          <Link
            href="/dashboard"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-colors text-center"
          >
            Masuk Dashboard
          </Link>
          <Link
            href="/internal/components"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors text-center"
          >
            Design System & Components
          </Link>
        </div>
      </div>
    </div>
  );
}
