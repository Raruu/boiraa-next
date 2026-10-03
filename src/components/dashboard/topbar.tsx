"use client";

import { Bell } from "lucide-react";
import { SidebarToggle } from "./sidebar";
import { useMe } from "@/hooks/use-auth";

/**
 * Topbar — sticky header inside the dashboard layout.
 * Shows the hamburger on mobile and the signed-in user's initial on the right.
 */
export function Topbar() {
  const { data } = useMe();
  const user = data?.data;
  const initial = (user?.fullname || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
      {/* Left: Hamburger (mobile only) */}
      <SidebarToggle />

      {/* Spacer for desktop (no hamburger) */}
      <div className="hidden lg:block" />

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500">
          <span className="text-xs font-bold text-white">{initial}</span>
        </div>
      </div>
    </header>
  );
}
