import { render, screen } from "@testing-library/react";
import StepDescription from "../StepDescription";

describe("StepDescription", () => {
  it("renders the text", () => {
    render(<StepDescription text="Configure your settings below." />);
    expect(
      screen.getByText("Configure your settings below.")
    ).toBeInTheDocument();
  });
});
