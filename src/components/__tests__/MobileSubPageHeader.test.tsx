import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MobileSubPageHeader from "../MobileSubPageHeader";

function renderHeader(props: {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle?: string;
}) {
  return render(
    <MemoryRouter>
      <MobileSubPageHeader {...props} />
    </MemoryRouter>
  );
}

describe("MobileSubPageHeader", () => {
  it("renders back link with correct href and label", () => {
    renderHeader({
      backTo: "/settings",
      backLabel: "Settings",
      title: "General",
    });
    const link = screen.getByRole("link", { name: /Settings/ });
    expect(link).toHaveAttribute("href", "/settings");
  });

  it("renders page title as heading", () => {
    renderHeader({
      backTo: "/settings",
      backLabel: "Settings",
      title: "General",
    });
    expect(
      screen.getByRole("heading", { name: "General" })
    ).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderHeader({
      backTo: "/settings",
      backLabel: "Settings",
      title: "General",
      subtitle: "Manage your preferences",
    });
    expect(screen.getByText("Manage your preferences")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    const { container } = renderHeader({
      backTo: "/settings",
      backLabel: "Settings",
      title: "General",
    });
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});
