import { useState, useEffect, useCallback } from "react";
import type { WantedItem } from "@/types";

export default function useWantedList() {
  const [items, setItems] = useState<WantedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/wanted");
      if (!res.ok) throw new Error("Failed to load wanted list");
      const data: WantedItem[] = await res.json();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wanted list"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const removeItem = useCallback(async (albumMbid: string) => {
    try {
      const res = await fetch(`/api/wanted/${encodeURIComponent(albumMbid)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.albumMbid !== albumMbid));
      }
    } catch {
      // Silently fail — user can retry
    }
  }, []);

  return { items, loading, error, removeItem, refresh: fetchItems };
}
