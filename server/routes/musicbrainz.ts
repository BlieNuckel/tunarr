import type { Request, Response } from "express";
import express from "express";
import rateLimiter from "../middleware/rateLimiter";
import {
  searchReleaseGroups,
  searchArtistReleaseGroups,
} from "../musicbrainzApi/releaseGroups";
import { getReleaseTracks } from "../musicbrainzApi/tracks";

const router = express.Router();

router.get("/search", rateLimiter, async (req: Request, res: Response) => {
  const { q, searchType } = req.query;
  if (typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter q is required" });
  }

  try {
    const data =
      searchType === "artist"
        ? await searchArtistReleaseGroups(q)
        : await searchReleaseGroups(q);

    res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

router.get(
  "/tracks/:releaseGroupId",
  rateLimiter,
  async (req: Request, res: Response) => {
    const { releaseGroupId } = req.params;

    try {
      const media = await getReleaseTracks(releaseGroupId as string);
      res.json({ media });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  },
);

export default router;
