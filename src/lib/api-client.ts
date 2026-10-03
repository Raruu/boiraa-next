"use client";

/**
 * Typed fetch wrapper for client components.
 *
 * - Prefixes relative URLs, builds query strings from `params` (page, limit,
 *   sort, search, filter — matching parseQueryParams on the server).
 * - On 401 it refreshes the token pair once and retries; if the refresh fails
 *   the user is redirected to /login.
 * - Throws an Error carrying `status` and `data` so callers can surface
 *   validation messages.
 *
 * Always use this instead of raw `fetch` in client code.
 */

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
};

function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "search" && typeof value === "object") {
      const { fields, value: searchVal } = value as {
        fields: string;
        value: string;
      };
      if (searchVal)
        parts.push(`search[${fields}]=${encodeURIComponent(searchVal)}`);
    } else if (key === "filter" && typeof value === "object") {
      Object.entries(value as Record<string, Record<string, unknown>>).forEach(
        ([field, ops]) => {
          Object.entries(ops).forEach(([op, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              parts.push(`${field}[${op}]=${encodeURIComponent(String(val))}`);
            }
          });
        },
      );
    } else {
      parts.push(`${key}=${encodeURIComponent(String(value))}`);
    }
  });
  return parts.join("&");
}

// Track refresh state to avoid multiple concurrent refresh calls
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, params } = options;

  let fullUrl = url.startsWith("/") ? url : `/${url}`;
  if (params) {
    const qs = buildQueryString(params);
    if (qs) fullUrl += `?${qs}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body && method !== "GET" ? { body: JSON.stringify(body) } : {}),
  };

  let response = await fetch(fullUrl, fetchOptions);

  // Interceptor: on 401, try refresh then retry once
  if (response.status === 401 && !fullUrl.includes("/api/auth/refresh")) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      response = await fetch(fullUrl, fetchOptions);
    } else {
      // Refresh failed — redirect to login (unless already there).
      // This module runs outside the React tree (plain fetch wrapper), so
      // useRouter is not available; a hard navigation is the correct reset here.
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        const redirectTo = window.location.pathname;
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `Request failed with status ${response.status}`,
    ) as Error & { status: number; data: unknown };
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const api = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>) =>
    request<T>(url, { method: "GET", params }),

  post: <T = unknown>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body }),

  put: <T = unknown>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body }),

  patch: <T = unknown>(url: string, body?: unknown) =>
    request<T>(url, { method: "PATCH", body }),

  delete: <T = unknown>(url: string) => request<T>(url, { method: "DELETE" }),

  /** Multipart upload — no Content-Type header so the browser sets the boundary. */
  upload: <T = unknown>(
    url: string,
    formData: FormData,
    method: "POST" | "PUT" = "POST",
  ) =>
    fetch(url, { method, body: formData }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const error = new Error(
          errorData.message || `Upload failed with status ${res.status}`,
        ) as Error & { status: number; data: unknown };
        error.status = res.status;
        error.data = errorData;
        throw error;
      }
      return res.json() as Promise<T>;
    }),
};
