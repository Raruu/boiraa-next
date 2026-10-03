"use client";

import { cn } from "@/lib/utils";

/* ===== Types ===== */

type SwitchVariant = "fill" | "outline";

interface SwitchProps {
  checked?: boolean;
  variant?: SwitchVariant;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
  id?: string;
}

/* ===== Component ===== */

export function Switch({
  checked = false,
  variant = "fill",
  disabled = false,
  onChange,
  className,
  label,
  id,
}: SwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-12 items-center rounded-full p-[3px] transition-colors",
          // Fill variant
          variant === "fill" && checked && !disabled && "bg-primary-500",
          variant === "fill" && !checked && !disabled && "bg-neutral-300",
          variant === "fill" && checked && disabled && "bg-primary-200",
          variant === "fill" && !checked && disabled && "bg-neutral-200",
          // Outline variant
          variant === "outline" && checked && !disabled && "border-2 border-primary-500 bg-white",
          variant === "outline" && !checked && !disabled && "border-2 border-neutral-300 bg-white",
          variant === "outline" && checked && disabled && "border-2 border-primary-200 bg-white",
          variant === "outline" && !checked && disabled && "border-2 border-neutral-200 bg-white",
          // Cursor
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <span
          className={cn(
            "inline-block h-[18px] w-[18px] rounded-full transition-transform",
            // Thumb color
            variant === "fill" && "bg-white",
            variant === "outline" && checked && !disabled && "bg-primary-500",
            variant === "outline" && !checked && !disabled && "bg-neutral-400",
            variant === "outline" && checked && disabled && "bg-primary-200",
            variant === "outline" && !checked && disabled && "bg-neutral-200",
            // Position
            checked ? "translate-x-[24px]" : "translate-x-0"
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm select-none",
            disabled ? "text-neutral-400 cursor-not-allowed" : "text-neutral-900 cursor-pointer"
          )}
          onClick={handleClick}
        >
          {label}
        </label>
      )}
    </div>
  );
}
