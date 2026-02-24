import type { Request, Response } from "express";
import express from "express";
import { getMetadataProfiles } from "../../services/lidarr/profiles";

const router = express.Router();

router.get("/metadataprofiles", async (_req: Request, res: Response) => {
  const data = await getMetadataProfiles();
  res.status(200).json(data);
});

export default router;
