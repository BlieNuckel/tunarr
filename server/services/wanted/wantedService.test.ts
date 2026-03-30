import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetReleaseGroupById = vi.fn();

const mockFind = vi.fn();
const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockSave = vi.fn();
const mockRemove = vi.fn();

vi.mock("../../db/index", () => ({
  getDataSource: () => ({
    getRepository: () => ({
      find: (...args: unknown[]) => mockFind(...args),
      findOne: (...args: unknown[]) => mockFindOne(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      save: (...args: unknown[]) => mockSave(...args),
      remove: (...args: unknown[]) => mockRemove(...args),
    }),
  }),
  WantedItem: "WantedItem",
}));

vi.mock("../../api/musicbrainz/releaseGroups", () => ({
  getReleaseGroupById: (...args: unknown[]) => mockGetReleaseGroupById(...args),
}));

vi.mock("../../logger", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

import {
  addWantedItem,
  removeWantedItem,
  getWantedItems,
} from "./wantedService";

beforeEach(() => {
  vi.clearAllMocks();
  mockGetReleaseGroupById.mockResolvedValue({
    artistName: "Test Artist",
    albumTitle: "Test Album",
  });
});

describe("addWantedItem", () => {
  it("returns already_wanted when item exists for user", async () => {
    mockFindOne.mockResolvedValue({ id: 5 });

    const result = await addWantedItem(1, "mbid-1");
    expect(result).toEqual({ status: "already_wanted", id: 5 });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates a new wanted item", async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockReturnValue({
      user_id: 1,
      album_mbid: "mbid-1",
      artist_name: "Test Artist",
      album_title: "Test Album",
    });
    mockSave.mockResolvedValue({
      id: 10,
      user_id: 1,
      album_mbid: "mbid-1",
      artist_name: "Test Artist",
      album_title: "Test Album",
    });

    const result = await addWantedItem(1, "mbid-1");
    expect(result).toEqual({ status: "added", id: 10 });
    expect(mockGetReleaseGroupById).toHaveBeenCalledWith("mbid-1");
    expect(mockCreate).toHaveBeenCalledWith({
      user_id: 1,
      album_mbid: "mbid-1",
      artist_name: "Test Artist",
      album_title: "Test Album",
    });
  });

  it("throws when MusicBrainz lookup fails", async () => {
    mockFindOne.mockResolvedValue(null);
    mockGetReleaseGroupById.mockResolvedValue(null);

    await expect(addWantedItem(1, "bad-mbid")).rejects.toThrow(
      "Could not resolve release group bad-mbid on MusicBrainz"
    );
  });
});

describe("removeWantedItem", () => {
  it("returns not_found when item does not exist", async () => {
    mockFindOne.mockResolvedValue(null);

    const result = await removeWantedItem(1, "mbid-1");
    expect(result).toEqual({ status: "not_found" });
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("removes an existing wanted item", async () => {
    const item = {
      id: 5,
      user_id: 1,
      album_mbid: "mbid-1",
      album_title: "Test Album",
    };
    mockFindOne.mockResolvedValue(item);

    const result = await removeWantedItem(1, "mbid-1");
    expect(result).toEqual({ status: "removed" });
    expect(mockRemove).toHaveBeenCalledWith(item);
  });
});

describe("getWantedItems", () => {
  it("returns wanted items for user ordered by created_at DESC", async () => {
    mockFind.mockResolvedValue([]);

    const result = await getWantedItems(1);
    expect(result).toEqual([]);
    expect(mockFind).toHaveBeenCalledWith({
      where: { user_id: 1 },
      order: { created_at: "DESC" },
    });
  });
});
