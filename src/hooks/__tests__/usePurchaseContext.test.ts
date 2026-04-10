import { renderHook, act } from "@testing-library/react";
import usePurchaseContext from "../usePurchaseContext";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

const buyResponse = {
  recommendation: "buy",
  signals: [
    {
      factor: "label",
      recommendation: "buy",
      reason: "Warp Records is not on your blocklist",
    },
  ],
  label: { name: "Warp Records", mbid: "label-warp" },
};

describe("usePurchaseContext", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => usePurchaseContext());
    expect(result.current.context).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("fetches purchase context successfully", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(buyResponse), { status: 200 })
    );

    const { result } = renderHook(() => usePurchaseContext());
    await act(() => result.current.fetchContext("rg-123"));

    expect(fetch).toHaveBeenCalledWith(
      "/api/musicbrainz/purchase-context/rg-123"
    );
    expect(result.current.context).toEqual(buyResponse);
    expect(result.current.loading).toBe(false);
  });

  it("sets context to null on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("error", { status: 500 })
    );

    const { result } = renderHook(() => usePurchaseContext());
    await act(() => result.current.fetchContext("rg-bad"));

    expect(result.current.context).toBeNull();
  });

  it("sets context to null on fetch error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network"));

    const { result } = renderHook(() => usePurchaseContext());
    await act(() => result.current.fetchContext("rg-fail"));

    expect(result.current.context).toBeNull();
  });

  it("reset clears context", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(buyResponse), { status: 200 })
    );

    const { result } = renderHook(() => usePurchaseContext());
    await act(() => result.current.fetchContext("rg-123"));
    expect(result.current.context).toEqual(buyResponse);

    act(() => result.current.reset());
    expect(result.current.context).toBeNull();
  });
});
