import { render, screen, fireEvent } from "@testing-library/react";
import WelcomeStep from "../WelcomeStep";

describe("WelcomeStep", () => {
  it("renders welcome message", () => {
    render(<WelcomeStep onGetStarted={vi.fn()} />);
    expect(screen.getByText("Welcome to Tunearr")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<WelcomeStep onGetStarted={vi.fn()} />);
    expect(
      screen.getByText(/helps you discover and add music/)
    ).toBeInTheDocument();
  });

  it("calls onGetStarted when button clicked", () => {
    const onGetStarted = vi.fn();
    render(<WelcomeStep onGetStarted={onGetStarted} />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(onGetStarted).toHaveBeenCalled();
  });
});
