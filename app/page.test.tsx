import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the starter heading", () => {
    render(<Home />);
    expect(screen.getByText(/To get started, edit the/)).toBeInTheDocument();
  });
});
