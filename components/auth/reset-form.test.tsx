import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ResetForm } from "./reset-form";
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
    status: 200,
    json: async () => ({ success: true, data: {}, meta: null }),
  };
}

function renderReset(token?: string) {
  return render(
    <ToastProvider>
      <ResetForm token={token} />
    </ToastProvider>,
  );
}

function fillValid(overrides: Record<string, string> = {}) {
  const values = { password: "Test1234", confirm_password: "Test1234", ...overrides };
  fireEvent.change(screen.getByLabelText("Password Baru"), {
    target: { value: values.password },
  });
  fireEvent.change(screen.getByLabelText("Konfirmasi Password"), {
    target: { value: values.confirm_password },
  });
}

describe("ResetForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    replaceMock.mockClear();
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("shows invalid link message when token is missing", () => {
    renderReset(undefined);
    expect(
      screen.getByText(/tautan reset password tidak valid/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "lupa password" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows validation errors on empty submit", async () => {
    renderReset("tok");
    fireEvent.click(screen.getByRole("button", { name: "Ubah password" }));

    expect(
      await screen.findByText(
        "Password minimal 8 karakter dengan huruf dan angka",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Konfirmasi password wajib diisi"),
    ).toBeInTheDocument();
  });

  it("rejects weak password and mismatched confirmation", async () => {
    renderReset("tok");
    fillValid({ password: "abcdefgh", confirm_password: "abcdefgh" });
    fireEvent.click(screen.getByRole("button", { name: "Ubah password" }));

    expect(
      await screen.findByText(
        "Password minimal 8 karakter dengan huruf dan angka",
      ),
    ).toBeInTheDocument();

    fillValid({ password: "Test1234", confirm_password: "Test9999" });
    fireEvent.click(screen.getByRole("button", { name: "Ubah password" }));

    expect(
      await screen.findByText("Konfirmasi password tidak cocok"),
    ).toBeInTheDocument();
  });

  it("shows invalid token panel on INVALID_RESET_TOKEN", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(400, "INVALID_RESET_TOKEN", "Invalid or expired reset token") as Response,
    );

    renderReset("bad-token");
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Ubah password" }));

    expect(
      await screen.findByText(/tautan reset password tidak valid/i),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/reset-password");
  });

  it("shows backend field errors inline (VALIDATION_ERROR)", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(400, "VALIDATION_ERROR", "Validation failed", [
        { field: "password", message: "Password must be at least 8 characters with letters and numbers" },
      ]) as Response,
    );

    renderReset("tok");
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Ubah password" }));

    expect(
      await screen.findByText(
        "Password must be at least 8 characters with letters and numbers",
      ),
    ).toBeInTheDocument();
  });

  it("redirects to login on success and shows toast", async () => {
    fetchMock.mockResolvedValueOnce(okResponse() as Response);

    renderReset("tok");
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Ubah password" }));

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
    expect(
      screen.getByText("Password berhasil diubah. Silakan masuk."),
    ).toBeInTheDocument();
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body).toMatchObject({
      token: "tok",
      password: "Test1234",
      confirm_password: "Test1234",
    });
  });
});