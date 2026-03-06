import { renderHook, act } from "@testing-library/react";
import useLidarr from "../useLidarr";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useLidarr", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => useLidarr());
    expect(result.current.state).toBe("idle");
    expect(result.current.errorMsg).toBeNull();
  });

  it("transitions to success on approved request", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "approved", requestId: 1 }), {
        status: 200,
      })
    );

    const { result } = renderHook(() => useLidarr());
    await act(() => result.current.requestAlbum({ albumMbid: "abc-123" }));

    expect(result.current.state).toBe("success");
    expect(result.current.errorMsg).toBeNull();
    expect(fetch).toHaveBeenCalledWith("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumMbid: "abc-123" }),
    });
  });

  it("transitions to pending on pending request", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "pending", requestId: 1 }), {
        status: 200,
      })
    );

    const { result } = renderHook(() => useLidarr());
    await act(() => result.current.requestAlbum({ albumMbid: "abc-123" }));

    expect(result.current.state).toBe("pending");
  });

  it("transitions to pending on duplicate_pending", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ status: "duplicate_pending", requestId: 1 }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useLidarr());
    await act(() => result.current.requestAlbum({ albumMbid: "abc-123" }));

    expect(result.current.state).toBe("pending");
  });

  it("transitions to already_monitored", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ status: "already_monitored", requestId: 1 }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useLidarr());
    await act(() => result.current.requestAlbum({ albumMbid: "abc-123" }));

    expect(result.current.state).toBe("already_monitored");
  });

  it("transitions to error on server error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    );

    const { result } = renderHook(() => useLidarr());
    await act(() => result.current.requestAlbum({ albumMbid: "abc-123" }));

    expect(result.current.state).toBe("error");
    expect(result.current.errorMsg).toBe("Not found");
  });

  it("falls back to generic message on invalid JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 })
    );

    const { result } = renderHook(() => useLidarr());
    await act(() => result.current.requestAlbum({ albumMbid: "abc-123" }));

    expect(result.current.state).toBe("error");
    expect(result.current.errorMsg).toBe("Server error (500)");
  });
});
