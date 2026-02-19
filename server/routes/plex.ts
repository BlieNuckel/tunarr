import type { Request, Response } from "express";
import express from "express";
import { getConfig } from "../config";

const router = express.Router();

type PlexSection = {
  key: string;
  type: string;
  title: string;
};

type PlexArtistMetadata = {
  title: string;
  viewCount: number;
  thumb: string;
  Genre: { tag: string }[];
};

type PlexSectionsResponse = {
  MediaContainer: { Directory: PlexSection[] };
};

type PlexArtistsResponse = {
  MediaContainer: { Metadata: PlexArtistMetadata[] };
};

const getPlexConfig = () => {
  const config = getConfig();
  if (!config.plexUrl || !config.plexToken) {
    throw new Error("Plex URL and token not configured");
  }
  return {
    baseUrl: config.plexUrl.replace(/\/+$/, ""),
    headers: {
      "X-Plex-Token": config.plexToken,
      Accept: "application/json",
    },
  };
};

/** Find the first music library section key */
const getMusicSectionKey = async (baseUrl: string, headers: Record<string, string>): Promise<string> => {
  const res = await fetch(`${baseUrl}/library/sections`, { headers });
  if (!res.ok) throw new Error(`Plex returned ${res.status}`);

  const data: PlexSectionsResponse = await res.json();
  const sections = data.MediaContainer?.Directory || [];
  const musicSection = sections.find((s) => s.type === "artist");
  if (!musicSection) throw new Error("No music library found in Plex");
  return musicSection.key;
};

router.get("/top-artists", async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;

  try {
    const { baseUrl, headers } = getPlexConfig();
    const sectionKey = await getMusicSectionKey(baseUrl, headers);

    const url = `${baseUrl}/library/sections/${sectionKey}/all?type=8&sort=viewCount:desc&X-Plex-Container-Start=0&X-Plex-Container-Size=${limit}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Plex returned ${response.status}` });
    }

    const data: PlexArtistsResponse = await response.json();
    const metadata = data.MediaContainer?.Metadata || [];

    const artists = metadata
      .filter((a) => a.viewCount > 0)
      .map((a) => ({
        name: a.title,
        viewCount: a.viewCount || 0,
        thumb: a.thumb
          ? `${baseUrl}${a.thumb}?X-Plex-Token=${getConfig().plexToken}`
          : "",
        genres: (a.Genre || []).map((g) => g.tag),
      }));

    res.json({ artists });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
