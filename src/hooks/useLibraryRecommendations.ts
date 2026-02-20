import { useState, useEffect } from "react";
import type {
  LibraryArtist,
  PlexTopArtist,
  SimilarArtist,
} from "./useDiscover";

const SEED_COUNT = 3;

export type RecommendationEntry = {
  seedArtist: string;
  artists: SimilarArtist[];
  loading: boolean;
  error: string | null;
};

interface UseLibraryRecommendationsProps {
  plexTopArtists: PlexTopArtist[];
  plexLoading: boolean;
  libraryArtists: LibraryArtist[];
  libraryLoading: boolean;
}

export default function useLibraryRecommendations({
  plexTopArtists,
  plexLoading,
  libraryArtists,
  libraryLoading,
}: UseLibraryRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>(
    []
  );

  useEffect(() => {
    if (plexLoading || libraryLoading) return;

    let seeds: string[];
    if (plexTopArtists.length > 0) {
      seeds = [...plexTopArtists]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, SEED_COUNT)
        .map((a) => a.name);
    } else {
      seeds = [...libraryArtists]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, SEED_COUNT)
        .map((a) => a.name);
    }

    if (seeds.length === 0) return;

    setRecommendations(
      seeds.map((seedArtist) => ({
        seedArtist,
        artists: [],
        loading: true,
        error: null,
      }))
    );

    seeds.forEach((seedArtist, index) => {
      fetch(`/api/lastfm/similar?artist=${encodeURIComponent(seedArtist)}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to fetch similar artists");
          }
          return res.json();
        })
        .then((data) => {
          setRecommendations((prev) =>
            prev.map((entry, i) =>
              i === index
                ? { ...entry, artists: data.artists, loading: false }
                : entry
            )
          );
        })
        .catch((err) => {
          setRecommendations((prev) =>
            prev.map((entry, i) =>
              i === index
                ? {
                    ...entry,
                    loading: false,
                    error:
                      err instanceof Error
                        ? err.message
                        : "Failed to fetch similar artists",
                  }
                : entry
            )
          );
        });
    });
  }, [plexLoading, libraryLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading =
    plexLoading || libraryLoading || recommendations.some((r) => r.loading);

  return { recommendations, isLoading };
}
