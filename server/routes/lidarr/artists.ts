import express, { Request, Response } from "express";
import { getArtistList } from "../../services/lidarr/artists";

const router = express.Router();

router.get("/artists", async (_req: Request, res: Response) => {
  const result = await getArtistList();

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json(result.data);
});

export default router;
