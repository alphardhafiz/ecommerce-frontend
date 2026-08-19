import { api, setAuthCallbacks, setTokenGetter } from "./api";

const fetchMock = jest.fn();

function mockFetchOnce(response: Partial<Response>) {
  fetchMock.mockResolvedValueOnce(response as Response);
}

function errorResponse(status: number, code: string) {
  return {
    ok: false,
    status,
    json: async () => ({
      success: false,
      message: "Error",
      code,
      errors: [],
    }),
  };
}

function dataResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data, meta: null }),
  };
}

describe("api client", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("returns data from /health on success", async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { status: "ok" }, meta: null }),
    });

    await expect(api.get<{ status: string }>("/health")).resolves.toEqual({
      status: "ok",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.anything(),
    );
  });

  it("attaches Authorization header when access token is set", async () => {
    setTokenGetter(() => "secret-token");
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: null }),
    });

    await api.get("/health");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer secret-token",
    );
  });

  it("does not attach Authorization header when no token", async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: null }),
    });

    await api.get("/health");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBeNull();
  });

  it("parses error response per PRD §L format", async () => {
    mockFetchOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: [{ field: "email", message: "Email is not valid" }],
      }),
    });

    await expect(api.get("/health")).rejects.toMatchObject({
      name: "ApiError",
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      status: 400,
      errors: [{ field: "email", message: "Email is not valid" }],
    });
  });

  it("throws ApiError on network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(api.get("/health")).rejects.toMatchObject({
      name: "ApiError",
      code: "NETWORK_ERROR",
      status: 0,
    });
  });

  it("falls back to generic error when body is not valid JSON", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    await expect(api.get("/health")).rejects.toMatchObject({
      name: "ApiError",
      code: "UNKNOWN_ERROR",
      status: 500,
    });
  });

  describe("CSRF double-submit", () => {
    afterEach(() => {
      document.cookie = "csrf_token=; Max-Age=0";
    });

    it("sends X-CSRF-Token from csrf_token cookie on /auth/refresh", async () => {
      document.cookie = "csrf_token=csrf-abc";
      mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: null }),
      });

      await api.post("/auth/refresh");

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect((init.headers as Headers).get("X-CSRF-Token")).toBe("csrf-abc");
    });

    it("sends X-CSRF-Token on /auth/logout but not on other paths", async () => {
      document.cookie = "csrf_token=csrf-abc";

      mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: null }),
      });
      await api.post("/auth/logout");
      mockFetchOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: null }),
      });
      await api.get("/health");

      const [logoutPath, logoutInit] = fetchMock.mock.calls[0] as [
        string,
        RequestInit,
      ];
      const [healthPath, healthInit] = fetchMock.mock.calls[1] as [
        string,
        RequestInit,
      ];
      expect(logoutPath).toContain("/auth/logout");
      expect((logoutInit.headers as Headers).get("X-CSRF-Token")).toBe(
        "csrf-abc",
      );
      expect(healthPath).toContain("/health");
      expect((healthInit.headers as Headers).get("X-CSRF-Token")).toBeNull();
    });
  });

  describe("401 TOKEN_EXPIRED silent refresh", () => {
    function refreshOk(token: string) {
      return dataResponse({
        access_token: token,
        expires_in: 900,
        user: { id: "1", name: "B", role: "user" },
      });
    }

    it("silently refreshes token and retries once with new token", async () => {
      let currentToken: string | null = "old-token";
      setTokenGetter(() => currentToken);
      const onTokenRefresh = jest.fn((token: string) => {
        currentToken = token;
      });
      setAuthCallbacks({ onTokenRefresh });

      mockFetchOnce(errorResponse(401, "TOKEN_EXPIRED")); // /products
      mockFetchOnce(refreshOk("new-token")); // /auth/refresh
      mockFetchOnce(dataResponse({ id: 1 })); // /products retry

      await expect(api.get<{ id: number }>("/products")).resolves.toEqual({
        id: 1,
      });

      const paths = fetchMock.mock.calls.map(([url]) => url as string);
      expect(paths[0]).toContain("/products");
      expect(paths[1]).toContain("/auth/refresh");
      expect(paths[2]).toContain("/products");
      expect(onTokenRefresh).toHaveBeenCalledWith("new-token");

      const retryInit = fetchMock.mock.calls[2][1] as RequestInit;
      expect((retryInit.headers as Headers).get("Authorization")).toBe(
        "Bearer new-token",
      );
    });

    it("calls onAuthExpired and throws original error when refresh fails", async () => {
      setTokenGetter(() => "old-token");
      const onAuthExpired = jest.fn();
      setAuthCallbacks({ onAuthExpired });

      mockFetchOnce(errorResponse(401, "TOKEN_EXPIRED")); // /products
      mockFetchOnce(errorResponse(401, "INVALID_REFRESH_TOKEN")); // refresh gagal

      await expect(api.get("/products")).rejects.toMatchObject({
        code: "TOKEN_EXPIRED",
        status: 401,
      });

      expect(onAuthExpired).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(2); // produk + refresh, tanpa retry
    });

    it("refreshes only once for parallel 401 TOKEN_EXPIRED requests", async () => {
      setTokenGetter(() => "old-token");
      setAuthCallbacks({});

      mockFetchOnce(errorResponse(401, "TOKEN_EXPIRED")); // /products
      mockFetchOnce(errorResponse(401, "TOKEN_EXPIRED")); // /cart
      mockFetchOnce(refreshOk("new-token"));
      mockFetchOnce(dataResponse({ id: 1 }));
      mockFetchOnce(dataResponse({ id: 2 }));

      await expect(
        Promise.all([api.get("/products"), api.get("/cart")]),
      ).resolves.toBeDefined();

      const refreshCalls = fetchMock.mock.calls.filter(([url]) =>
        (url as string).includes("/auth/refresh"),
      );
      expect(refreshCalls).toHaveLength(1);
    });

    it("does not refresh for non-TOKEN_EXPIRED 401", async () => {
      setTokenGetter(() => "old-token");
      setAuthCallbacks({});

      mockFetchOnce(errorResponse(401, "INVALID_CREDENTIALS"));

      await expect(api.get("/orders")).rejects.toMatchObject({
        code: "INVALID_CREDENTIALS",
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
