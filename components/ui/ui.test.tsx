import { fireEvent, render, screen } from "@testing-library/react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Input } from "./input";
import { EmptyState, ErrorState, Skeleton } from "./states";
import { ToastProvider, useToast } from "./toast";

describe("UI primitives", () => {
  it("renders primary and secondary buttons", () => {
    render(
      <>
        <Button>Simpan</Button>
        <Button variant="secondary">Batal</Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "Simpan" })).toHaveClass("bg-stamp");
    expect(screen.getByRole("button", { name: "Batal" })).toHaveClass(
      "border-ink",
    );
  });

  it("renders input with underline style and label", () => {
    render(<Input aria-label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("border-b");
  });

  it("renders rotated stamp badge", () => {
    render(<Badge>Paid</Badge>);
    expect(screen.getByText("Paid")).toHaveClass("-rotate-6");
  });

  it("renders card surface", () => {
    const { container } = render(<Card>isi</Card>);
    expect(container.firstChild).toHaveClass("bg-paper-raised");
  });

  it("renders skeleton", () => {
    const { container } = render(<Skeleton className="h-10" />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("renders empty state with action", () => {
    render(
      <EmptyState
        title="Wishlist kosong"
        description="Belum ada barang di wishlist."
        actionLabel="Mulai jelajahi"
        onAction={jest.fn()}
      />,
    );
    expect(screen.getByText("Wishlist kosong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai jelajahi" })).toBeInTheDocument();
  });

  it("renders error state with retry", () => {
    render(<ErrorState message="Gagal memuat" onRetry={jest.fn()} />);
    expect(screen.getByText("Gagal memuat")).toHaveClass("text-error");
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
  });
});

describe("Toast", () => {
  function Trigger({ label, tone }: { label: string; tone: "success" | "error" }) {
    const toast = useToast();
    return (
      <Button onClick={() => (tone === "success" ? toast.success(label) : toast.error(label))}>
        trigger-{label}
      </Button>
    );
  }

  it("shows a toast when triggered", () => {
    render(
      <ToastProvider>
        <Trigger label="Tersimpan" tone="success" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "trigger-Tersimpan" }));
    expect(screen.getByText("Tersimpan")).toBeInTheDocument();
  });
});
