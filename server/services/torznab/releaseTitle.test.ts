import { describe, it, expect } from "vitest";
import { buildReleaseTitle } from "./releaseTitle";

describe("buildReleaseTitle", () => {
  it("returns last part when it contains ' - '", () => {
    expect(buildReleaseTitle("Music\\Radiohead - OK Computer")).toBe(
      "Radiohead - OK Computer"
    );
  });

  it("combines parent and last part when parent is not generic", () => {
    expect(buildReleaseTitle("Music\\Radiohead\\OK Computer")).toBe(
      "Radiohead - OK Computer"
    );
  });

  it("skips generic directory names", () => {
    expect(buildReleaseTitle("music\\downloads\\Album")).toBe("Album");
  });

  it("uses forward slashes", () => {
    expect(buildReleaseTitle("Users/music/Radiohead/OK Computer")).toBe(
      "Radiohead - OK Computer"
    );
  });

  it("returns just the last part when all parents are generic", () => {
    expect(buildReleaseTitle("music/downloads/complete/Album")).toBe("Album");
  });

  it("handles single directory", () => {
    expect(buildReleaseTitle("Album")).toBe("Album");
  });
});
