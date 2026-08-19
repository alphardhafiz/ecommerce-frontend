export type ApiErrorField = { field: string; message: string };

export type SessionData = {
  access_token: string;
  expires_in: number;
  user: { id: string; name: string; role: string };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly errors: ApiErrorField[];

  constructor(
    message: string,
    code: string,
    status: number,
    errors: ApiErrorField[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

// ponytail: default same-origin (diproxy next.config rewrites, lihat T1 Fase 2).
// NEXT_PUBLIC_API_URL hanya untuk jalur non-browser (scripts/smoke.ts).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

let getAccessToken: (() => string | null) | null = null;
let onTokenRefresh: ((token: string) => void) | null = null;
let onAuthExpired: (() => void) | null = null;

// ponytail: AuthContext (Fase 2) registers the memory access token here via setTokenGetter.
export function setTokenGetter(
  getter: (() => string | null) | null,
): void {
  getAccessToken = getter;
}

// AuthContext mendaftarkan callback agar api client bisa memberitahu saat
// access token diperbarui (silent refresh) atau sesi mati (refresh gagal).
export function setAuthCallbacks(callbacks: {
  onTokenRefresh?: (token: string) => void;
  onAuthExpired?: () => void;
}): void {
  onTokenRefresh = callbacks.onTokenRefresh ?? null;
  onAuthExpired = callbacks.onAuthExpired ?? null;
}

// ponytail: cookie csrf_token Path "/" (JS-readable dari halaman mana pun),
// server fiks Path di repo ecommerce-backend. Dibaca lalu dikirim ulang
// sebagai header X-CSRF-Token (double-submit, PRD §C.1). Non-browser (Node)
// tak punya document → header tak terkirim, dan tidak perlu.
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const CSRF_PATHS = ["/auth/refresh", "/auth/logout"];

async function toApiError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as Partial<{
      message: string;
      code: string;
      errors: ApiErrorField[];
    }>;
    return new ApiError(
      body.message ?? "Terjadi kesalahan.",
      body.code ?? "UNKNOWN_ERROR",
      res.status,
      body.errors ?? [],
    );
  } catch {
    return new ApiError("Terjadi kesalahan.", "UNKNOWN_ERROR", res.status);
  }
}

// Shared promise agar beberapa request paralel yang gagal 401 TOKEN_EXPIRED
// hanya memicu satu pemanggilan /auth/refresh (PRD §S.14). Dipakai juga oleh
// AuthContext saat hydrate — StrictMode double-mount (dev) tidak boleh
// memicu refresh 2x, karena server merotasi + reuse detection akan menolak
// request kedua dan mematikan sesi.
let refreshPromise: Promise<SessionData> | null = null;

export function refreshSession(): Promise<SessionData> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const headers = new Headers();
      headers.set("Accept", "application/json");
      const csrf = getCsrfToken();
      if (csrf) headers.set("X-CSRF-Token", csrf);

      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      if (!res.ok) throw await toApiError(res);

      const body = (await res.json()) as { data: SessionData };
      onTokenRefresh?.(body.data.access_token);
      return body.data;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  const token = getAccessToken?.();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const csrf = getCsrfToken();
  if (csrf && CSRF_PATHS.includes(path)) headers.set("X-CSRF-Token", csrf);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include", // refresh token cookie (PRD §C.1)
    });
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Coba lagi.",
      "NETWORK_ERROR",
      0,
    );
  }

  if (res.status === 401) {
    const err = await toApiError(res);
    if (err.code === "TOKEN_EXPIRED" && !retried) {
      try {
        await refreshSession();
      } catch {
        // Refresh gagal → sesi mati; serahkan ke AuthContext. Tetap lempar
        // error request asal, bukan error refresh.
        onAuthExpired?.();
        throw err;
      }
      // Retry sekali dengan access token baru (header Authorization di-refresh).
      return request<T>(path, init, true);
    }
    throw err;
  }

  if (!res.ok) {
    throw await toApiError(res);
  }

  // ponytail: unwrap `data`; `meta` (pagination) dibaca caller bila perlu nanti.
  return ((await res.json()) as { data: T }).data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
