import { renderHook, waitFor } from "@testing-library/react";
import useLibraryRecommendations from "../useLibraryRecommendations";
import type { PlexTopArtist, LibraryArtist } from "../useDiscover";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

const plexArtists: PlexTopArtist[] = [
  { name: "Radiohead", viewCount: 100, thumb: "", genres: [] },
  { name: "Portishead", viewCount: 80, thumb: "", genres: [] },
  { name: "Massive Attack", viewCount: 60, thumb: "", genres: [] },
  { name: "Bjork", viewCount: 40, thumb: "", genres: [] },
];

const libraryArtists: LibraryArtist[] = [
  { id: 1, name: "Arctic Monkeys", foreignArtistId: "a1" },
  { id: 2, name: "Blur", foreignArtistId: "a2" },
  { id: 3, name: "Coldplay", foreignArtistId: "a3" },
];

const similarData = {
  artists: [{ name: "Muse", mbid: "m1", match: 0.9, imageUrl: "" }],
};

function mockSimilarSuccess() {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(similarData), { status: 200 })
  );
}

describe("useLibraryRecommendations", () => {
  it("returns empty recommendations while loading", () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 404 }));

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: [],
        plexLoading: true,
        libraryArtists: [],
        libraryLoading: true,
      })
    );

    expect(result.current.recommendations).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("does not fetch when both sources are empty after loading", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 404 }));

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: [],
        plexLoading: false,
        libraryArtists: [],
        libraryLoading: false,
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recommendations).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses top 3 plex artists by viewCount as seeds", async () => {
    mockSimilarSuccess();

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: plexArtists,
        plexLoading: false,
        libraryArtists: [],
        libraryLoading: false,
      })
    );

    await waitFor(() =>
      expect(result.current.recommendations.every((r) => !r.loading)).toBe(true)
    );

    const seeds = result.current.recommendations.map((r) => r.seedArtist);
    expect(seeds).toEqual(["Radiohead", "Portishead", "Massive Attack"]);
  });

  it("falls back to first 3 library artists alphabetically when no plex data", async () => {
    mockSimilarSuccess();

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: [],
        plexLoading: false,
        libraryArtists: libraryArtists,
        libraryLoading: false,
      })
    );

    await waitFor(() =>
      expect(result.current.recommendations.every((r) => !r.loading)).toBe(true)
    );

    const seeds = result.current.recommendations.map((r) => r.seedArtist);
    expect(seeds).toEqual(["Arctic Monkeys", "Blur", "Coldplay"]);
  });

  it("populates artists for each seed on success", async () => {
    mockSimilarSuccess();

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: plexArtists.slice(0, 1),
        plexLoading: false,
        libraryArtists: [],
        libraryLoading: false,
      })
    );

    await waitFor(() =>
      expect(result.current.recommendations[0]?.loading).toBe(false)
    );

    expect(result.current.recommendations[0].artists).toEqual(
      similarData.artists
    );
    expect(result.current.recommendations[0].error).toBeNull();
  });

  it("sets error per entry when fetch fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
      })
    );

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: plexArtists.slice(0, 1),
        plexLoading: false,
        libraryArtists: [],
        libraryLoading: false,
      })
    );

    await waitFor(() =>
      expect(result.current.recommendations[0]?.loading).toBe(false)
    );

    expect(result.current.recommendations[0].error).toBe("API key required");
    expect(result.current.recommendations[0].artists).toEqual([]);
  });

  it("waits until both plexLoading and libraryLoading are false before fetching", () => {
    vi.mocked(fetch).mockResolvedValue(new Response("", { status: 404 }));

    const { result } = renderHook(() =>
      useLibraryRecommendations({
        plexTopArtists: plexArtists,
        plexLoading: true,
        libraryArtists: libraryArtists,
        libraryLoading: false,
      })
    );

    expect(result.current.recommendations).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
