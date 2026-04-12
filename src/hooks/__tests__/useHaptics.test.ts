import { renderHook } from "@testing-library/react";
import useHaptics from "../useHaptics";

describe("useHaptics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns stable light/medium/strong methods", () => {
    const { result, rerender } = renderHook(() => useHaptics());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  describe("when vibrate is supported", () => {
    let vibrateSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vibrateSpy = vi.fn(() => true);
      Object.defineProperty(navigator, "vibrate", {
        value: vibrateSpy,
        writable: true,
        configurable: true,
      });
    });

    it("calls navigator.vibrate with 15ms for light", () => {
      const { result } = renderHook(() => useHaptics());
      result.current.light();
      expect(vibrateSpy).toHaveBeenCalledWith(15);
    });

    it("calls navigator.vibrate with 40ms for medium", () => {
      const { result } = renderHook(() => useHaptics());
      result.current.medium();
      expect(vibrateSpy).toHaveBeenCalledWith(40);
    });

    it("calls navigator.vibrate with 80ms for strong", () => {
      const { result } = renderHook(() => useHaptics());
      result.current.strong();
      expect(vibrateSpy).toHaveBeenCalledWith(80);
    });
  });

  describe("when vibrate is not supported", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "vibrate", {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it("does not throw when calling haptic methods", () => {
      const { result } = renderHook(() => useHaptics());
      expect(() => result.current.light()).not.toThrow();
      expect(() => result.current.medium()).not.toThrow();
      expect(() => result.current.strong()).not.toThrow();
    });
  });
});
