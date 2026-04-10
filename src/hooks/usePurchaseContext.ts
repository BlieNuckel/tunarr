import { useState, useCallback } from "react";

export type Recommendation = "buy" | "request" | "neutral";

export type Signal = {
  factor: string;
  recommendation: Recommendation;
  reason: string;
};

export type LabelInfo = {
  name: string;
  mbid: string;
};

export type PurchaseContext = {
  recommendation: Recommendation;
  signals: Signal[];
  label: LabelInfo | null;
};

export default function usePurchaseContext() {
  const [context, setContext] = useState<PurchaseContext | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchContext = useCallback(async (releaseGroupId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/musicbrainz/purchase-context/${releaseGroupId}`
      );
      if (res.ok) {
        const data: PurchaseContext = await res.json();
        setContext(data);
      } else {
        setContext(null);
      }
    } catch {
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setContext(null);
  }, []);

  return { context, loading, fetchContext, reset };
}
