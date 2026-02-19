import type { Request, Response } from "express";
import express from "express";
import { getTopArtists } from "../plexApi/topArtists";

const router = express.Router();

router.get("/top-artists", async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;

  try {
    const artists = await getTopArtists(limit);
    res.json({ artists });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
