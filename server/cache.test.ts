import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiCache, withCache } from "./cache";

describe("ApiCache", () => {
  let cache: ApiCache;

  beforeEach(() => {
    cache = new ApiCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns undefined for missing keys", () => {
    expect(cache.get("missing")).toBeUndefined();
  });

  it("stores and retrieves values", () => {
    cache.set("key", "value", 60_000);
    expect(cache.get("key")).toBe("value");
  });

  it("caches empty strings", () => {
    cache.set("empty", "", 60_000);
    expect(cache.get("empty")).toBe("");
  });

  it("evicts expired entries on access", () => {
    cache.set("key", "value", 1000);
    expect(cache.get("key")).toBe("value");

    vi.advanceTimersByTime(1001);
    expect(cache.get("key")).toBeUndefined();
  });

  it("keeps entries that have not expired", () => {
    cache.set("key", "value", 5000);

    vi.advanceTimersByTime(4999);
    expect(cache.get("key")).toBe("value");
  });

  it("tracks size including expired entries until accessed", () => {
    cache.set("a", 1, 1000);
    cache.set("b", 2, 5000);
    expect(cache.size).toBe(2);

    vi.advanceTimersByTime(2000);
    expect(cache.size).toBe(2);

    cache.get("a");
    expect(cache.size).toBe(1);
  });

  it("clears all entries", () => {
    cache.set("a", 1, 60_000);
    cache.set("b", 2, 60_000);
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });
});

describe("withCache", () => {
  let cache: ApiCache;

  beforeEach(() => {
    cache = new ApiCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calls the underlying function on cache miss", async () => {
    const fn = vi.fn().mockResolvedValue("result");
    const cached = withCache(fn, {
      cache,
      key: (arg: string) => arg,
      ttlMs: 60_000,
    });

    const result = await cached("test");

    expect(result).toBe("result");
    expect(fn).toHaveBeenCalledWith("test");
  });

  it("returns cached value on cache hit without calling the function", async () => {
    const fn = vi.fn().mockResolvedValue("result");
    const cached = withCache(fn, {
      cache,
      key: (arg: string) => arg,
      ttlMs: 60_000,
    });

    await cached("test");
    const result = await cached("test");

    expect(result).toBe("result");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("caches empty string results", async () => {
    const fn = vi.fn().mockResolvedValue("");
    const cached = withCache(fn, {
      cache,
      key: (arg: string) => arg,
      ttlMs: 60_000,
    });

    await cached("test");
    const result = await cached("test");

    expect(result).toBe("");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("calls the function again after TTL expires", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second");
    const cached = withCache(fn, {
      cache,
      key: (arg: string) => arg,
      ttlMs: 5000,
    });

    const first = await cached("test");
    expect(first).toBe("first");

    vi.advanceTimersByTime(5001);

    const second = await cached("test");
    expect(second).toBe("second");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("uses the key function to derive cache keys", async () => {
    const fn = vi.fn().mockResolvedValue("result");
    const cached = withCache(fn, {
      cache,
      key: (arg: string) => arg.toLowerCase(),
      ttlMs: 60_000,
    });

    await cached("Radiohead");
    await cached("radiohead");
    await cached("RADIOHEAD");

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("supports multi-argument key functions", async () => {
    const fn = vi.fn().mockResolvedValue("artwork-url");
    const cached = withCache(fn, {
      cache,
      key: (album: string, artist: string) =>
        `${album.toLowerCase()}|${artist.toLowerCase()}`,
      ttlMs: 60_000,
    });

    await cached("OK Computer", "Radiohead");
    await cached("OK Computer", "Radiohead");

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("clearCache removes all entries", async () => {
    const fn = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockResolvedValueOnce("second");
    const cached = withCache(fn, {
      cache,
      key: (arg: string) => arg,
      ttlMs: 60_000,
    });

    await cached("test");
    cached.clearCache();
    const result = await cached("test");

    expect(result).toBe("second");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
