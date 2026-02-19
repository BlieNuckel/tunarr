import { render, screen } from "@testing-library/react";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders the status text", () => {
    render(<StatusBadge status="downloading" />);
    expect(screen.getByText("downloading")).toBeInTheDocument();
  });

  it("applies the correct color class for known statuses", () => {
    const { rerender } = render(<StatusBadge status="downloading" />);
    expect(screen.getByText("downloading")).toHaveClass("text-blue-400");

    rerender(<StatusBadge status="imported" />);
    expect(screen.getByText("imported")).toHaveClass("text-green-400");

    rerender(<StatusBadge status="failed" />);
    expect(screen.getByText("failed")).toHaveClass("text-red-400");
  });

  it("falls back to queued style for unknown status", () => {
    render(<StatusBadge status="something-unknown" />);
    expect(screen.getByText("something-unknown")).toHaveClass("text-gray-400");
  });
});
