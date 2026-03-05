import express, { type Request, type Response } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requirePermission } from "../middleware/requirePermission";
import { Permission } from "../../shared/permissions";
import {
  createRequest,
  approveRequest,
  declineRequest,
  getRequests,
} from "../services/requests/requestService";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  requirePermission(Permission.REQUEST),
  async (req: Request, res: Response) => {
    const { albumMbid } = req.body;

    if (!albumMbid) {
      return res.status(400).json({ error: "albumMbid is required" });
    }

    const result = await createRequest(
      req.user!.id,
      req.user!.permissions,
      albumMbid
    );

    res.json(result);
  }
);

router.get("/", async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const userId = req.query.userId ? Number(req.query.userId) : undefined;

  const requests = await getRequests({ status, userId });

  const sanitized = requests.map((r) => ({
    id: r.id,
    albumMbid: r.album_mbid,
    artistName: r.artist_name,
    albumTitle: r.album_title,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    approvedAt: r.approved_at,
    user: r.user
      ? {
          id: r.user.id,
          username: r.user.username ?? r.user.plex_username,
          thumb: r.user.plex_thumb,
        }
      : null,
  }));

  res.json(sanitized);
});

router.post(
  "/:id/approve",
  requirePermission(Permission.MANAGE_REQUESTS),
  async (req: Request, res: Response) => {
    const requestId = Number(req.params.id);
    const result = await approveRequest(requestId, req.user!.id);

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(result);
  }
);

router.post(
  "/:id/decline",
  requirePermission(Permission.MANAGE_REQUESTS),
  async (req: Request, res: Response) => {
    const requestId = Number(req.params.id);
    const result = await declineRequest(requestId);

    if (result.status === "not_found") {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(result);
  }
);

export default router;
