import { render, screen, fireEvent } from "@testing-library/react";
import WizardShell from "../WizardShell";

const defaultProps = {
  stepIndex: 1,
  currentStep: "lidarrConnection" as const,
  isOptional: false,
  onBack: vi.fn(),
  onNext: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WizardShell", () => {
  it("renders step count and label", () => {
    render(
      <WizardShell {...defaultProps}>
        <div>Step Content</div>
      </WizardShell>
    );
    expect(screen.getByText(/Step 2 of 7/)).toBeInTheDocument();
    expect(screen.getByText("Lidarr Connection")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <WizardShell {...defaultProps}>
        <div>Step Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Step Content")).toBeInTheDocument();
  });

  it("shows Optional label when step is optional", () => {
    render(
      <WizardShell {...defaultProps} isOptional={true}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText(/\(Optional\)/)).toBeInTheDocument();
  });

  it("does not show Optional label when not optional", () => {
    render(
      <WizardShell {...defaultProps}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.queryByText(/\(Optional\)/)).not.toBeInTheDocument();
  });

  it("renders Back and Next buttons", () => {
    render(
      <WizardShell {...defaultProps}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("calls onBack when Back clicked", () => {
    render(
      <WizardShell {...defaultProps}>
        <div>Content</div>
      </WizardShell>
    );
    fireEvent.click(screen.getByText("Back"));
    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("calls onNext when Next clicked", () => {
    render(
      <WizardShell {...defaultProps}>
        <div>Content</div>
      </WizardShell>
    );
    fireEvent.click(screen.getByText("Next"));
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it("disables Back on first step", () => {
    render(
      <WizardShell {...defaultProps} stepIndex={0} currentStep="welcome">
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Back")).toBeDisabled();
  });

  it("disables Next when nextDisabled is true", () => {
    render(
      <WizardShell {...defaultProps} nextDisabled={true}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Next")).toBeDisabled();
  });

  it("uses custom nextLabel", () => {
    render(
      <WizardShell {...defaultProps} nextLabel="Finish">
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Finish")).toBeInTheDocument();
  });

  it("shows Skip button when optional and onSkip provided", () => {
    const onSkip = vi.fn();
    render(
      <WizardShell {...defaultProps} isOptional={true} onSkip={onSkip}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.getByText("Skip")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Skip"));
    expect(onSkip).toHaveBeenCalled();
  });

  it("hides nav when showNav is false", () => {
    render(
      <WizardShell {...defaultProps} showNav={false}>
        <div>Content</div>
      </WizardShell>
    );
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("renders progress bar indicators", () => {
    const { container } = render(
      <WizardShell {...defaultProps} stepIndex={2} currentStep="lidarrOptions">
        <div>Content</div>
      </WizardShell>
    );
    const bars = container.querySelectorAll(".rounded-full.border-2");
    expect(bars.length).toBe(7);
  });
});
