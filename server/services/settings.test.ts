import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLidarrFetch = vi.fn();

vi.mock("../api/lidarr/fetch", () => ({
  lidarrFetch: (...args: unknown[]) => mockLidarrFetch(...args),
}));

import { testLidarrConnection } from "./settings";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("testLidarrConnection", () => {
  it("returns error when system/status fails", async () => {
    mockLidarrFetch.mockResolvedValue({ ok: false, status: 401 });

    const result = await testLidarrConnection("http://lidarr:8686", "badkey");
    expect(result).toEqual({ error: "Lidarr returned 401", status: 401 });
  });

  it("returns success with version and profiles", async () => {
    mockLidarrFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "2.0.0" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "Any", items: [] }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: "Standard", extra: true }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, path: "/music", freeSpace: 100 }],
      });

    const result = await testLidarrConnection("http://lidarr:8686", "goodkey");
    expect(result).toEqual({
      success: true,
      version: "2.0.0",
      qualityProfiles: [{ id: 1, name: "Any" }],
      metadataProfiles: [{ id: 1, name: "Standard" }],
      rootFolderPaths: [{ id: 1, path: "/music" }],
    });
  });

  it("returns empty arrays when profile fetches fail", async () => {
    mockLidarrFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "2.0.0" }),
      })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });

    const result = await testLidarrConnection("http://lidarr:8686", "key");
    expect("success" in result && result.success).toBe(true);
    if ("success" in result) {
      expect(result.qualityProfiles).toEqual([]);
      expect(result.metadataProfiles).toEqual([]);
      expect(result.rootFolderPaths).toEqual([]);
    }
  });

  it("returns empty arrays when profile fetches throw", async () => {
    mockLidarrFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "2.0.0" }),
      })
      .mockRejectedValueOnce(new Error("network error"))
      .mockRejectedValueOnce(new Error("network error"))
      .mockRejectedValueOnce(new Error("network error"));

    const result = await testLidarrConnection("http://lidarr:8686", "key");
    expect("success" in result && result.success).toBe(true);
    if ("success" in result) {
      expect(result.qualityProfiles).toEqual([]);
      expect(result.metadataProfiles).toEqual([]);
      expect(result.rootFolderPaths).toEqual([]);
    }
  });

  it("strips trailing slashes from URL", async () => {
    mockLidarrFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: "1.0" }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    await testLidarrConnection("http://lidarr:8686///", "key");
    expect(mockLidarrFetch).toHaveBeenCalledWith(
      "http://lidarr:8686/api/v1/system/status",
      expect.any(Object)
    );
  });
});
