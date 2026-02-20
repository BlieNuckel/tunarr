import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../Sidebar";

function renderSidebar(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe("Sidebar", () => {
  it("renders the logo and app name", () => {
    renderSidebar();
    expect(screen.getByText("Tunearr")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: /Discover/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Search/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Status/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/ })).toBeInTheDocument();
  });

  it("highlights Discover link on home page", () => {
    renderSidebar("/");
    const discoverLink = screen.getByRole("link", { name: /Discover/ });
    expect(discoverLink).toHaveClass("bg-amber-300");
  });

  it("highlights Search link on search page", () => {
    renderSidebar("/search");
    const searchLink = screen.getByRole("link", { name: /Search/ });
    expect(searchLink).toHaveClass("bg-amber-300");
  });

  it("highlights Status link on status page", () => {
    renderSidebar("/status");
    const statusLink = screen.getByRole("link", { name: /Status/ });
    expect(statusLink).toHaveClass("bg-amber-300");
  });

  it("highlights Settings link on settings page", () => {
    renderSidebar("/settings");
    const settingsLink = screen.getByRole("link", { name: /Settings/ });
    expect(settingsLink).toHaveClass("bg-amber-300");
  });

  it("applies hover styles to non-active links", () => {
    renderSidebar("/");
    const searchLink = screen.getByRole("link", { name: /Search/ });
    expect(searchLink).toHaveClass("hover:bg-amber-50");
    expect(searchLink).not.toHaveClass("bg-amber-300");
  });
});
