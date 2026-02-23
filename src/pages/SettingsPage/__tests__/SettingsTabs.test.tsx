import { render, screen, fireEvent } from "@testing-library/react";
import SettingsTabs from "../components/SettingsTabs";

describe("SettingsTabs", () => {
  it("renders both tabs", () => {
    render(<SettingsTabs activeTab="general" onTabChange={vi.fn()} />);
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Integrations")).toBeInTheDocument();
  });

  it("marks active tab with aria-selected", () => {
    render(<SettingsTabs activeTab="general" onTabChange={vi.fn()} />);
    expect(screen.getByText("General")).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Integrations")).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onTabChange when tab is clicked", () => {
    const onTabChange = vi.fn();
    render(<SettingsTabs activeTab="general" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Integrations"));
    expect(onTabChange).toHaveBeenCalledWith("integrations");
  });

  it("renders tablist role", () => {
    render(<SettingsTabs activeTab="general" onTabChange={vi.fn()} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});
