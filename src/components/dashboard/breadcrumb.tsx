"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";

/* ===== Breadcrumb mapping =====
 * Add a readable label per dashboard segment. Unknown segments fall back to
 * a capitalized version of the URL slug.
 */

const LABEL_MAP: Record<string, string> = {
  dashboard: "Beranda",
  pengguna: "Pengguna",
  pengaturan: "Pengaturan",
};

function getLabel(segment: string): string {
  return LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

/* ===== Component ===== */

export function Breadcrumb() {
  const pathname = usePathname();

  // Split path into segments, remove empty strings
  const segments = pathname.split("/").filter(Boolean);
  // Remove "dashboard" from display since Beranda already links to it
  const crumbs = segments.slice(1); // skip "dashboard" prefix

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {/* Home icon → Beranda */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="font-medium">Beranda</span>
      </Link>

      {/* Subsequent crumbs */}
      {crumbs.map((segment, index) => {
        const href = "/dashboard/" + crumbs.slice(0, index + 1).join("/");
        const isLast = index === crumbs.length - 1;
        const label = getLabel(segment);

        return (
          <span key={href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            {isLast ? (
              <span className="text-neutral-700">{label}</span>
            ) : (
              <Link
                href={href}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
