import type { Request, Response } from "express";
import express from "express";
import rateLimiter from "../middleware/rateLimiter";

const router = express.Router();

const MB_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "MusicRequester/0.1.0 (github.com/music-requester)";

interface MusicBrainzReleaseGroup {
  id: string;
  score: number;
  title: string;
  'primary-type': string;
  'first-release-date': string;
  'artist-credit': Array<{
    name: string;
    artist: {
      id: string;
      name: string;
    };
  }>;
  'secondary-types'?: string[];
}

interface MusicBrainzSearchResponse {
  'release-groups': MusicBrainzReleaseGroup[];
  count: number;
  offset: number;
}

router.get("/search", rateLimiter, async (req: Request, res: Response) => {
  const { q, searchType } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Query parameter q is required" });
  }
  
  try {
    let url: string;
    
    if (searchType === 'artist') {
      const artistUrl = `${MB_BASE}/artist/?query=${encodeURIComponent(q as string)}&limit=1&fmt=json`;
      const artistResponse = await fetch(artistUrl, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      });
      
      if (!artistResponse.ok) {
        return res.status(artistResponse.status).json({ error: `MusicBrainz returned ${artistResponse.status}` });
      }
      
      const artistData = await artistResponse.json();
      
      if (!artistData.artists || artistData.artists.length === 0) {
        return res.json({ 'release-groups': [], count: 0 });
      }
      
      const artistId = artistData.artists[0].id;
      url = `${MB_BASE}/release-group?artist=${artistId}&type=album|ep&limit=50&inc=artist-credits&fmt=json`;
    } else {
      url = `${MB_BASE}/release-group/?query=${encodeURIComponent(q as string)}&limit=20&fmt=json`;
    }
    
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `MusicBrainz returned ${response.status}` });
    }
    
    const data: MusicBrainzSearchResponse = await response.json();
    const sorted = data['release-groups'].sort((a, b) => b.score - a.score);

    res.json({
      ...data,
      'release-groups': sorted,
      count: sorted.length
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

router.get("/tracks/:releaseGroupId", rateLimiter, async (req: Request, res: Response) => {
  const { releaseGroupId } = req.params;

  try {
    const url = `${MB_BASE}/release?release-group=${releaseGroupId}&inc=recordings+media&limit=1&fmt=json`;
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `MusicBrainz returned ${response.status}` });
    }

    const data = await response.json();
    const release = data.releases?.[0];

    if (!release) {
      return res.json({ media: [] });
    }

    const media = (release.media || []).map((m: { position: number; format: string; title: string; tracks: Array<{ position: number; title: string; recording: { title: string }; length: number | null }> }) => ({
      position: m.position,
      format: m.format || "",
      title: m.title || "",
      tracks: (m.tracks || []).map((t) => ({
        position: t.position,
        title: t.recording?.title || t.title,
        length: t.length,
      })),
    }));

    res.json({ media });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

export default router;