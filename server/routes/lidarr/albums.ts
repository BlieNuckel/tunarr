import express, { Request, Response } from "express";
import { getMonitoredAlbums } from "../../services/lidarr/albums";

const router = express.Router();

router.get("/albums", async (_req: Request, res: Response) => {
  const result = await getMonitoredAlbums();

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }

  res.json(result.data);
});

export default router;
