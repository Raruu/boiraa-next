import { cn } from "@/lib/utils";

type BadgeVariant = "brand" | "warning" | "info" | "default" | "error";

const variants: Record<BadgeVariant, string> = {
  brand: "bg-primary-700 text-white",
  warning: "bg-warning-500 text-white",
  info: "bg-info-500 text-white",
  default: "bg-neutral-200 text-neutral-700",
  error: "bg-error-500 text-white",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-3xl px-4 py-1.5 text-sm font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
