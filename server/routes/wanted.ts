import express, { type Request, type Response } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  addWantedItem,
  removeWantedItem,
  getWantedItems,
} from "../services/wanted/wantedService";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req: Request, res: Response) => {
  const items = await getWantedItems(req.user!.id);

  const sanitized = items.map((item) => ({
    id: item.id,
    albumMbid: item.album_mbid,
    artistName: item.artist_name,
    albumTitle: item.album_title,
    createdAt: item.created_at,
  }));

  res.json(sanitized);
});

router.post("/", async (req: Request, res: Response) => {
  const { albumMbid } = req.body;

  if (!albumMbid) {
    return res.status(400).json({ error: "albumMbid is required" });
  }

  const result = await addWantedItem(req.user!.id, albumMbid);
  res.json(result);
});

router.delete("/:albumMbid", async (req: Request, res: Response) => {
  const albumMbid = req.params.albumMbid as string;
  const result = await removeWantedItem(req.user!.id, albumMbid);

  if (result.status === "not_found") {
    return res.status(404).json({ error: "Wanted item not found" });
  }

  res.json(result);
});

export default router;
