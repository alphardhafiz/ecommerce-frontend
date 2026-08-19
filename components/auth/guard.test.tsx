import { render, screen, waitFor } from "@testing-library/react";
import { RequireAdmin, RequireAuth } from "./guard";
import { AuthProvider } from "@/contexts/auth";
import { setAuthCallbacks, setTokenGetter } from "@/lib/api";

const fetchMock = jest.fn();
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function sessionResponse(role: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        access_token: "t",
        expires_in: 900,
        user: { id: "1", name: "Budi", role },
      },
      meta: null,
    }),
  };
}

function anonymousResponse() {
  return {
    ok: false,
    status: 401,
    json: async () => ({
      success: false,
      code: "INVALID_REFRESH_TOKEN",
      message: "gagal",
      errors: [],
    }),
  };
}

function renderGuarded(node: React.ReactNode) {
  return render(<AuthProvider>{node}</AuthProvider>);
}

describe("RequireAuth", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    replaceMock.mockClear();
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("redirects to /login when anonymous and hides children", async () => {
    fetchMock.mockResolvedValueOnce(anonymousResponse() as Response);

    renderGuarded(
      <RequireAuth>
        <div>rahasia</div>
      </RequireAuth>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("rahasia")).not.toBeInTheDocument();
  });

  it("shows children when authenticated without redirect", async () => {
    fetchMock.mockResolvedValueOnce(sessionResponse("user") as Response);

    renderGuarded(
      <RequireAuth>
        <div>rahasia</div>
      </RequireAuth>,
    );

    expect(await screen.findByText("rahasia")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

describe("RequireAdmin", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    replaceMock.mockClear();
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("redirects to /login when anonymous", async () => {
    fetchMock.mockResolvedValueOnce(anonymousResponse() as Response);

    renderGuarded(
      <RequireAdmin>
        <div>admin</div>
      </RequireAdmin>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("admin")).not.toBeInTheDocument();
  });

  it("redirects non-admin user to home and hides children", async () => {
    fetchMock.mockResolvedValueOnce(sessionResponse("user") as Response);

    renderGuarded(
      <RequireAdmin>
        <div>admin</div>
      </RequireAdmin>,
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("admin")).not.toBeInTheDocument();
  });

  it("shows children for admin user without redirect", async () => {
    fetchMock.mockResolvedValueOnce(sessionResponse("admin") as Response);

    renderGuarded(
      <RequireAdmin>
        <div>admin</div>
      </RequireAdmin>,
    );

    expect(await screen.findByText("admin")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

// Test loading diletakkan terakhir: fetch yang tak pernah settle mewarisi
// refreshPromise module-level; diletakkan di akhir agar tidak mengotori test lain.
describe("RequireAuth loading", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    replaceMock.mockClear();
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("does not redirect while still loading and hides children", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    renderGuarded(
      <RequireAuth>
        <div>rahasia</div>
      </RequireAuth>,
    );

    expect(screen.queryByText("rahasia")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});