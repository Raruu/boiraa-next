"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLogout } from "@/hooks/use-auth";

/**
 * Sidebar navigation.
 *
 * Add your own domains to MENU below — grouping is purely presentational.
 * The active state matches `/dashboard` exactly and any other href by prefix.
 */

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const MENU: MenuGroup[] = [
  {
    title: "UTAMA",
    items: [
      { label: "Beranda", href: "/dashboard", icon: Home },
      { label: "Pengguna", href: "/dashboard/pengguna", icon: Users },
    ],
  },
  {
    title: "LAINNYA",
    items: [
      { label: "Pengaturan", href: "/dashboard/pengaturan", icon: Settings },
    ],
  },
];

/* ===== Sidebar Content ===== */

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => router.replace("/login"),
    });
  };

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Boiraa";

  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        {/* SVG in /public — next/image would require dangerouslyAllowSVG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/base/favico.svg" alt="Logo" className="h-8 w-8" />
        <div>
          <p className="text-sm font-bold text-neutral-900 leading-tight">
            {appName}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {MENU.map((group) => (
          <div key={group.title}>
            <p className="px-2 mb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary-700 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-neutral-200 px-3 py-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          disabled={logout.isPending}
          className="w-full justify-start gap-2.5 rounded-md px-2.5 text-neutral-600 hover:text-neutral-900"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </Button>
      </div>
    </>
  );
}

/* ===== Mobile Toggle Button ===== */

export function SidebarToggle() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => document.dispatchEvent(new CustomEvent("toggle-sidebar"))}
      className="rounded-md text-neutral-600 lg:hidden"
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

/* ===== Main Sidebar Component ===== */

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile sidebar when the route changes. Derived during render
  // (instead of a setState-in-effect) so no extra render pass is triggered.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  // Listen for toggle event from topbar
  useEffect(() => {
    const handler = () => setMobileOpen((prev) => !prev);
    document.addEventListener("toggle-sidebar", handler);
    return () => document.removeEventListener("toggle-sidebar", handler);
  }, []);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-[200px] flex-col border-r border-neutral-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Close button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-md text-neutral-500"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
