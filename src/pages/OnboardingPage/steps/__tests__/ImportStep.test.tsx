import { render, screen, fireEvent } from "@testing-library/react";
import ImportStep from "../ImportStep";

describe("ImportStep", () => {
  it("renders description", () => {
    render(<ImportStep importPath="" onImportPathChange={vi.fn()} />);
    expect(
      screen.getByText(/Set a shared import directory/)
    ).toBeInTheDocument();
  });

  it("renders import path input", () => {
    render(<ImportStep importPath="" onImportPathChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("/imports")).toBeInTheDocument();
  });

  it("calls onImportPathChange on input change", () => {
    const onImportPathChange = vi.fn();
    render(
      <ImportStep importPath="" onImportPathChange={onImportPathChange} />
    );
    fireEvent.change(screen.getByPlaceholderText("/imports"), {
      target: { value: "/data/imports" },
    });
    expect(onImportPathChange).toHaveBeenCalledWith("/data/imports");
  });

  it("shows docker compose example", () => {
    render(<ImportStep importPath="" onImportPathChange={vi.fn()} />);
    expect(screen.getByText(/Docker Compose example/)).toBeInTheDocument();
  });
});
