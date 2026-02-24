import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDecodeNzb = vi.fn();
const mockEnqueueDownload = vi.fn();
const mockAddDownload = vi.fn();

vi.mock("../../api/slskd/nzb", () => ({
  decodeNzb: (...args: unknown[]) => mockDecodeNzb(...args),
}));

vi.mock("../../api/slskd/transfer", () => ({
  enqueueDownload: (...args: unknown[]) => mockEnqueueDownload(...args),
}));

vi.mock("../../api/slskd/downloadTracker", () => ({
  addDownload: (...args: unknown[]) => mockAddDownload(...args),
}));

import { processAddFile } from "./addFile";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("processAddFile", () => {
  it("decodes NZB, enqueues download, and tracks it", async () => {
    mockDecodeNzb.mockReturnValue({
      username: "user1",
      files: [{ filename: "Music\\Album\\track.flac", size: 5000000 }],
    });
    mockEnqueueDownload.mockResolvedValue(undefined);

    const result = await processAddFile("<nzb>test</nzb>", "music");

    expect(result.nzoId).toMatch(/^slskd_/);
    expect(result.title).toBe("Album");
    expect(mockEnqueueDownload).toHaveBeenCalledWith("user1", [
      { filename: "Music\\Album\\track.flac", size: 5000000 },
    ]);
    expect(mockAddDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "user1",
        category: "music",
        totalSize: 5000000,
      })
    );
  });

  it("uses 'Unknown' title when no filename", async () => {
    mockDecodeNzb.mockReturnValue({
      username: "user1",
      files: [],
    });
    mockEnqueueDownload.mockResolvedValue(undefined);

    const result = await processAddFile("<nzb>test</nzb>", "music");
    expect(result.title).toBe("Unknown");
  });
});
