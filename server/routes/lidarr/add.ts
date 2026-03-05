import express, { Request, Response } from "express";
import {
  getAlbumByMbid,
  removeAlbum,
} from "../../services/lidarr/helpers";
import { fulfillRequest } from "../../services/requests/fulfillRequest";

const router = express.Router();

router.post("/add", async (req: Request, res: Response) => {
  const { albumMbid } = req.body;
  if (!albumMbid) {
    return res.status(400).json({ error: "albumMbid is required" });
  }

  const result = await fulfillRequest(albumMbid);
  res.json({ status: result.status === "already_monitored" ? "already_monitored" : "success" });
});

router.post("/remove", async (req: Request, res: Response) => {
  const { albumMbid } = req.body;

  if (!albumMbid) {
    return res.status(400).json({ error: "albumMbid is required" });
  }

  const lookupAlbum = await getAlbumByMbid(albumMbid);
  const artistMbid = lookupAlbum.artist?.foreignArtistId;

  if (!artistMbid) {
    return res
      .status(404)
      .json({ error: "Could not determine artist from album lookup" });
  }

  const result = await removeAlbum(albumMbid, artistMbid);

  if (!result.artistInLibrary) {
    return res.json({ status: "artist_not_in_library" });
  }

  if (!result.albumInLibrary) {
    return res.json({ status: "album_not_in_library" });
  }

  if (result.alreadyUnmonitored) {
    return res.json({ status: "already_unmonitored" });
  }

  res.json({ status: "success" });
});

export default router;
