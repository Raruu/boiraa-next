"use client";

import { toast } from "sonner";
import type { ApiValidationError } from "@/types/api";

/**
 * Show an API failure as toast(s).
 *
 * Validation errors (422) arrive as a list — each message gets its own toast
 * so the user sees every offending field. Anything else falls back to the
 * response `message`, then to `defaultMessage`.
 */
export function handleApiError(err: unknown, defaultMessage: string) {
  const error = err as { data?: ApiValidationError | { message?: string } };
  const data = error.data;

  if (
    data &&
    "errors" in data &&
    Array.isArray((data as ApiValidationError).errors) &&
    (data as ApiValidationError).errors.length > 0
  ) {
    (data as ApiValidationError).errors.forEach((errDetail) => {
      toast.error(errDetail.message);
    });
    return;
  }

  const message = (data as { message?: string })?.message || defaultMessage;
  toast.error(message);
}
