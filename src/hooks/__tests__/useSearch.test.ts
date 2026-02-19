import { renderHook, act } from "@testing-library/react";
import useSearch from "../useSearch";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useSearch", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("skips empty query", async () => {
    const { result } = renderHook(() => useSearch());
    await act(() => result.current.search("  ", "album"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sets results on successful search", async () => {
    const releaseGroups = [{ id: "1", title: "OK Computer" }];
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ "release-groups": releaseGroups }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { result } = renderHook(() => useSearch());
    await act(() => result.current.search("radiohead", "album"));

    expect(result.current.results).toEqual(releaseGroups);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on failed search", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Rate limited" }), { status: 429 })
    );

    const { result } = renderHook(() => useSearch());
    await act(() => result.current.search("test", "album"));

    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe("Rate limited");
  });

  it("handles network error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

    const { result } = renderHook(() => useSearch());
    await act(() => result.current.search("test", "album"));

    expect(result.current.error).toBe("Network failure");
    expect(result.current.results).toEqual([]);
  });
});
