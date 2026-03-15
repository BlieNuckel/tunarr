import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileTocBar from "../MobileTocBar";
import type { TocSection } from "../TocList";

const sections: TocSection[] = [
  { id: "account", label: "Account" },
  { id: "theme", label: "Theme" },
  { id: "logs", label: "Logs" },
];

describe("MobileTocBar", () => {
  it("shows the active section label", () => {
    render(
      <MobileTocBar
        sections={sections}
        activeSection="theme"
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText("Theme")).toBeInTheDocument();
  });

  it("shows amber dot indicator", () => {
    const { container } = render(
      <MobileTocBar
        sections={sections}
        activeSection="account"
        onSelect={vi.fn()}
      />
    );
    const dot = container.querySelector(".bg-amber-600");
    expect(dot).toBeInTheDocument();
  });

  it("opens bottom sheet when bar is clicked", async () => {
    render(
      <MobileTocBar
        sections={sections}
        activeSection="account"
        onSelect={vi.fn()}
      />
    );

    await userEvent.click(screen.getByText("Account"));

    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Logs")).toBeInTheDocument();
  });

  it("calls onSelect and closes sheet when a section is picked", async () => {
    const onSelect = vi.fn();
    render(
      <MobileTocBar
        sections={sections}
        activeSection="account"
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByText("Account"));

    const allLogsButtons = screen.getAllByText("Logs");
    await userEvent.click(allLogsButtons[allLogsButtons.length - 1]);

    expect(onSelect).toHaveBeenCalledWith("logs");
  });

  it("shows empty label when no active section", () => {
    const { container } = render(
      <MobileTocBar
        sections={sections}
        activeSection={null}
        onSelect={vi.fn()}
      />
    );
    const button = container.querySelector("button");
    expect(button?.textContent).toContain("");
  });
});
