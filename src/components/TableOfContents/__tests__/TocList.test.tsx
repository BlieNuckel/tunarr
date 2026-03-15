import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TocList from "../TocList";
import type { TocSection } from "../TocList";

const sections: TocSection[] = [
  { id: "account", label: "Account" },
  { id: "theme", label: "Theme" },
  { id: "integrations", label: "Integrations" },
];

describe("TocList", () => {
  it("renders all section labels", () => {
    render(
      <TocList sections={sections} activeSection={null} onSelect={vi.fn()} />
    );
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Integrations")).toBeInTheDocument();
  });

  it("highlights the active section with amber dot and bold text", () => {
    render(
      <TocList sections={sections} activeSection="theme" onSelect={vi.fn()} />
    );
    const activeButton = screen.getByText("Theme").closest("button")!;
    expect(activeButton.className).toContain("font-bold");
    expect(activeButton.className).toContain("text-amber-600");
    expect(activeButton.querySelector(".bg-amber-600")).toBeInTheDocument();
  });

  it("does not highlight inactive sections", () => {
    render(
      <TocList sections={sections} activeSection="theme" onSelect={vi.fn()} />
    );
    const inactiveButton = screen.getByText("Account").closest("button")!;
    expect(inactiveButton.className).not.toContain("font-bold");
    expect(inactiveButton.className).not.toContain("text-amber-600");
    expect(inactiveButton.querySelector(".bg-amber-600")).toBeNull();
  });

  it("calls onSelect with section id when clicked", async () => {
    const onSelect = vi.fn();
    render(
      <TocList sections={sections} activeSection={null} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByText("Integrations"));
    expect(onSelect).toHaveBeenCalledWith("integrations");
  });

  it("renders a nav element with accessible label", () => {
    render(
      <TocList sections={sections} activeSection={null} onSelect={vi.fn()} />
    );
    expect(screen.getByLabelText("Table of contents")).toBeInTheDocument();
  });

  it("renders empty list when no sections provided", () => {
    render(<TocList sections={[]} activeSection={null} onSelect={vi.fn()} />);
    const nav = screen.getByLabelText("Table of contents");
    expect(nav.querySelectorAll("li")).toHaveLength(0);
  });
});
