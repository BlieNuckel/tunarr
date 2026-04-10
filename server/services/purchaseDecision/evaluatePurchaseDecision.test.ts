import { describe, it, expect, vi, afterEach } from "vitest";
import { evaluatePurchaseDecision } from "./evaluatePurchaseDecision";
import type { PurchaseDecisionConfig } from "../../config";

const baseConfig: PurchaseDecisionConfig = {
  labelBlocklist: ["Universal", "Sony"],
  oldReleaseThresholdYears: 50,
};

afterEach(() => {
  vi.useRealTimers();
});

describe("evaluatePurchaseDecision", () => {
  it("returns request recommendation when label is blocklisted", () => {
    const result = evaluatePurchaseDecision(
      {
        label: { name: "Universal Music", mbid: "l-1" },
        firstReleaseDate: null,
        labelAncestors: [],
      },
      baseConfig
    );
    expect(result.recommendation).toBe("request");
    expect(
      result.signals.find((s) => s.factor === "label")?.recommendation
    ).toBe("request");
    expect(result.label).toEqual({ name: "Universal Music", mbid: "l-1" });
  });

  it("returns buy recommendation when label is not blocklisted", () => {
    const result = evaluatePurchaseDecision(
      {
        label: { name: "Warp Records", mbid: "l-2" },
        firstReleaseDate: null,
        labelAncestors: [],
      },
      baseConfig
    );
    expect(result.recommendation).toBe("buy");
    expect(
      result.signals.find((s) => s.factor === "label")?.recommendation
    ).toBe("buy");
  });

  it("returns neutral when no data is available", () => {
    const result = evaluatePurchaseDecision(
      { label: null, firstReleaseDate: null, labelAncestors: [] },
      baseConfig
    );
    expect(result.recommendation).toBe("neutral");
    expect(result.signals).toHaveLength(0);
    expect(result.label).toBeNull();
  });

  it("includes age request signal for old releases", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluatePurchaseDecision(
      {
        label: { name: "Warp Records", mbid: "l-2" },
        labelAncestors: [],
        firstReleaseDate: "1970-01-01",
      },
      baseConfig
    );
    expect(result.recommendation).toBe("request");
    expect(result.signals).toHaveLength(2);
    expect(
      result.signals.find((s) => s.factor === "label")?.recommendation
    ).toBe("buy");
    expect(result.signals.find((s) => s.factor === "age")?.recommendation).toBe(
      "request"
    );
  });

  it("both label and age can recommend request", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluatePurchaseDecision(
      {
        label: { name: "Universal Music", mbid: "l-1" },
        labelAncestors: [],
        firstReleaseDate: "1960-01-01",
      },
      baseConfig
    );
    expect(result.recommendation).toBe("request");
    expect(
      result.signals.filter((s) => s.recommendation === "request")
    ).toHaveLength(2);
  });

  it("no age signal for recent releases", () => {
    vi.useFakeTimers({ now: new Date("2026-04-10") });

    const result = evaluatePurchaseDecision(
      {
        label: { name: "Warp Records", mbid: "l-2" },
        labelAncestors: [],
        firstReleaseDate: "2025-06-01",
      },
      baseConfig
    );
    expect(result.recommendation).toBe("buy");
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0].factor).toBe("label");
  });

  it("passes label through to response", () => {
    const label = { name: "4AD", mbid: "l-3" };
    const result = evaluatePurchaseDecision(
      { label, firstReleaseDate: null, labelAncestors: [] },
      baseConfig
    );
    expect(result.label).toEqual(label);
  });
});
