"use client";

import { cn } from "@/lib/utils";

/* ===== Types ===== */

interface RadioProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
  id?: string;
  name?: string;
  value?: string;
}

/* ===== Component ===== */

export function Radio({
  checked = false,
  disabled = false,
  onChange,
  className,
  label,
  id,
  name,
  value,
}: RadioProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        id={id}
        role="radio"
        aria-checked={checked}
        aria-disabled={disabled}
        data-name={name}
        data-value={value}
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          checked && !disabled && "border-primary-500",
          checked && disabled && "border-neutral-300",
          !checked && !disabled && "border-neutral-400",
          !checked && disabled && "border-neutral-200",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {checked && (
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              !disabled ? "bg-primary-500" : "bg-neutral-300"
            )}
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

/* ===== Radio Group ===== */

interface RadioGroupOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
  className?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  disabled = false,
  direction = "vertical",
  className,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "flex gap-3",
        direction === "vertical" ? "flex-col" : "flex-row items-center",
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          checked={value === option.value}
          disabled={disabled || option.disabled}
          onChange={() => onChange?.(option.value)}
          label={option.label}
          name={name}
          value={option.value}
        />
      ))}
    </div>
  );
}
