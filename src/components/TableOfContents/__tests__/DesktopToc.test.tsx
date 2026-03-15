import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DesktopToc from "../DesktopToc";
import type { TocSection } from "../TocList";

const sections: TocSection[] = [
  { id: "general", label: "General" },
  { id: "integrations", label: "Integrations" },
];

describe("DesktopToc", () => {
  it("renders TocList with sections", () => {
    render(
      <DesktopToc
        sections={sections}
        activeSection="general"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Integrations")).toBeInTheDocument();
  });

  it("passes activeSection to TocList", () => {
    render(
      <DesktopToc
        sections={sections}
        activeSection="integrations"
        onSelect={vi.fn()}
      />
    );
    const activeButton = screen.getByText("Integrations");
    expect(activeButton.className).toContain("font-bold");
  });

  it("calls onSelect when a section is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <DesktopToc
        sections={sections}
        activeSection={null}
        onSelect={onSelect}
      />
    );
    await userEvent.click(screen.getByText("Integrations"));
    expect(onSelect).toHaveBeenCalledWith("integrations");
  });

  it("is hidden on mobile (has hidden md:block classes)", () => {
    const { container } = render(
      <DesktopToc sections={sections} activeSection={null} onSelect={vi.fn()} />
    );
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("hidden");
    expect(aside?.className).toContain("md:block");
  });
});
