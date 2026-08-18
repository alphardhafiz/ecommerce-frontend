export type ApiErrorField = { field: string; message: string };

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

// ponytail: AuthContext (Fase 2) registers the memory access token here via setTokenGetter.
export function setTokenGetter(
  getter: (() => string | null) | null,
): void {
  getAccessToken = getter;
}

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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  const token = getAccessToken?.();
  if (token) headers.set("Authorization", `Bearer ${token}`);

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
