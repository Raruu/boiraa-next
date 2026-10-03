"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ===== Types ===== */

interface DatePickerProps {
  mode?: "single" | "range";
  size?: "sm" | "md";
  value?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (date: Date) => void;
  onRangeChange?: (start: Date | null, end: Date | null) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
  label?: string;
}

/* ===== Helpers ===== */

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];
const DAYS_ID_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date | null | undefined, b: Date | null | undefined) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const time = date.getTime();
  const s = start.getTime();
  const e = end.getTime();
  return time > Math.min(s, e) && time < Math.max(s, e);
}

function formatHeaderDate(date: Date | null, mode: "single" | "range", endDate?: Date | null) {
  if (!date) return "Pilih tanggal";
  const dayName = DAYS_ID_SHORT[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_ID[date.getMonth()];

  if (mode === "single" || !endDate) {
    return `${dayName}, ${day} ${month}`;
  }

  const endDayName = DAYS_ID_SHORT[endDate.getDay()];
  const endDay = endDate.getDate();
  const endMonth = MONTHS_ID[endDate.getMonth()];
  return `${dayName}, ${day} ${month} – ${endDayName}, ${endDay} ${endMonth}`;
}

/* ===== Component ===== */

export function DatePicker({
  mode = "single",
  size = "md",
  value = null,
  startDate = null,
  endDate = null,
  onChange,
  onRangeChange,
  onConfirm,
  onCancel,
  className,
  label = "Pilih Tanggal",
}: DatePickerProps) {
  const initialDate = value || startDate || new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // For range selection internal state
  const [rangeStart, setRangeStart] = useState<Date | null>(startDate);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(endDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);

  const daysInMonth = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDay = useMemo(() => getFirstDayOfMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  // Previous month days to fill the first row
  const prevMonthDays = useMemo(() => {
    const prevDays = getDaysInMonth(viewYear, viewMonth - 1);
    const days: number[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(prevDays - i);
    }
    return days;
  }, [viewYear, viewMonth, firstDay]);

  // Next month days to fill the last row
  const nextMonthDays = useMemo(() => {
    const totalCells = prevMonthDays.length + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const days: number[] = [];
    for (let i = 1; i <= remaining; i++) {
      days.push(i);
    }
    return days;
  }, [prevMonthDays, daysInMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewYear, viewMonth, day);

    if (mode === "single") {
      setSelectedDate(clickedDate);
      onChange?.(clickedDate);
    } else {
      // Range mode
      if (!rangeStart || (rangeStart && rangeEnd)) {
        // Start new range
        setRangeStart(clickedDate);
        setRangeEnd(null);
        onRangeChange?.(clickedDate, null);
      } else {
        // Complete range
        const newEnd = clickedDate;
        if (clickedDate.getTime() < rangeStart.getTime()) {
          setRangeStart(clickedDate);
          setRangeEnd(rangeStart);
          onRangeChange?.(clickedDate, rangeStart);
        } else {
          setRangeEnd(newEnd);
          onRangeChange?.(rangeStart, newEnd);
        }
      }
    }
  };

  const displayDate = mode === "single" ? selectedDate : rangeStart;
  const displayEndDate = mode === "range" ? rangeEnd : null;

  const isSmall = size === "sm";

  return (
    <div className={cn(
      "rounded-2xl bg-white shadow-lg border border-neutral-200",
      isSmall ? "w-[280px]" : "w-[328px]",
      className
    )}>
      {/* Header */}
      <div className={cn("px-6 pt-5 pb-4", isSmall && "px-4 pt-3 pb-2")}>
        <p className={cn("text-sm text-neutral-500", isSmall && "text-xs")}>{label}</p>
        <p className={cn("text-xl font-semibold text-neutral-900 mt-1", isSmall && "text-base mt-0.5")}>
          {formatHeaderDate(displayDate, mode, displayEndDate)}
        </p>
      </div>

      {/* Month Navigation */}
      <div className={cn("flex items-center justify-between px-6 pb-3", isSmall && "px-4 pb-2")}>
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className={cn("h-5 w-5 text-neutral-600", isSmall && "h-4 w-4")} />
        </button>
        <span className={cn("text-sm font-medium text-neutral-900", isSmall && "text-xs")}>
          {MONTHS_ID[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className={cn("h-5 w-5 text-neutral-600", isSmall && "h-4 w-4")} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className={cn("px-4 pb-2", isSmall && "px-3 pb-1")}>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((day, i) => (
            <div
              key={`header-${i}`}
              className={cn(
                "flex items-center justify-center text-xs font-medium text-neutral-500",
                isSmall ? "h-7" : "h-10"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Previous month days */}
        <div className="grid grid-cols-7">
          {prevMonthDays.map((day, i) => (
            <div
              key={`prev-${i}`}
              className={cn(
                "flex items-center justify-center text-neutral-300",
                isSmall ? "h-7 text-xs" : "h-10 text-sm"
              )}
            >
              {day}
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const date = new Date(viewYear, viewMonth, day);
            const isSelected =
              mode === "single"
                ? isSameDay(date, selectedDate)
                : isSameDay(date, rangeStart) || isSameDay(date, rangeEnd);
            const inRange =
              mode === "range" && isInRange(date, rangeStart, rangeEnd);
            const isRangeStart = mode === "range" && isSameDay(date, rangeStart);
            const isRangeEnd = mode === "range" && isSameDay(date, rangeEnd);

            return (
              <div
                key={`day-${day}`}
                className={cn(
                  "relative flex items-center justify-center",
                  isSmall ? "h-7" : "h-10",
                  inRange && "bg-primary-100",
                  isRangeStart && "rounded-l-full",
                  isRangeEnd && "rounded-r-full"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "rounded-full transition-colors",
                    isSmall ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm",
                    "hover:bg-neutral-100",
                    isSelected
                      ? "bg-primary-500 text-white hover:bg-primary-600 font-medium"
                      : "text-neutral-900"
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}

          {/* Next month days */}
          {nextMonthDays.map((day, i) => (
            <div
              key={`next-${i}`}
              className={cn(
                "flex items-center justify-center text-neutral-300",
                isSmall ? "h-7 text-xs" : "h-10 text-sm"
              )}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={cn("flex items-center justify-end gap-6 px-6 py-3 border-t border-neutral-100", isSmall && "px-4 py-2 gap-4")}>
        <button
          type="button"
          onClick={onCancel}
          className={cn("font-medium text-neutral-700 hover:text-neutral-900 transition-colors", isSmall ? "text-xs" : "text-sm")}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn("font-medium text-primary-700 hover:text-primary-900 transition-colors", isSmall ? "text-xs" : "text-sm")}
        >
          OK
        </button>
      </div>
    </div>
  );
}
