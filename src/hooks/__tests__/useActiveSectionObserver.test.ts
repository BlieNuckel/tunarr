import { renderHook, act } from "@testing-library/react";
import useActiveSectionObserver from "../useActiveSectionObserver";

type IntersectionCallback = (
  entries: Partial<IntersectionObserverEntry>[]
) => void;

let observerCallback: IntersectionCallback;
let observedElements: Element[];

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionCallback) {
    observerCallback = callback;
  }
  observe(el: Element) {
    observedElements.push(el);
    mockObserve(el);
  }
  unobserve = vi.fn();
  disconnect() {
    observedElements = [];
    mockDisconnect();
  }
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

beforeEach(() => {
  observedElements = [];
  mockObserve.mockClear();
  mockDisconnect.mockClear();
});

describe("useActiveSectionObserver", () => {
  it("returns activeSection defaulting to first section", () => {
    const { result } = renderHook(() =>
      useActiveSectionObserver(["section-a", "section-b"])
    );
    expect(result.current.activeSection).toBe("section-a");
  });

  it("returns null when no sections provided", () => {
    const { result } = renderHook(() => useActiveSectionObserver([]));
    expect(result.current.activeSection).toBeNull();
  });

  it("returns ref callbacks for each section id", () => {
    const { result } = renderHook(() =>
      useActiveSectionObserver(["section-a", "section-b"])
    );
    expect(typeof result.current.sectionRefs["section-a"]).toBe("function");
    expect(typeof result.current.sectionRefs["section-b"]).toBe("function");
  });

  it("updates activeSection when intersection changes", () => {
    const { result } = renderHook(() =>
      useActiveSectionObserver(["section-a", "section-b"])
    );

    const elA = document.createElement("div");
    elA.id = "section-a";
    const elB = document.createElement("div");
    elB.id = "section-b";

    act(() => {
      result.current.sectionRefs["section-a"](elA);
      result.current.sectionRefs["section-b"](elB);
    });

    act(() => {
      observerCallback([
        {
          target: elB,
          isIntersecting: true,
        } as Partial<IntersectionObserverEntry>,
      ]);
    });

    expect(result.current.activeSection).toBe("section-b");
  });

  it("picks topmost intersecting section based on sectionIds order", () => {
    const { result } = renderHook(() =>
      useActiveSectionObserver(["section-a", "section-b"])
    );

    const elA = document.createElement("div");
    elA.id = "section-a";
    const elB = document.createElement("div");
    elB.id = "section-b";

    act(() => {
      result.current.sectionRefs["section-a"](elA);
      result.current.sectionRefs["section-b"](elB);
    });

    act(() => {
      observerCallback([
        {
          target: elA,
          isIntersecting: true,
        } as Partial<IntersectionObserverEntry>,
        {
          target: elB,
          isIntersecting: true,
        } as Partial<IntersectionObserverEntry>,
      ]);
    });

    expect(result.current.activeSection).toBe("section-a");
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = renderHook(() =>
      useActiveSectionObserver(["section-a"])
    );
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
