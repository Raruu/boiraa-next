"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===== Types ===== */

export interface StepItem {
  title: string;
  caption?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
}

type StepStatus = "completed" | "active" | "upcoming";

/* ===== Component ===== */

export function Stepper({ steps, currentStep, className }: StepperProps) {
  const getStatus = (index: number): StepStatus => {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "upcoming";
  };

  return (
    <div className={cn("flex items-start", className)}>
      {steps.map((step, index) => {
        const status = getStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex items-start flex-1">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <StepCircle status={status} number={index + 1} />
              <p
                className={cn(
                  "mt-2 text-sm font-medium text-center",
                  status === "active" && "text-neutral-900",
                  status === "completed" && "text-neutral-900",
                  status === "upcoming" && "text-neutral-400"
                )}
              >
                {step.title}
              </p>
              {step.caption && (
                <p
                  className={cn(
                    "text-xs text-center",
                    status === "upcoming" ? "text-neutral-300" : "text-neutral-500"
                  )}
                >
                  {step.caption}
                </p>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 flex items-center pt-3.5">
                <div
                  className={cn(
                    "h-0.5 w-full",
                    index < currentStep ? "bg-primary-500" : "bg-neutral-200"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===== Step Circle ===== */

function StepCircle({ status, number }: { status: StepStatus; number: number }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
        status === "active" && "bg-primary-500 text-white",
        status === "completed" && "bg-primary-500 text-white",
        status === "upcoming" && "bg-neutral-200 text-neutral-500"
      )}
    >
      {status === "completed" ? (
        <Check className="h-4 w-4" strokeWidth={2.5} />
      ) : (
        number
      )}
    </div>
  );
}
