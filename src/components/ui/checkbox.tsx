"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===== Types ===== */

type CheckboxValue = "checked" | "unchecked" | "indeterminate";
type CheckboxVariant = "fill" | "outline";

interface CheckboxProps {
  checked?: CheckboxValue | boolean;
  variant?: CheckboxVariant;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
  id?: string;
}

/* ===== Component ===== */

export function Checkbox({
  checked = false,
  variant = "fill",
  disabled = false,
  onChange,
  className,
  label,
  id,
}: CheckboxProps) {
  // Normalize boolean to CheckboxValue
  const value: CheckboxValue =
    typeof checked === "boolean"
      ? checked
        ? "checked"
        : "unchecked"
      : checked;

  const isChecked = value === "checked";
  const isIndeterminate = value === "indeterminate";
  const isActive = isChecked || isIndeterminate;

  const handleClick = () => {
    if (disabled) return;
    onChange?.(!isChecked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={isIndeterminate ? "mixed" : isChecked}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded transition-colors",
          // Fill variant
          variant === "fill" && isActive && !disabled && "bg-primary-500",
          variant === "fill" && !isActive && !disabled && "bg-neutral-200",
          variant === "fill" && isActive && disabled && "bg-primary-200",
          variant === "fill" && !isActive && disabled && "bg-neutral-100",
          // Outline variant
          variant === "outline" && isActive && !disabled && "border-2 border-primary-500 bg-white",
          variant === "outline" && !isActive && !disabled && "border-2 border-neutral-300 bg-white",
          variant === "outline" && isActive && disabled && "border-2 border-primary-200 bg-white",
          variant === "outline" && !isActive && disabled && "border-2 border-neutral-200 bg-white",
          // Cursor
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {isChecked && (
          <Check
            className={cn(
              "h-3.5 w-3.5",
              variant === "fill" && "text-white",
              variant === "outline" && !disabled && "text-primary-500",
              variant === "outline" && disabled && "text-primary-200"
            )}
            strokeWidth={3}
          />
        )}
        {isIndeterminate && (
          <Minus
            className={cn(
              "h-3.5 w-3.5",
              variant === "fill" && "text-white",
              variant === "outline" && !disabled && "text-primary-500",
              variant === "outline" && disabled && "text-primary-200"
            )}
            strokeWidth={3}
          />
        )}
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
