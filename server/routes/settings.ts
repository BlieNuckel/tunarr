import type { Request, Response } from "express";
import express from "express";
import { getConfig, setConfig } from "../config";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  const fullConfig = getConfig();

  res.json({
    ...fullConfig,
    lidarrApiKey: fullConfig.lidarrApiKey.slice(0, 4) + "****",
  });
});

router.put("/", (req: Request, res: Response) => {
  const partialConfig = req.body;

  setConfig(partialConfig);

  res.json({ success: true });
});

router.post("/test", async (req: Request, res: Response) => {
  const { lidarrUrl, lidarrApiKey } = req.body;
  if (!lidarrUrl || !lidarrApiKey) {
    return res.status(400).json({ error: "URL and API key are required" });
  }
  try {
    const url = lidarrUrl.replace(/\/+$/, "");
    const response = await fetch(`${url}/api/v1/system/status`, {
      headers: { "X-Api-Key": lidarrApiKey },
    });
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Lidarr returned ${response.status}` });
    }
    const data = await response.json();
    res.json({ success: true, version: data.version });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

export default router;
