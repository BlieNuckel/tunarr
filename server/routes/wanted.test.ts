import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAddWantedItem = vi.fn();
const mockRemoveWantedItem = vi.fn();
const mockGetWantedItems = vi.fn();

vi.mock("../services/wanted/wantedService", () => ({
  addWantedItem: (...args: unknown[]) => mockAddWantedItem(...args),
  removeWantedItem: (...args: unknown[]) => mockRemoveWantedItem(...args),
  getWantedItems: (...args: unknown[]) => mockGetWantedItems(...args),
}));

vi.mock("../middleware/requireAuth", () => ({
  requireAuth: (req: { user: unknown }, _res: unknown, next: () => void) => {
    req.user = {
      id: 1,
      permissions: 9,
      username: "testuser",
      userType: "local",
      enabled: true,
      theme: "system",
      thumb: null,
    };
    next();
  },
}));

import express from "express";
import request from "supertest";
import wantedRouter from "./wanted";

const app = express();
app.use(express.json());
app.use("/", wantedRouter);
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    res.status(500).json({ error: err.message });
  }
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /", () => {
  it("returns sanitized wanted items for current user", async () => {
    mockGetWantedItems.mockResolvedValue([
      {
        id: 1,
        album_mbid: "mbid-1",
        artist_name: "Artist",
        album_title: "Album",
        created_at: "2024-01-01",
      },
    ]);

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 1,
        albumMbid: "mbid-1",
        artistName: "Artist",
        albumTitle: "Album",
        createdAt: "2024-01-01",
      },
    ]);
    expect(mockGetWantedItems).toHaveBeenCalledWith(1);
  });
});

describe("POST /", () => {
  it("returns 400 when albumMbid is missing", async () => {
    const res = await request(app).post("/").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("albumMbid is required");
  });

  it("adds item to wanted list", async () => {
    mockAddWantedItem.mockResolvedValue({ status: "added", id: 10 });

    const res = await request(app).post("/").send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "added", id: 10 });
    expect(mockAddWantedItem).toHaveBeenCalledWith(1, "mbid-1");
  });

  it("returns already_wanted when item exists", async () => {
    mockAddWantedItem.mockResolvedValue({ status: "already_wanted", id: 5 });

    const res = await request(app).post("/").send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("already_wanted");
  });
});

describe("DELETE /:albumMbid", () => {
  it("returns 404 when item not found", async () => {
    mockRemoveWantedItem.mockResolvedValue({ status: "not_found" });

    const res = await request(app).delete("/mbid-1");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Wanted item not found");
  });

  it("removes item from wanted list", async () => {
    mockRemoveWantedItem.mockResolvedValue({ status: "removed" });

    const res = await request(app).delete("/mbid-1");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("removed");
    expect(mockRemoveWantedItem).toHaveBeenCalledWith(1, "mbid-1");
  });
});
