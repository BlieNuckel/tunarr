import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetWantedMissing = vi.fn();

vi.mock("../../services/lidarr/wanted", () => ({
  getWantedMissing: (...args: unknown[]) => mockGetWantedMissing(...args),
}));

import express from "express";
import request from "supertest";
import wantedRouter from "./wanted";

const app = express();
app.use("/", wantedRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

const mockData = {
  page: 1,
  pageSize: 20,
  totalRecords: 1,
  records: [{ id: 1, title: "OK Computer" }],
};

describe("GET /wanted/missing", () => {
  it("passes default page and pageSize to service", async () => {
    mockGetWantedMissing.mockResolvedValue({ status: 200, data: mockData });

    await request(app).get("/wanted/missing");

    expect(mockGetWantedMissing).toHaveBeenCalledWith(1, 20);
  });

  it("forwards page and pageSize from request query", async () => {
    mockGetWantedMissing.mockResolvedValue({ status: 200, data: mockData });

    await request(app).get("/wanted/missing?page=2&pageSize=50");

    expect(mockGetWantedMissing).toHaveBeenCalledWith("2", "50");
  });

  it("proxies status and data from service", async () => {
    mockGetWantedMissing.mockResolvedValue({ status: 200, data: mockData });

    const res = await request(app).get("/wanted/missing");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
  });
});
