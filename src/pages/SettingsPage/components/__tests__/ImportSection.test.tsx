import { render, screen, fireEvent } from "@testing-library/react";
import ImportSection from "../ImportSection";

describe("ImportSection", () => {
  it("renders heading", () => {
    render(<ImportSection importPath="" onImportPathChange={vi.fn()} />);
    expect(screen.getByText("Manual Import")).toBeInTheDocument();
  });

  it("renders input with value", () => {
    render(
      <ImportSection importPath="/imports" onImportPathChange={vi.fn()} />
    );
    expect(screen.getByDisplayValue("/imports")).toBeInTheDocument();
  });

  it("calls onImportPathChange on input change", () => {
    const onChange = vi.fn();
    render(<ImportSection importPath="" onImportPathChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText("/imports"), {
      target: { value: "/data" },
    });
    expect(onChange).toHaveBeenCalledWith("/data");
  });

  it("renders help text", () => {
    render(<ImportSection importPath="" onImportPathChange={vi.fn()} />);
    expect(
      screen.getByText(/Shared volume path accessible/)
    ).toBeInTheDocument();
  });
});
