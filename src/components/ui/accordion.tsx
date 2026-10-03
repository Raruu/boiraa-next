"use client";

import { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===== Context ===== */

interface AccordionContextValue {
  openItems: string[];
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue>({
  openItems: [],
  toggle: () => {},
});

interface AccordionItemContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextValue>({
  isOpen: false,
  toggle: () => {},
});

/* ===== Accordion Root ===== */

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  type?: "single" | "multiple";
  defaultValue?: string[];
}

export function Accordion({
  children,
  className,
  type = "single",
  defaultValue = [],
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultValue);

  const toggle = (value: string) => {
    if (type === "single") {
      setOpenItems((prev) => (prev.includes(value) ? [] : [value]));
    } else {
      setOpenItems((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("divide-y divide-neutral-200", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/* ===== Accordion Item ===== */

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

export function AccordionItem({ children, value, className }: AccordionItemProps) {
  const { openItems, toggle } = useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ isOpen, toggle: () => toggle(value) }}>
      <div className={cn("", className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

/* ===== Accordion Trigger ===== */

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { isOpen, toggle } = useContext(AccordionItemContext);

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "flex w-full items-center justify-between py-3 px-4 text-base font-normal text-neutral-900 transition-colors hover:bg-neutral-50",
        "h-12",
        className
      )}
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 text-neutral-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

/* ===== Accordion Content ===== */

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { isOpen } = useContext(AccordionItemContext);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "px-4 pb-4 text-base text-neutral-600 leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  );
}
