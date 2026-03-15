import { render, screen, fireEvent } from "@testing-library/react";
import BottomSheet from "../BottomSheet";

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });

  it("renders children when open", () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    fireEvent.click(screen.getByTestId("bottom-sheet-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when sheet content is clicked", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    fireEvent.click(screen.getByText("Sheet content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders a drag handle", () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>
    );
    const backdrop = screen.getByTestId("bottom-sheet-backdrop");
    const handle = backdrop.querySelector(".rounded-full");
    expect(handle).not.toBeNull();
  });
});
