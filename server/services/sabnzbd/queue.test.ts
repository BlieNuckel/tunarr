import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetDownloadTransfers = vi.fn();
const mockGetAllDownloads = vi.fn();

vi.mock("../../api/slskd/transfer", () => ({
  getDownloadTransfers: (...args: unknown[]) =>
    mockGetDownloadTransfers(...args),
}));

vi.mock("../../api/slskd/downloadTracker", () => ({
  getAllDownloads: (...args: unknown[]) => mockGetAllDownloads(...args),
}));

vi.mock("../../api/slskd/statusMap", async () => {
  const actual = await vi.importActual("../../api/slskd/statusMap");
  return actual;
});

import { getQueueSlots } from "./queue";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getQueueSlots", () => {
  it("returns in-progress downloads as queue slots", async () => {
    mockGetAllDownloads.mockReturnValue([
      {
        nzoId: "nzo1",
        title: "Test Album",
        category: "music",
        username: "user1",
        files: [{ filename: "Music\\track.flac", size: 10000000 }],
        totalSize: 10000000,
        addedAt: Date.now(),
      },
    ]);
    mockGetDownloadTransfers.mockResolvedValue([
      {
        username: "user1",
        directories: [
          {
            directory: "Music",
            files: [
              {
                username: "user1",
                filename: "Music\\track.flac",
                size: 10000000,
                state: "InProgress",
                bytesTransferred: 5000000,
                averageSpeed: 100000,
                percentComplete: 50,
                id: "t1",
              },
            ],
          },
        ],
      },
    ]);

    const slots = await getQueueSlots();

    expect(slots).toHaveLength(1);
    expect(slots[0].nzo_id).toBe("nzo1");
    expect(slots[0].status).toBe("Downloading");
  });

  it("excludes completed downloads", async () => {
    mockGetAllDownloads.mockReturnValue([
      {
        nzoId: "nzo1",
        title: "Test Album",
        category: "music",
        username: "user1",
        files: [{ filename: "Music\\track.flac", size: 10000000 }],
        totalSize: 10000000,
        addedAt: Date.now(),
      },
    ]);
    mockGetDownloadTransfers.mockResolvedValue([
      {
        username: "user1",
        directories: [
          {
            directory: "Music",
            files: [
              {
                username: "user1",
                filename: "Music\\track.flac",
                size: 10000000,
                state: "Completed, Succeeded",
                bytesTransferred: 10000000,
                averageSpeed: 100000,
                percentComplete: 100,
                id: "t1",
              },
            ],
          },
        ],
      },
    ]);

    const slots = await getQueueSlots();
    expect(slots).toHaveLength(0);
  });

  it("returns empty array when no tracked downloads", async () => {
    mockGetAllDownloads.mockReturnValue([]);
    mockGetDownloadTransfers.mockResolvedValue([]);

    const slots = await getQueueSlots();
    expect(slots).toHaveLength(0);
  });
});
