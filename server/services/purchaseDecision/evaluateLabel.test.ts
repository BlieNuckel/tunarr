import { describe, it, expect } from "vitest";
import { evaluateLabel } from "./evaluateLabel";
import type { PurchaseData, LabelInfo } from "./types";
import type { PurchaseDecisionConfig } from "../../config";

const baseConfig: PurchaseDecisionConfig = {
  labelBlocklist: ["Universal", "Sony", "Warner"],
  oldReleaseThresholdYears: 50,
};

function makeData(
  label: PurchaseData["label"],
  labelAncestors: LabelInfo[] = []
): PurchaseData {
  return { label, labelAncestors, firstReleaseDate: null };
}

describe("evaluateLabel", () => {
  it("returns request signal when label matches blocklist", () => {
    const result = evaluateLabel(
      makeData({ name: "Universal Music Group", mbid: "l-1" }),
      baseConfig
    );
    expect(result).toEqual({
      factor: "label",
      recommendation: "request",
      reason: "Universal Music Group is on your blocklist",
    });
  });

  it("performs case-insensitive partial matching", () => {
    const result = evaluateLabel(
      makeData({ name: "sony music entertainment", mbid: "l-2" }),
      baseConfig
    );
    expect(result?.recommendation).toBe("request");
  });

  it("returns buy signal when label is not on blocklist", () => {
    const result = evaluateLabel(
      makeData({ name: "Warp Records", mbid: "l-3" }),
      baseConfig
    );
    expect(result).toEqual({
      factor: "label",
      recommendation: "buy",
      reason: "Warp Records is not on your blocklist",
    });
  });

  it("returns null when no label data", () => {
    const result = evaluateLabel(makeData(null), baseConfig);
    expect(result).toBeNull();
  });

  it("returns buy signal when blocklist is empty", () => {
    const result = evaluateLabel(makeData({ name: "Any Label", mbid: "l-4" }), {
      labelBlocklist: [],
      oldReleaseThresholdYears: 50,
    });
    expect(result?.recommendation).toBe("buy");
  });

  it("returns request when an ancestor matches blocklist", () => {
    const result = evaluateLabel(
      makeData({ name: "Polydor Records", mbid: "l-5" }, [
        { name: "Universal Music Group", mbid: "l-1" },
      ]),
      baseConfig
    );
    expect(result).toEqual({
      factor: "label",
      recommendation: "request",
      reason:
        "Polydor Records is a subsidiary of Universal Music Group (blocklisted)",
    });
  });

  it("checks deeper ancestors", () => {
    const result = evaluateLabel(
      makeData({ name: "Interscope Records", mbid: "l-6" }, [
        { name: "Interscope Geffen A&M", mbid: "l-7" },
        { name: "Universal Music Group", mbid: "l-1" },
      ]),
      baseConfig
    );
    expect(result?.recommendation).toBe("request");
    expect(result?.reason).toContain("subsidiary of Universal Music Group");
  });

  it("prefers direct match over ancestor match", () => {
    const result = evaluateLabel(
      makeData({ name: "Sony Music", mbid: "l-8" }, [
        { name: "Universal Music Group", mbid: "l-1" },
      ]),
      baseConfig
    );
    expect(result?.reason).toBe("Sony Music is on your blocklist");
  });

  it("returns buy when neither label nor ancestors match", () => {
    const result = evaluateLabel(
      makeData({ name: "4AD", mbid: "l-9" }, [
        { name: "Beggars Group", mbid: "l-10" },
      ]),
      baseConfig
    );
    expect(result?.recommendation).toBe("buy");
  });
});
