import { useState, useCallback } from "react";
import { Medium } from "../types";

export default function useReleaseTracks() {
  const [media, setMedia] = useState<Medium[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async (releaseGroupId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/musicbrainz/tracks/${releaseGroupId}`);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch tracks");
      }

      const data = await res.json();
      setMedia(data.media || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tracks");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { media, loading, error, fetchTracks };
}
