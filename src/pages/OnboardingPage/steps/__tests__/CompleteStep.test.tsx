import { render, screen, fireEvent } from "@testing-library/react";
import CompleteStep from "../CompleteStep";

describe("CompleteStep", () => {
  it("renders completion message", () => {
    render(<CompleteStep saving={false} onFinish={vi.fn()} />);
    expect(screen.getByText("You're all set!")).toBeInTheDocument();
  });

  it("renders Go to App button", () => {
    render(<CompleteStep saving={false} onFinish={vi.fn()} />);
    expect(screen.getByText("Go to App")).toBeInTheDocument();
  });

  it("shows Saving... when saving", () => {
    render(<CompleteStep saving={true} onFinish={vi.fn()} />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("disables button when saving", () => {
    render(<CompleteStep saving={true} onFinish={vi.fn()} />);
    expect(screen.getByText("Saving...")).toBeDisabled();
  });

  it("calls onFinish when button clicked", () => {
    const onFinish = vi.fn();
    render(<CompleteStep saving={false} onFinish={onFinish} />);
    fireEvent.click(screen.getByText("Go to App"));
    expect(onFinish).toHaveBeenCalled();
  });
});
