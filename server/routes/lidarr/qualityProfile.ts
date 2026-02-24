import type { Request, Response } from "express";
import express from "express";
import { getQualityProfiles } from "../../services/lidarr/profiles";

const router = express.Router();

router.get("/qualityprofiles", async (_req: Request, res: Response) => {
  const data = await getQualityProfiles();
  res.status(200).json(data);
});

export default router;
