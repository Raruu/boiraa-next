import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({ className, size = "md" }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-blue-500 border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );
}
