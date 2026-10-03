import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";

export const metadata = {
  title: {
    default: "Dashboard",
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || "Boiraa"}`,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area — margin left only on desktop */}
      <div className="flex flex-1 flex-col lg:ml-[200px]">
        {/* Top bar */}
        <Topbar />

        {/* Page content with breadcrumb inside */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Breadcrumb />
          <div className="mt-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
