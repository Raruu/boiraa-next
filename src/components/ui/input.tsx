import { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ===== Types ===== */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/* ===== Component ===== */

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium",
              disabled ? "text-neutral-400" : "text-neutral-900"
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            "w-full rounded-md border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
            error
              ? "border-error-500 focus:ring-error-500 focus:border-error-500"
              : "border-neutral-300",
            disabled && "bg-neutral-50 text-neutral-400 cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error-600 mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

/* ===== Textarea ===== */

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, disabled, maxLength, showCount = false, value, defaultValue, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(() => {
      const initial = (value as string) || (defaultValue as string) || "";
      return initial.length;
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    // Sync charCount when controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setCharCount((value as string).length);
      }
    }, [value]);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium",
              disabled ? "text-neutral-400" : "text-neutral-900"
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            "w-full rounded-md border px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors resize-y min-h-[80px]",
            "focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500",
            error
              ? "border-error-500 focus:ring-error-500 focus:border-error-500"
              : "border-neutral-300",
            disabled && "bg-neutral-50 text-neutral-400 cursor-not-allowed",
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between mt-1">
          <div>
            {error && <p className="text-xs text-error-600">{error}</p>}
            {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
          </div>
          {(showCount || maxLength) && (
            <p className="text-xs text-neutral-400">
              {charCount}{maxLength ? `/${maxLength}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
