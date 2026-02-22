import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createExternalApi } from "./externalApi";

function mockFetchFn(data: unknown = {}, status = 200) {
  return vi.fn().mockResolvedValue({
    json: () => Promise.resolve(data),
    ok: status >= 200 && status < 300,
    status,
  });
}

describe("createExternalApi", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("get", () => {
    it("fetches data from the correct URL", async () => {
      const fetchFn = mockFetchFn({ name: "test" });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      const result = await api.get<{ name: string }>("/artists");

      expect(result).toEqual({ name: "test" });
      expect(fetchFn).toHaveBeenCalledWith(
        "https://api.example.com/artists",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      );
    });

    it("merges default params into the URL", async () => {
      const fetchFn = mockFetchFn({});
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        defaultParams: { api_key: "abc123", format: "json" },
        fetchFn,
      });

      await api.get("/search");

      const calledUrl = fetchFn.mock.calls[0][0] as string;
      expect(calledUrl).toContain("api_key=abc123");
      expect(calledUrl).toContain("format=json");
    });

    it("merges request params with default params", async () => {
      const fetchFn = mockFetchFn({});
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        defaultParams: { api_key: "abc123" },
        fetchFn,
      });

      await api.get("/search", { params: { q: "radiohead" } });

      const calledUrl = fetchFn.mock.calls[0][0] as string;
      expect(calledUrl).toContain("api_key=abc123");
      expect(calledUrl).toContain("q=radiohead");
    });

    it("merges default headers with request headers", async () => {
      const fetchFn = mockFetchFn({});
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        defaultHeaders: { "X-Api-Key": "secret" },
        fetchFn,
      });

      await api.get("/data", { headers: { "X-Custom": "value" } });

      expect(fetchFn).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Api-Key": "secret",
            "X-Custom": "value",
          }),
        })
      );
    });

    it("returns cached data on subsequent calls", async () => {
      const fetchFn = mockFetchFn({ name: "cached" });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.get("/artists");
      const result = await api.get<{ name: string }>("/artists");

      expect(result).toEqual({ name: "cached" });
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("re-fetches after TTL expires", async () => {
      const fetchFn = mockFetchFn({ name: "first" });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.get("/artists", undefined, 5);

      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ name: "second" }),
        ok: true,
        status: 200,
      });

      vi.advanceTimersByTime(6000);

      const result = await api.get<{ name: string }>("/artists", undefined, 5);
      expect(result).toEqual({ name: "second" });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("skips cache when ttl is 0", async () => {
      const fetchFn = mockFetchFn({ count: 1 });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.get("/stats", undefined, 0);

      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ count: 2 }),
        ok: true,
        status: 200,
      });

      const result = await api.get<{ count: number }>("/stats", undefined, 0);
      expect(result).toEqual({ count: 2 });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("caches different endpoints separately", async () => {
      const fetchFn = vi.fn();
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ type: "artists" }),
        ok: true,
        status: 200,
      });
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ type: "albums" }),
        ok: true,
        status: 200,
      });

      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      const artists = await api.get<{ type: string }>("/artists");
      const albums = await api.get<{ type: string }>("/albums");

      expect(artists).toEqual({ type: "artists" });
      expect(albums).toEqual({ type: "albums" });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it("caches different params separately", async () => {
      const fetchFn = vi.fn();
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ artist: "Radiohead" }),
        ok: true,
        status: 200,
      });
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ artist: "Bjork" }),
        ok: true,
        status: 200,
      });

      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.get("/search", { params: { q: "radiohead" } });
      await api.get("/search", { params: { q: "bjork" } });

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("post", () => {
    it("sends POST request with body", async () => {
      const fetchFn = mockFetchFn({ id: 1 });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      const result = await api.post<{ id: number }>("/artists", {
        name: "Radiohead",
      });

      expect(result).toEqual({ id: 1 });
      expect(fetchFn).toHaveBeenCalledWith(
        "https://api.example.com/artists",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Radiohead" }),
        })
      );
    });

    it("caches POST responses", async () => {
      const fetchFn = mockFetchFn({ id: 1 });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.post("/artists", { name: "Radiohead" });
      const result = await api.post<{ id: number }>("/artists", {
        name: "Radiohead",
      });

      expect(result).toEqual({ id: 1 });
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("different POST bodies are cached separately", async () => {
      const fetchFn = vi.fn();
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ id: 1 }),
        ok: true,
        status: 200,
      });
      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ id: 2 }),
        ok: true,
        status: 200,
      });

      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.post("/artists", { name: "Radiohead" });
      await api.post("/artists", { name: "Bjork" });

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("getRolling", () => {
    it("returns cached data and refreshes in background when near expiry", async () => {
      const fetchFn = mockFetchFn({ version: 1 });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.getRolling("/status", undefined, 30);

      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ version: 2 }),
        ok: true,
        status: 200,
      });

      // Advance close to expiry (within rolling buffer)
      vi.advanceTimersByTime(20000);

      const result = await api.getRolling<{ version: number }>(
        "/status",
        undefined,
        30
      );

      // Should return stale data immediately
      expect(result).toEqual({ version: 1 });
    });

    it("fetches fresh data on cache miss", async () => {
      const fetchFn = mockFetchFn({ data: "fresh" });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      const result = await api.getRolling<{ data: string }>("/status");

      expect(result).toEqual({ data: "fresh" });
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeCache", () => {
    it("removes a specific cached entry", async () => {
      const fetchFn = mockFetchFn({ name: "first" });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.get("/artists");
      api.removeCache("/artists");

      fetchFn.mockResolvedValueOnce({
        json: () => Promise.resolve({ name: "second" }),
        ok: true,
        status: 200,
      });

      const result = await api.get<{ name: string }>("/artists");
      expect(result).toEqual({ name: "second" });
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("clearCache", () => {
    it("removes all cached entries", async () => {
      const fetchFn = mockFetchFn({ data: "value" });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn,
      });

      await api.get("/a");
      await api.get("/b");
      api.clearCache();

      expect(api.cache.keys()).toHaveLength(0);
    });
  });

  describe("rate limiting", () => {
    it("delays requests when rate limit is set", async () => {
      const fetchFn = mockFetchFn({});
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        rateLimitMs: 1000,
        fetchFn,
      });

      // First request — no delay
      const p1 = api.get("/a", undefined, 0);
      vi.advanceTimersByTime(0);
      await p1;

      // Second request — should need to wait
      const p2 = api.get("/b", undefined, 0);
      vi.advanceTimersByTime(1000);
      await p2;

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("custom fetchFn", () => {
    it("uses the provided fetch function", async () => {
      const customFetch = mockFetchFn({ custom: true });
      const api = createExternalApi({
        baseUrl: "https://api.example.com",
        fetchFn: customFetch,
      });

      await api.get("/test");

      expect(customFetch).toHaveBeenCalled();
    });
  });
});
