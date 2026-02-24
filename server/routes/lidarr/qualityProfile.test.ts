import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetQualityProfiles = vi.fn();

vi.mock("../../services/lidarr/profiles", () => ({
  getQualityProfiles: (...args: unknown[]) => mockGetQualityProfiles(...args),
}));

import express from "express";
import request from "supertest";
import qualityProfileRouter from "./qualityProfile";

const app = express();
app.use("/", qualityProfileRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /qualityprofiles", () => {
  it("returns 200 with data from service", async () => {
    const profiles = [
      { id: 1, name: "Any" },
      { id: 2, name: "Lossless" },
    ];
    mockGetQualityProfiles.mockResolvedValue(profiles);

    const res = await request(app).get("/qualityprofiles");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(profiles);
  });

  it("returns data even when service returns error data", async () => {
    mockGetQualityProfiles.mockResolvedValue({ error: "internal" });

    const res = await request(app).get("/qualityprofiles");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: "internal" });
  });
});
