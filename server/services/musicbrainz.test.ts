import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetTrackPreviews = vi.fn();

vi.mock("../api/deezer/tracks", () => ({
  getTrackPreviews: (...args: unknown[]) => mockGetTrackPreviews(...args),
}));

import { enrichTracksWithPreviews } from "./musicbrainz";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("enrichTracksWithPreviews", () => {
  it("adds previewUrl to tracks with matches", async () => {
    const media = [
      {
        position: 1,
        tracks: [
          { title: "Creep", position: 1 },
          { title: "High and Dry", position: 2 },
        ],
      },
    ];
    mockGetTrackPreviews.mockResolvedValue(
      new Map([
        ["radiohead|creep", "https://example.com/creep.mp3"],
        ["radiohead|high and dry", ""],
      ])
    );

    const result = await enrichTracksWithPreviews(media, "Radiohead");
    expect(result[0].tracks[0]).toEqual({
      title: "Creep",
      position: 1,
      previewUrl: "https://example.com/creep.mp3",
    });
    expect(result[0].tracks[1]).toEqual({ title: "High and Dry", position: 2 });
    expect(mockGetTrackPreviews).toHaveBeenCalledWith([
      { artistName: "Radiohead", title: "Creep" },
      { artistName: "Radiohead", title: "High and Dry" },
    ]);
  });

  it("returns media unchanged when no previews found", async () => {
    const media = [
      { position: 1, tracks: [{ title: "Track 1", position: 1 }] },
    ];
    mockGetTrackPreviews.mockResolvedValue(new Map());

    const result = await enrichTracksWithPreviews(media, "Artist");
    expect(result[0].tracks[0]).toEqual({ title: "Track 1", position: 1 });
  });

  it("handles multiple media entries", async () => {
    const media = [
      { position: 1, tracks: [{ title: "Track A" }] },
      { position: 2, tracks: [{ title: "Track B" }] },
    ];
    mockGetTrackPreviews.mockResolvedValue(
      new Map([["artist|track b", "https://example.com/b.mp3"]])
    );

    const result = await enrichTracksWithPreviews(media, "Artist");
    expect(result[0].tracks[0].previewUrl).toBeUndefined();
    expect(result[1].tracks[0]).toEqual({
      title: "Track B",
      previewUrl: "https://example.com/b.mp3",
    });
  });
});
