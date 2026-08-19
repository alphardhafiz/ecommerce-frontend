import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LoginForm } from "./login-form";
import { AuthProvider } from "@/contexts/auth";
import { ToastProvider } from "@/components/ui/toast";
import { setAuthCallbacks, setTokenGetter } from "@/lib/api";

const fetchMock = jest.fn();
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function errResponse(
  status: number,
  code: string,
  message: string,
  errors: { field: string; message: string }[] = [],
) {
  return {
    ok: false,
    status,
    json: async () => ({ success: false, message, code, errors }),
  };
}

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

function renderLogin() {
  return render(
    <ToastProvider>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </ToastProvider>,
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    replaceMock.mockClear();
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("shows inline validation errors on empty submit", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(401, "INVALID_REFRESH_TOKEN", "gagal") as Response,
    ); // hydrate

    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Password wajib diisi")).toBeInTheDocument();
    // Tidak ada panggilan login
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        (url as string).includes("/auth/login"),
      ),
    ).toHaveLength(0);
  });

  it("shows backend general error (INVALID_CREDENTIALS)", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(401, "INVALID_REFRESH_TOKEN", "gagal") as Response,
    ); // hydrate
    fetchMock.mockResolvedValueOnce(
      errResponse(401, "INVALID_CREDENTIALS", "Invalid email or password") as Response,
    ); // login

    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });

  it("shows backend field errors inline (VALIDATION_ERROR)", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(401, "INVALID_REFRESH_TOKEN", "gagal") as Response,
    ); // hydrate
    fetchMock.mockResolvedValueOnce(
      errResponse(400, "VALIDATION_ERROR", "Validation failed", [
        { field: "email", message: "Email is not valid" },
      ]) as Response,
    ); // login

    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Test1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
  });

  it("redirects to home on success and shows toast", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(401, "INVALID_REFRESH_TOKEN", "gagal") as Response,
    ); // hydrate
    fetchMock.mockResolvedValueOnce(sessionResponse() as Response); // login

    renderLogin();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Test1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/"));
    expect(screen.getByText("Berhasil masuk.")).toBeInTheDocument();
  });
});
