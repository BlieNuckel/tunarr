import { render, screen } from "@testing-library/react";
import LibraryRecommendations from "../LibraryRecommendations";
import type { RecommendationEntry } from "@/hooks/useLibraryRecommendations";

vi.mock("../ArtistResultsList", () => ({
  default: ({ artists }: { artists: { name: string }[] }) => (
    <div data-testid="artist-results-list">
      {artists.map((a) => (
        <span key={a.name}>{a.name}</span>
      ))}
    </div>
  ),
}));

const isInLibrary = () => false;

const makeEntry = (
  seedArtist: string,
  overrides: Partial<RecommendationEntry> = {}
): RecommendationEntry => ({
  seedArtist,
  artists: [{ name: "Muse", mbid: "m1", match: 0.9, imageUrl: "" }],
  loading: false,
  error: null,
  ...overrides,
});

describe("LibraryRecommendations", () => {
  it("shows loading text while loading with no entries yet", () => {
    render(
      <LibraryRecommendations
        recommendations={[]}
        isLoading={true}
        isInLibrary={isInLibrary}
      />
    );
    expect(screen.getByText(/loading recommendations/i)).toBeInTheDocument();
  });

  it("shows empty state when done loading with no results", () => {
    render(
      <LibraryRecommendations
        recommendations={[]}
        isLoading={false}
        isInLibrary={isInLibrary}
      />
    );
    expect(screen.getByText(/discover new music/i)).toBeInTheDocument();
  });

  it("shows empty state when all entries have no artists and no loading", () => {
    const entries: RecommendationEntry[] = [
      makeEntry("Radiohead", { artists: [], error: "API error" }),
      makeEntry("Portishead", { artists: [], error: null }),
    ];

    render(
      <LibraryRecommendations
        recommendations={entries}
        isLoading={false}
        isInLibrary={isInLibrary}
      />
    );
    expect(screen.getByText(/discover new music/i)).toBeInTheDocument();
  });

  it("renders a section for each entry with artists", () => {
    const entries: RecommendationEntry[] = [
      makeEntry("Radiohead"),
      makeEntry("Portishead"),
    ];

    render(
      <LibraryRecommendations
        recommendations={entries}
        isLoading={false}
        isInLibrary={isInLibrary}
      />
    );

    expect(screen.getByText("Radiohead")).toBeInTheDocument();
    expect(screen.getByText("Portishead")).toBeInTheDocument();
    expect(screen.getAllByTestId("artist-results-list")).toHaveLength(2);
  });

  it("shows loading placeholder for entries still loading", () => {
    const entries: RecommendationEntry[] = [
      makeEntry("Radiohead", { loading: true, artists: [] }),
    ];

    render(
      <LibraryRecommendations
        recommendations={entries}
        isLoading={true}
        isInLibrary={isInLibrary}
      />
    );

    expect(screen.getByText("Radiohead")).toBeInTheDocument();
    expect(screen.getByText(/loading…/i)).toBeInTheDocument();
    expect(screen.queryByTestId("artist-results-list")).not.toBeInTheDocument();
  });

  it("skips entries with errors or empty artists", () => {
    const entries: RecommendationEntry[] = [
      makeEntry("Radiohead"),
      makeEntry("Portishead", { artists: [], error: "API error" }),
    ];

    render(
      <LibraryRecommendations
        recommendations={entries}
        isLoading={false}
        isInLibrary={isInLibrary}
      />
    );

    expect(screen.getByText("Radiohead")).toBeInTheDocument();
    expect(screen.queryByText("Portishead")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("artist-results-list")).toHaveLength(1);
  });

  it("passes only first 6 artists to ArtistResultsList", () => {
    const manyArtists = Array.from({ length: 10 }, (_, i) => ({
      name: `Artist ${i}`,
      mbid: `m${i}`,
      match: 0.5,
      imageUrl: "",
    }));

    render(
      <LibraryRecommendations
        recommendations={[makeEntry("Radiohead", { artists: manyArtists })]}
        isLoading={false}
        isInLibrary={isInLibrary}
      />
    );

    const list = screen.getByTestId("artist-results-list");
    expect(list.querySelectorAll("span")).toHaveLength(6);
  });
});
