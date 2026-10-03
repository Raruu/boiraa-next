import { notFound } from "next/navigation";

export const metadata = { title: "Internal Components" };

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only accessible in development
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <>{children}</>;
}
