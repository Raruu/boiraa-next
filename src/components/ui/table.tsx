"use client";

import { cn } from "@/lib/utils";

/* ===== Table ===== */

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-neutral-200 bg-white", className)}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

/* ===== Table Head ===== */

export function TableHead({ children, className }: TableProps) {
  return (
    <thead className={cn("border-b border-neutral-200 bg-neutral-50", className)}>
      {children}
    </thead>
  );
}

/* ===== Table Body ===== */

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn("divide-y divide-neutral-200", className)}>{children}</tbody>;
}

/* ===== Table Row ===== */

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn("transition-colors hover:bg-neutral-50", className)}>
      {children}
    </tr>
  );
}

/* ===== Table Header Cell ===== */

interface TableHeadCellProps {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function TableHeadCell({ children, className, align = "left" }: TableHeadCellProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-xs font-semibold text-neutral-600 uppercase tracking-wider",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

/* ===== Table Cell ===== */

interface TableCellProps {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function TableCell({ children, className, align = "left" }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-4 text-sm text-neutral-700",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

/* ===== Pagination ===== */

interface PaginationProps {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 25, 50],
  className,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (lastPage <= 5) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, "...", lastPage);
      } else if (page >= lastPage - 2) {
        pages.push(1, "...", lastPage - 2, lastPage - 1, lastPage);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", lastPage);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-neutral-200 px-4 py-5",
        className
      )}
    >
      {/* Left: Items per page */}
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <span>Item per page</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange?.(Number(e.target.value))}
          className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>of {total}</span>
      </div>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-2">
        {/* Previous arrow */}
        <button
          type="button"
          onClick={() => onPageChange?.(page - 1)}
          disabled={page <= 1}
          className="text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          ←
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-neutral-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange?.(p)}
              className={cn(
                "min-w-[28px] h-7 flex items-center justify-center rounded text-sm font-medium transition-colors",
                p === page
                  ? "text-primary-500"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next arrow */}
        <button
          type="button"
          onClick={() => onPageChange?.(page + 1)}
          disabled={page >= lastPage}
          className="text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
}
