import { fireEvent, render, screen } from "@testing-library/react";
import { ForgotForm } from "./forgot-form";
import { setAuthCallbacks, setTokenGetter } from "@/lib/api";

const fetchMock = jest.fn();

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
    json: async () => ({
      success: true,
      data: { message: "If the email is registered, a reset link has been sent" },
      meta: null,
    }),
  };
}

function renderForgot() {
  return render(<ForgotForm />);
}

describe("ForgotForm", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setTokenGetter(null);
    setAuthCallbacks({});
  });

  it("shows validation error on empty submit", async () => {
    renderForgot();
    fireEvent.click(screen.getByRole("button", { name: "Kirim tautan reset" }));

    expect(await screen.findByText("Email wajib diisi")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows generic success message on 200 (registered or not)", async () => {
    fetchMock.mockResolvedValueOnce(okResponse() as Response);

    renderForgot();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim tautan reset" }));

    expect(
      await screen.findByText(/jika email terdaftar/i),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/forgot-password");
    // Form tidak tampil lagi setelah sukses
    expect(
      screen.queryByRole("button", { name: "Kirim tautan reset" }),
    ).not.toBeInTheDocument();
  });

  it("shows backend field error inline (VALIDATION_ERROR)", async () => {
    fetchMock.mockResolvedValueOnce(
      errResponse(400, "VALIDATION_ERROR", "Validation failed", [
        { field: "email", message: "Email is not valid" },
      ]) as Response,
    );

    renderForgot();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim tautan reset" }));

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
  });

  it("shows network error without revealing account status", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

    renderForgot();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim tautan reset" }));

    expect(
      await screen.findByText(/tidak dapat terhubung/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/jika email terdaftar/i),
    ).not.toBeInTheDocument();
  });
});