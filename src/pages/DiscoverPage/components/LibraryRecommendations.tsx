import type { RecommendationEntry } from "@/hooks/useLibraryRecommendations";
import ArtistResultsList from "./ArtistResultsList";

const ARTISTS_PER_SECTION = 6;

interface LibraryRecommendationsProps {
  recommendations: RecommendationEntry[];
  isLoading: boolean;
  isInLibrary: (name: string, mbid?: string) => boolean;
}

export default function LibraryRecommendations({
  recommendations,
  isLoading,
  isInLibrary,
}: LibraryRecommendationsProps) {
  if (isLoading && recommendations.length === 0) {
    return (
      <div className="mt-8 text-gray-400 text-sm">Loading recommendations…</div>
    );
  }

  const hasAnyResults = recommendations.some((r) => r.artists.length > 0);

  if (!isLoading && !hasAnyResults) {
    return (
      <div className="mt-16 flex flex-col items-center text-gray-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-500">Discover new music</p>
        <p className="mt-1">
          Select an artist from your library or search for one to find similar
          music.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-8">
      {recommendations.map((rec) => {
        if (rec.loading) {
          return (
            <div key={rec.seedArtist}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Because you listen to{" "}
                <span className="text-gray-700">{rec.seedArtist}</span>
              </h2>
              <p className="text-gray-400 text-sm">Loading…</p>
            </div>
          );
        }

        if (rec.error || rec.artists.length === 0) return null;

        return (
          <div key={rec.seedArtist}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Because you listen to{" "}
              <span className="text-gray-700">{rec.seedArtist}</span>
            </h2>
            <ArtistResultsList
              artists={rec.artists.slice(0, ARTISTS_PER_SECTION)}
              isInLibrary={isInLibrary}
            />
          </div>
        );
      })}
    </div>
  );
}
