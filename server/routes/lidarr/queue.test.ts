import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetLidarrQueue = vi.fn();

vi.mock("../../services/lidarr/queue", () => ({
  getLidarrQueue: (...args: unknown[]) => mockGetLidarrQueue(...args),
}));

import express from "express";
import request from "supertest";
import queueRouter from "./queue";

const app = express();
app.use("/", queueRouter);

beforeEach(() => {
  vi.clearAllMocks();
});

const mockData = {
  page: 1,
  pageSize: 20,
  totalRecords: 0,
  records: [],
};

describe("GET /queue", () => {
  it("passes default page and pageSize to service", async () => {
    mockGetLidarrQueue.mockResolvedValue({ status: 200, data: mockData });

    await request(app).get("/queue");

    expect(mockGetLidarrQueue).toHaveBeenCalledWith(1, 20);
  });

  it("forwards page and pageSize from request query", async () => {
    mockGetLidarrQueue.mockResolvedValue({ status: 200, data: mockData });

    await request(app).get("/queue?page=2&pageSize=10");

    expect(mockGetLidarrQueue).toHaveBeenCalledWith("2", "10");
  });

  it("proxies status and data from service", async () => {
    mockGetLidarrQueue.mockResolvedValue({ status: 200, data: mockData });

    const res = await request(app).get("/queue");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);
  });
});
