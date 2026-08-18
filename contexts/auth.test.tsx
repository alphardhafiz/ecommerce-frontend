import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import { setTokenGetter } from "@/lib/api";

const fetchMock = jest.fn();

function okResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data, meta: null }),
  };
}

function errorResponse(status: number, code: string) {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, code, message: "gagal", errors: [] }),
  };
}

function Probe() {
  const { user, status, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="user">{user ? user.name : "none"}</span>
      <button onClick={() => login("a@b.com", "Test1234")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function session() {
  return okResponse({
    access_token: "tok-123",
    expires_in: 900,
    user: { id: "1", name: "Budi", role: "user" },
  });
}

describe("AuthProvider", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setTokenGetter(null);
  });

  it("hydrates session via /auth/refresh when refresh token valid", async () => {
    fetchMock.mockResolvedValueOnce(session() as Response);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("authenticated"),
    );
    expect(screen.getByTestId("user")).toHaveTextContent("Budi");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      expect.anything(),
    );
  });

  it("stays anonymous when refresh token invalid (no crash)", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(401, "INVALID_REFRESH_TOKEN") as Response,
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous"),
    );
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("stays anonymous on network failure during hydrate", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous"),
    );
  });

  it("login stores user; logout clears session and calls /auth/logout", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(401, "INVALID_REFRESH_TOKEN") as Response); // hydrate
    fetchMock.mockResolvedValueOnce(session() as Response); // login
    fetchMock.mockResolvedValueOnce(okResponse(null) as Response); // logout

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("anonymous"),
    );

    fireEvent.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Budi"));
    expect(screen.getByTestId("status")).toHaveTextContent("authenticated");
    expect(fetchMock.mock.calls[1][0]).toContain("/auth/login");

    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("none"));
    expect(screen.getByTestId("status")).toHaveTextContent("anonymous");
    expect(fetchMock.mock.calls[2][0]).toContain("/auth/logout");
  });
});
