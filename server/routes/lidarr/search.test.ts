import { describe, it, expect, vi, beforeEach } from "vitest";

const mockTriggerAlbumSearch = vi.fn();

vi.mock("../../services/lidarr/search", () => ({
  triggerAlbumSearch: (...args: unknown[]) => mockTriggerAlbumSearch(...args),
}));

import express from "express";
import request from "supertest";
import searchRouter from "./search";

const app = express();
app.use(express.json());
app.use("/", searchRouter);
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

describe("POST /search", () => {
  it("returns 400 when albumIds is missing", async () => {
    const res = await request(app).post("/search").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("albumIds must be a non-empty array");
  });

  it("returns 400 when albumIds is an empty array", async () => {
    const res = await request(app).post("/search").send({ albumIds: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("albumIds must be a non-empty array");
  });

  it("returns 400 when albumIds is not an array", async () => {
    const res = await request(app).post("/search").send({ albumIds: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("albumIds must be a non-empty array");
  });

  it("calls triggerAlbumSearch and returns success", async () => {
    mockTriggerAlbumSearch.mockResolvedValue({ ok: true });

    const res = await request(app)
      .post("/search")
      .send({ albumIds: [10, 20] });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(mockTriggerAlbumSearch).toHaveBeenCalledWith([10, 20]);
  });

  it("returns 500 when triggerAlbumSearch throws", async () => {
    mockTriggerAlbumSearch.mockRejectedValue(new Error("Lidarr unavailable"));

    const res = await request(app)
      .post("/search")
      .send({ albumIds: [1] });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Lidarr unavailable");
  });
});
