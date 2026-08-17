import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the storefront headline", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1 }),
    ).toHaveTextContent("price tag fisik");
  });
});
