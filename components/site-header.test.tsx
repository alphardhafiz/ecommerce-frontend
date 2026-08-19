import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SiteHeader } from "./site-header";
import { AuthProvider } from "@/contexts/auth";
import { setAuthCallbacks, setTokenGetter } from "@/lib/api";

const fetchMock = jest.fn();

function sessionResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        access_token: "t",
        expires_in: 900,
        user: { id: "1", name: "Budi", role: "user" },
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

function renderHeader() {
  return render(
    <AuthProvider>
      <SiteHeader />
    </AuthProvider>,
  );
}

describe("SiteHeader auth state", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("shows Masuk and Daftar links when anonymous", async () => {
    fetchMock.mockResolvedValueOnce(anonymousResponse() as Response);

    renderHeader();

    expect(await screen.findByRole("link", { name: "Daftar" })).toHaveAttribute(
      "href",
      "/register",
    );
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("button", { name: "Keluar" })).not.toBeInTheDocument();
  });

  it("shows user name and Keluar button when authenticated", async () => {
    fetchMock.mockResolvedValueOnce(sessionResponse() as Response);

    renderHeader();

    expect(await screen.findByText("Budi")).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("button", { name: "Keluar" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Daftar" })).not.toBeInTheDocument();
  });

  it("calls /auth/logout and returns to anonymous on Keluar", async () => {
    fetchMock.mockResolvedValueOnce(sessionResponse() as Response); // hydrate
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: null, meta: null }),
    } as Response); // logout

    renderHeader();
    await screen.findByText("Budi");

    fireEvent.click(screen.getByRole("button", { name: "Keluar" }));

    await waitFor(() =>
      expect(screen.queryByText("Budi")).not.toBeInTheDocument(),
    );
    expect(fetchMock.mock.calls[1][0]).toContain("/auth/logout");
    expect(await screen.findByRole("link", { name: "Daftar" })).toBeInTheDocument();
  });

  it("shows nothing in the auth slot while hydrating", () => {
    fetchMock.mockReturnValue(new Promise(() => {})); // tidak pernah resolve

    renderHeader();

    expect(screen.queryByRole("link", { name: "Masuk" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Daftar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Keluar" })).not.toBeInTheDocument();
    expect(screen.queryByText("Budi")).not.toBeInTheDocument();
  });
});