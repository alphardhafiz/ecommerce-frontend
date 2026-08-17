import { api, setTokenGetter } from "./api";

const fetchMock = jest.fn();

function mockFetchOnce(response: Partial<Response>) {
  fetchMock.mockResolvedValueOnce(response as Response);
}

describe("api client", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setTokenGetter(null);
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
});
