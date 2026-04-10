import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLabelAncestors } from "./labels";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("./config", () => ({
  MB_BASE: "https://musicbrainz.test/ws/2",
  MB_HEADERS: { "User-Agent": "test" },
  rateLimitedMbFetch: (...args: unknown[]) => mockFetch(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function okResponse(data: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(data) };
}

function errorResponse(status: number) {
  return { ok: false, status, json: () => Promise.resolve({}) };
}

function labelWithParent(
  id: string,
  name: string,
  parentId: string,
  parentName: string
) {
  return {
    id,
    name,
    relations: [
      {
        type: "label ownership",
        direction: "backward",
        ended: false,
        label: { id: parentId, name: parentName },
      },
    ],
  };
}

function labelWithoutParent(id: string, name: string) {
  return { id, name, relations: [] };
}

describe("getLabelAncestors", () => {
  it("returns single parent", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse(
        labelWithParent("l-1", "Polydor", "l-2", "Universal Music Group")
      )
    );
    mockFetch.mockResolvedValueOnce(
      okResponse(labelWithoutParent("l-2", "Universal Music Group"))
    );

    const result = await getLabelAncestors("l-1");
    expect(result).toEqual([{ name: "Universal Music Group", mbid: "l-2" }]);
  });

  it("walks multiple levels", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse(
        labelWithParent("l-1", "Interscope", "l-2", "Interscope Geffen")
      )
    );
    mockFetch.mockResolvedValueOnce(
      okResponse(
        labelWithParent(
          "l-2",
          "Interscope Geffen",
          "l-3",
          "Universal Music Group"
        )
      )
    );
    mockFetch.mockResolvedValueOnce(
      okResponse(labelWithoutParent("l-3", "Universal Music Group"))
    );

    const result = await getLabelAncestors("l-1");
    expect(result).toEqual([
      { name: "Interscope Geffen", mbid: "l-2" },
      { name: "Universal Music Group", mbid: "l-3" },
    ]);
  });

  it("returns empty array when label has no parent", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse(labelWithoutParent("l-1", "Warp Records"))
    );

    const result = await getLabelAncestors("l-1");
    expect(result).toEqual([]);
  });

  it("returns empty array on fetch error", async () => {
    mockFetch.mockResolvedValueOnce(errorResponse(404));

    const result = await getLabelAncestors("l-bad");
    expect(result).toEqual([]);
  });

  it("ignores ended ownership relationships", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({
        id: "l-1",
        name: "Some Label",
        relations: [
          {
            type: "label ownership",
            direction: "backward",
            ended: true,
            label: { id: "l-2", name: "Old Parent" },
          },
        ],
      })
    );

    const result = await getLabelAncestors("l-1");
    expect(result).toEqual([]);
  });

  it("ignores forward (subsidiary) relationships", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse({
        id: "l-1",
        name: "Big Label",
        relations: [
          {
            type: "label ownership",
            direction: "forward",
            ended: false,
            label: { id: "l-2", name: "Subsidiary" },
          },
        ],
      })
    );

    const result = await getLabelAncestors("l-1");
    expect(result).toEqual([]);
  });

  it("stops on circular references", async () => {
    mockFetch.mockResolvedValueOnce(
      okResponse(labelWithParent("l-1", "Label A", "l-2", "Label B"))
    );
    mockFetch.mockResolvedValueOnce(
      okResponse(labelWithParent("l-2", "Label B", "l-1", "Label A"))
    );

    const result = await getLabelAncestors("l-1");
    expect(result).toEqual([{ name: "Label B", mbid: "l-2" }]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
