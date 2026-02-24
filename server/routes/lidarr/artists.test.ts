import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetArtistList = vi.fn();

vi.mock("../../services/lidarr/artists", () => ({
  getArtistList: (...args: unknown[]) => mockGetArtistList(...args),
}));

import express from "express";
import request from "supertest";
import artistsRouter from "./artists";

const app = express();
app.use("/", artistsRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /artists", () => {
  it("returns mapped artist list on success", async () => {
    mockGetArtistList.mockResolvedValue({
      ok: true,
      data: [
        { id: 1, name: "Radiohead", foreignArtistId: "mbid-1" },
        { id: 2, name: "Björk", foreignArtistId: "mbid-2" },
      ],
    });

    const res = await request(app).get("/artists");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: "Radiohead", foreignArtistId: "mbid-1" },
      { id: 2, name: "Björk", foreignArtistId: "mbid-2" },
    ]);
  });

  it("proxies error status from service", async () => {
    mockGetArtistList.mockResolvedValue({
      ok: false,
      error: "Failed to fetch artists from Lidarr",
      status: 503,
    });

    const res = await request(app).get("/artists");
    expect(res.status).toBe(503);
    expect(res.body.error).toBe("Failed to fetch artists from Lidarr");
  });
});
