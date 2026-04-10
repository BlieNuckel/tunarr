import { describe, it, expect, vi, afterEach } from "vitest";
import { evaluateAge } from "./evaluateAge";
import type { PurchaseData } from "./types";
import type { PurchaseDecisionConfig } from "../../config";

const baseConfig: PurchaseDecisionConfig = {
  labelBlocklist: [],
  oldReleaseThresholdYears: 50,
};

function makeData(firstReleaseDate: string | null): PurchaseData {
  return { label: null, labelAncestors: [], firstReleaseDate };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("evaluateAge", () => {
  it("returns request signal for album older than threshold", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluateAge(makeData("1970-01-01"), baseConfig);
    expect(result).toEqual({
      factor: "age",
      recommendation: "request",
      reason: "Released in 1970 — the artist may no longer benefit from sales",
    });
  });

  it("returns null for album younger than threshold", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluateAge(makeData("2020-01-01"), baseConfig);
    expect(result).toBeNull();
  });

  it("handles year-only dates", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluateAge(makeData("1960"), baseConfig);
    expect(result?.recommendation).toBe("request");
    expect(result?.reason).toContain("1960");
  });

  it("handles year-month dates", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluateAge(makeData("1975-06"), baseConfig);
    expect(result?.recommendation).toBe("request");
  });

  it("returns null when firstReleaseDate is null", () => {
    const result = evaluateAge(makeData(null), baseConfig);
    expect(result).toBeNull();
  });

  it("returns null when threshold is 0 (disabled)", () => {
    const result = evaluateAge(makeData("1950-01-01"), {
      ...baseConfig,
      oldReleaseThresholdYears: 0,
    });
    expect(result).toBeNull();
  });

  it("returns null for invalid date strings", () => {
    const result = evaluateAge(makeData("not-a-date"), baseConfig);
    expect(result).toBeNull();
  });

  it("returns request for album clearly over threshold", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluateAge(makeData("1975-01-01"), baseConfig);
    expect(result?.recommendation).toBe("request");
  });

  it("returns null for album clearly under threshold", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluateAge(makeData("1980-01-01"), baseConfig);
    expect(result).toBeNull();
  });
});
