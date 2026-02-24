import type { Request, Response } from "express";
import express from "express";
import { getRootFolders } from "../../services/lidarr/profiles";

const router = express.Router();

router.get("/rootfolders", async (_req: Request, res: Response) => {
  const data = await getRootFolders();
  res.status(200).json(data);
});

export default router;
