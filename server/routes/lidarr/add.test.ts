import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetAlbumByMbid = vi.fn();
const mockRemoveAlbum = vi.fn();
const mockFulfillRequest = vi.fn();

vi.mock("../../services/lidarr/helpers", () => ({
  getAlbumByMbid: (...args: unknown[]) => mockGetAlbumByMbid(...args),
  removeAlbum: (...args: unknown[]) => mockRemoveAlbum(...args),
}));

vi.mock("../../services/requests/fulfillRequest", () => ({
  fulfillRequest: (...args: unknown[]) => mockFulfillRequest(...args),
}));

import express from "express";
import request from "supertest";
import addRouter from "./add";

const app = express();
app.use(express.json());
app.use("/", addRouter);
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

describe("POST /add", () => {
  it("returns 400 when albumMbid is missing", async () => {
    const res = await request(app).post("/add").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("albumMbid is required");
  });

  it("returns success when fulfillRequest succeeds", async () => {
    mockFulfillRequest.mockResolvedValue({
      status: "success",
      artistName: "Artist",
      albumTitle: "Album",
    });

    const res = await request(app).post("/add").send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(mockFulfillRequest).toHaveBeenCalledWith("mbid-1");
  });

  it("returns already_monitored when album is already monitored", async () => {
    mockFulfillRequest.mockResolvedValue({
      status: "already_monitored",
      artistName: "Artist",
      albumTitle: "Album",
    });

    const res = await request(app).post("/add").send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("already_monitored");
  });

  it("returns 500 when fulfillRequest throws", async () => {
    mockFulfillRequest.mockRejectedValue(
      new Error("Could not determine artist from album lookup")
    );

    const res = await request(app).post("/add").send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(500);
    expect(res.body.error).toContain("Could not determine artist");
  });
});

describe("POST /remove", () => {
  it("returns 400 when albumMbid is missing", async () => {
    const res = await request(app).post("/remove").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("albumMbid is required");
  });

  it("returns 404 when album has no foreignArtistId", async () => {
    mockGetAlbumByMbid.mockResolvedValue({ artist: {} });

    const res = await request(app)
      .post("/remove")
      .send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Could not determine artist");
  });

  it("returns artist_not_in_library when artist is not in Lidarr", async () => {
    mockGetAlbumByMbid.mockResolvedValue({
      artist: { foreignArtistId: "artist-mbid" },
    });
    mockRemoveAlbum.mockResolvedValue({ artistInLibrary: false });

    const res = await request(app)
      .post("/remove")
      .send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("artist_not_in_library");
  });

  it("returns album_not_in_library when album is not in Lidarr", async () => {
    mockGetAlbumByMbid.mockResolvedValue({
      artist: { foreignArtistId: "artist-mbid" },
    });
    mockRemoveAlbum.mockResolvedValue({
      artistInLibrary: true,
      albumInLibrary: false,
    });

    const res = await request(app)
      .post("/remove")
      .send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("album_not_in_library");
  });

  it("returns already_unmonitored when album is already unmonitored", async () => {
    mockGetAlbumByMbid.mockResolvedValue({
      artist: { foreignArtistId: "artist-mbid" },
    });
    mockRemoveAlbum.mockResolvedValue({
      artistInLibrary: true,
      albumInLibrary: true,
      alreadyUnmonitored: true,
    });

    const res = await request(app)
      .post("/remove")
      .send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("already_unmonitored");
  });

  it("returns success when album is unmonitored", async () => {
    mockGetAlbumByMbid.mockResolvedValue({
      artist: { foreignArtistId: "artist-mbid" },
    });
    mockRemoveAlbum.mockResolvedValue({
      artistInLibrary: true,
      albumInLibrary: true,
      alreadyUnmonitored: false,
    });

    const res = await request(app)
      .post("/remove")
      .send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("returns 500 when removeAlbum throws", async () => {
    mockGetAlbumByMbid.mockResolvedValue({
      artist: { foreignArtistId: "artist-mbid" },
    });
    mockRemoveAlbum.mockRejectedValue(new Error("Failed to unmonitor album"));

    const res = await request(app)
      .post("/remove")
      .send({ albumMbid: "mbid-1" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to unmonitor album");
  });
});
