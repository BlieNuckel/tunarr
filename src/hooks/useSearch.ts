import { useState, useCallback } from "react";

interface ReleaseGroup {
  id: string;
  [key: string]: unknown;
}

export default function useSearch() {
  const [results, setResults] = useState<ReleaseGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/musicbrainz/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }
      const data = await res.json();
      setResults(data["release-groups"] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
