import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetRootFolders = vi.fn();

vi.mock("../../services/lidarr/profiles", () => ({
  getRootFolders: (...args: unknown[]) => mockGetRootFolders(...args),
}));

import express from "express";
import request from "supertest";
import rootPathRouter from "./rootPath";

const app = express();
app.use("/", rootPathRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /rootfolders", () => {
  it("returns 200 with data from service", async () => {
    const folders = [{ id: 1, path: "/music" }];
    mockGetRootFolders.mockResolvedValue(folders);

    const res = await request(app).get("/rootfolders");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(folders);
  });

  it("returns data even when service returns error data", async () => {
    mockGetRootFolders.mockResolvedValue({ error: "internal" });

    const res = await request(app).get("/rootfolders");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: "internal" });
  });
});
