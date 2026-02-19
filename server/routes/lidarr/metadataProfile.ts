import type { Request, Response } from "express";
import express from "express";
import { lidarrGet } from "../../lidarrApi/get.js";
import { LidarrMetadataProfile } from "../../lidarrApi/types";

const router = express.Router();

router.get("/metadataprofiles", async (_req: Request, res: Response) => {
  try {
    const result = await lidarrGet<LidarrMetadataProfile[]>("/metadataprofile");
    res.status(200).json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
