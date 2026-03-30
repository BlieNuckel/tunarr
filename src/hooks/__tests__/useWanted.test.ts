import { renderHook, act } from "@testing-library/react";
import useWanted from "../useWanted";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useWanted", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => useWanted());
    expect(result.current.state).toBe("idle");
    expect(result.current.errorMsg).toBeNull();
  });

  it("transitions to wanted on successful add", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "added", id: 1 }), { status: 200 })
    );

    const { result } = renderHook(() => useWanted());
    await act(() => result.current.addToWanted("mbid-1"));

    expect(result.current.state).toBe("wanted");
    expect(fetch).toHaveBeenCalledWith("/api/wanted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumMbid: "mbid-1" }),
    });
  });

  it("transitions to wanted on already_wanted response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "already_wanted", id: 5 }), {
        status: 200,
      })
    );

    const { result } = renderHook(() => useWanted());
    await act(() => result.current.addToWanted("mbid-1"));

    expect(result.current.state).toBe("wanted");
  });

  it("transitions to error on failed add", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
    );

    const { result } = renderHook(() => useWanted());
    await act(() => result.current.addToWanted("mbid-1"));

    expect(result.current.state).toBe("error");
    expect(result.current.errorMsg).toBe("Server error");
  });

  it("transitions to idle on successful remove", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "removed" }), { status: 200 })
    );

    const { result } = renderHook(() => useWanted());
    await act(() => result.current.removeFromWanted("mbid-1"));

    expect(result.current.state).toBe("idle");
    expect(fetch).toHaveBeenCalledWith("/api/wanted/mbid-1", {
      method: "DELETE",
    });
  });

  it("transitions to error on failed remove", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    );

    const { result } = renderHook(() => useWanted());
    await act(() => result.current.removeFromWanted("mbid-1"));

    expect(result.current.state).toBe("error");
    expect(result.current.errorMsg).toBe("Not found");
  });
});
