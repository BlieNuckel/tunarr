import { renderHook } from "@testing-library/react";
import useHaptics from "../useHaptics";

vi.mock("web-haptics/react", () => {
  const trigger = vi.fn();
  return {
    useWebHaptics: () => ({
      trigger,
      cancel: vi.fn(),
      isSupported: true,
    }),
  };
});

async function getTriggerMock() {
  const mod = await import("web-haptics/react");
  return mod.useWebHaptics().trigger as ReturnType<typeof vi.fn>;
}

describe("useHaptics", () => {
  let trigger: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    trigger = await getTriggerMock();
    trigger.mockClear();
  });

  it("returns stable object when trigger reference is stable", () => {
    const { result, rerender } = renderHook(() => useHaptics());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("calls trigger with 'light' preset for light()", () => {
    const { result } = renderHook(() => useHaptics());
    result.current.light();
    expect(trigger).toHaveBeenCalledWith("light");
  });

  it("calls trigger with 'medium' preset for medium()", () => {
    const { result } = renderHook(() => useHaptics());
    result.current.medium();
    expect(trigger).toHaveBeenCalledWith("medium");
  });

  it("calls trigger with 'heavy' preset for strong()", () => {
    const { result } = renderHook(() => useHaptics());
    result.current.strong();
    expect(trigger).toHaveBeenCalledWith("heavy");
  });
});
