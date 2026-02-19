import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

async function loadRateLimiter() {
  const mod = await import("./rateLimiter");
  return mod.default;
}

describe("musicbrainzRateLimiter", () => {
  it("calls next() immediately on first request", async () => {
    const limiter = await loadRateLimiter();
    const next = vi.fn();

    limiter({} as Request, {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("delays next() when called within 1 second", async () => {
    const limiter = await loadRateLimiter();
    const next1 = vi.fn();
    const next2 = vi.fn();

    limiter({} as Request, {} as Response, next1 as NextFunction);
    expect(next1).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);
    limiter({} as Request, {} as Response, next2 as NextFunction);
    expect(next2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(800);
    expect(next2).toHaveBeenCalledTimes(1);
  });

  it("calls next() immediately after 1 second has passed", async () => {
    const limiter = await loadRateLimiter();
    const next1 = vi.fn();
    const next2 = vi.fn();

    limiter({} as Request, {} as Response, next1 as NextFunction);
    vi.advanceTimersByTime(1000);

    limiter({} as Request, {} as Response, next2 as NextFunction);
    expect(next2).toHaveBeenCalledTimes(1);
  });
});
