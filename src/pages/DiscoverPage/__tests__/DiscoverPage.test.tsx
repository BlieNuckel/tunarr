import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DiscoverPage from "../DiscoverPage";

const mockFetchSimilar = vi.fn();
const mockFetchTagArtists = vi.fn();

vi.mock("@/hooks/useDiscover", () => ({
  default: () => ({
    libraryArtists: [
      { id: 1, name: "Radiohead", foreignArtistId: "a1" },
    ],
    libraryLoading: false,
    plexTopArtists: [
      { name: "Pink Floyd", viewCount: 80, thumb: "" },
    ],
    plexLoading: false,
    autoSelectedArtist: "Pink Floyd",
    similarArtists: [
      { name: "Muse", mbid: "m1", match: 0.8, imageUrl: "" },
    ],
    similarLoading: false,
    similarError: null,
    artistTags: [{ name: "rock", count: 100 }],
    tagsLoading: false,
    tagArtists: [],
    tagArtistsLoading: false,
    tagArtistsError: null,
    tagPagination: { page: 1, totalPages: 1 },
    fetchSimilar: mockFetchSimilar,
    fetchTagArtists: mockFetchTagArtists,
  }),
}));

vi.mock("@/components/Dropdown", () => ({
  default: ({ onChange, placeholder }: { onChange: (v: string) => void; placeholder?: string }) => (
    <select data-testid="dropdown" onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      <option value="Radiohead">Radiohead</option>
    </select>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DiscoverPage", () => {
  it("renders the Discover heading", () => {
    render(<DiscoverPage />);
    expect(screen.getByText("Discover")).toBeInTheDocument();
  });

  it("renders PlexTopArtists section", () => {
    render(<DiscoverPage />);
    expect(screen.getByText("Based on your listening")).toBeInTheDocument();
    expect(screen.getByText("Pink Floyd")).toBeInTheDocument();
  });

  it("renders LibraryPicker section", () => {
    render(<DiscoverPage />);
    expect(screen.getByText("Your Library")).toBeInTheDocument();
  });

  it("renders ArtistSearchForm", () => {
    render(<DiscoverPage />);
    expect(
      screen.getByPlaceholderText("Type an artist name...")
    ).toBeInTheDocument();
  });

  it("renders tag list for selected artist", () => {
    render(<DiscoverPage />);
    expect(screen.getByText('Similar to "Pink Floyd"')).toBeInTheDocument();
    expect(screen.getByText("rock")).toBeInTheDocument();
  });

  it("calls fetchSimilar when plex artist clicked", () => {
    render(<DiscoverPage />);
    fireEvent.click(screen.getByText("Pink Floyd"));
    expect(mockFetchSimilar).toHaveBeenCalledWith("Pink Floyd");
  });

  it("calls fetchSimilar when search form submitted", () => {
    render(<DiscoverPage />);
    const input = screen.getByPlaceholderText("Type an artist name...");
    fireEvent.change(input, { target: { value: "Muse" } });
    fireEvent.submit(input.closest("form")!);
    expect(mockFetchSimilar).toHaveBeenCalledWith("Muse");
  });

  it("calls fetchTagArtists when tag clicked", () => {
    render(<DiscoverPage />);
    fireEvent.click(screen.getByText("rock"));
    expect(mockFetchTagArtists).toHaveBeenCalledWith("rock");
  });
});
