import { useState, useCallback } from "react";

type LidarrState =
  | "idle"
  | "requesting"
  | "removing"
  | "artist_not_in_library"
  | "album_not_in_library"
  | "already_unmonitored"
  | "success"
  | "pending"
  | "already_monitored"
  | "error";

export default function useLidarr() {
  const [state, setState] = useState<LidarrState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestAlbum = useCallback(
    async ({ albumMbid }: { albumMbid: string }) => {
      setState("requesting");
      setErrorMsg(null);

      try {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumMbid }),
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error (${res.status})`);
        }

        if (!res.ok) throw new Error(data.error || "Failed to request album");

        if (data.status === "already_monitored") {
          setState("already_monitored");
        } else if (
          data.status === "pending" ||
          data.status === "duplicate_pending"
        ) {
          setState("pending");
        } else {
          setState("success");
        }
      } catch (err) {
        setState("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to request album"
        );
      }
    },
    []
  );

  const removeFromLidarr = useCallback(
    async ({ albumMbid }: { albumMbid: string }) => {
      setState("removing");
      setErrorMsg(null);

      try {
        const res = await fetch("/api/lidarr/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumMbid }),
        });

        const text = await res.text();
        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Server error (${res.status})`);
        }

        if (!res.ok) throw new Error(data.error || "Failed to remove album");

        if (
          [
            "already_unmonitored",
            "artist_not_in_library",
            "album_not_in_library",
          ].includes(data.status)
        ) {
          setState(data.status as LidarrState);
        } else {
          setState("success");
        }
      } catch (err) {
        setState("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to remove album"
        );
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState("idle");
    setErrorMsg(null);
  }, []);

  return { state, errorMsg, requestAlbum, removeFromLidarr, reset };
}
