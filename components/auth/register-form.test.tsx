import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RegisterForm } from "./register-form";
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

function okResponse() {
  return {
    ok: true,
    status: 201,
    json: async () => ({
      success: true,
      data: { id: "1", name: "Budi", email: "a@b.com", role: "user" },
      meta: null,
    }),
  };
}

function renderRegister() {
  return render(
    <ToastProvider>
      <RegisterForm />
    </ToastProvider>,
  );
}

function fillValid(overrides: Record<string, string> = {}) {
  const values = {
    name: "Budi",
    email: "a@b.com",
    password: "Test1234",
    confirm_password: "Test1234",
    ...overrides,
  };
  fireEvent.change(screen.getByLabelText("Nama"), {
    target: { value: values.name },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: values.email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: values.password },
  });
  fireEvent.change(screen.getByLabelText("Konfirmasi Password"), {
    target: { value: values.confirm_password },
  });
}

describe("RegisterForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    replaceMock.mockClear();
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("shows inline validation errors on empty submit", async () => {
    renderRegister();
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(
      screen.getByText("Password minimal 8 karakter dengan huruf dan angka"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Konfirmasi password wajib diisi"),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        (url as string).includes("/auth/register"),
      ),
    ).toHaveLength(0);
  });

  it("rejects weak password and mismatched confirmation", async () => {
    renderRegister();
    fillValid({ password: "abcdefgh", confirm_password: "abcdefgh" }); // tanpa angka
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));

    expect(
      await screen.findByText(
        "Password minimal 8 karakter dengan huruf dan angka",
      ),
    ).toBeInTheDocument();

    fillValid({ password: "Test1234", confirm_password: "Test9999" });
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));

    expect(
      await screen.findByText("Konfirmasi password tidak cocok"),
    ).toBeInTheDocument();
  });

  it("shows EMAIL_ALREADY_EXISTS as general error", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(
        409,
        "EMAIL_ALREADY_EXISTS",
        "Email sudah terdaftar. Silakan masuk.",
      ) as Response,
    );

    renderRegister();
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));

    expect(
      await screen.findByText("Email sudah terdaftar. Silakan masuk."),
    ).toBeInTheDocument();
  });

  it("shows backend field errors inline", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(400, "VALIDATION_ERROR", "Validation failed", [
        { field: "email", message: "Email is not valid" },
      ]) as Response,
    );

    renderRegister();
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
  });

  it("redirects to login on success and shows toast", async () => {
    fetchMock.mockResolvedValueOnce(okResponse() as Response);

    renderRegister();
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Daftar" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(
      screen.getByText("Akun berhasil dibuat. Silakan masuk."),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/register");
  });
});
