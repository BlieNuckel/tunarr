import type { Request, Response } from "express";
import express from "express";
import { lidarrGet } from "../../lidarrApi/get.js";
import { LidarrQualityProfile } from "../../lidarrApi/types";

const router = express.Router();

router.get("/qualityprofiles", async (_req: Request, res: Response) => {
  try {
    const result = await lidarrGet<LidarrQualityProfile[]>("/qualityprofile");
    res.status(200).json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
